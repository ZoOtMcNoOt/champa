#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { execFile as execFileCb } from "node:child_process";
import { promisify } from "node:util";

const execFile = promisify(execFileCb);

const projectRoot = process.cwd();
const manifestPath = path.join(projectRoot, "content", "media-manifest.json");
const outputPath = path.join(projectRoot, "content", "captions.generated.json");
const statePath = path.join(projectRoot, "scripts", "state.json");
const mediaDir = path.join(projectRoot, "champa-resources");
const thumbnailDir = path.join(projectRoot, "scripts", "video_thumbnails");

const apiKey = process.env.OPENAI_API_KEY;
const model = process.env.OPENAI_VISION_MODEL || "gpt-4.1-mini";

function parseArgs(argv) {
  const options = {
    detail: "low",
    limit: Number.POSITIVE_INFINITY,
    startAt: 0
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--detail" && argv[i + 1]) {
      options.detail = argv[i + 1];
      i += 1;
    } else if (arg === "--limit" && argv[i + 1]) {
      options.limit = Number.parseInt(argv[i + 1], 10);
      i += 1;
    } else if (arg === "--start-at" && argv[i + 1]) {
      options.startAt = Number.parseInt(argv[i + 1], 10);
      i += 1;
    } else if (arg === "--help") {
      console.log("Usage: node scripts/generate-captions.mjs [--detail low|high] [--limit N] [--start-at N]");
      process.exit(0);
    }
  }
  return options;
}

async function readJson(filePath, fallbackValue) {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return fallbackValue;
  }
}

async function writeJson(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

async function imageToBase64(filePath) {
  const buffer = await fs.readFile(filePath);
  return buffer.toString("base64");
}

function extensionToMime(ext) {
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".png") return "image/png";
  return "application/octet-stream";
}

async function hasFfmpeg() {
  try {
    await execFile("ffmpeg", ["-version"]);
    return true;
  } catch {
    return false;
  }
}

async function videoFrameToImage(videoPath, outputFile) {
  await fs.mkdir(path.dirname(outputFile), { recursive: true });
  await execFile("ffmpeg", [
    "-y",
    "-i",
    videoPath,
    "-frames:v",
    "1",
    "-q:v",
    "3",
    "-vf",
    "scale='min(1024,iw)':-2",
    outputFile
  ]);
}

function normalizeCaptionObject(raw, filename) {
  const shortCaption = String(raw.shortCaption || "").trim();
  const blogSnippet = String(raw.blogSnippet || "").trim();
  const moodTags = Array.isArray(raw.moodTags)
    ? raw.moodTags
        .map((tag) => String(tag).trim().toLowerCase())
        .filter(Boolean)
        .slice(0, 5)
    : [];

  let confidence = Number(raw.confidence);
  if (!Number.isFinite(confidence)) confidence = 0.5;
  confidence = Math.max(0, Math.min(1, confidence));

  return {
    filename,
    shortCaption:
      shortCaption || "I made one more precious memory with my human and looked very cuddly while doing it.",
    blogSnippet:
      blogSnippet ||
      "Dear diary, I spent this moment being soft, sweet, and slightly dramatic, which is my most natural state.",
    moodTags: moodTags.length > 0 ? moodTags : ["cozy", "loved"],
    confidence
  };
}

function tryParseJsonObject(text) {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1));
    }
    throw new Error("Model output was not valid JSON");
  }
}

async function requestCaption({ base64, mimeType, filename, detail }) {
  const body = {
    model,
    response_format: { type: "json_object" },
    temperature: 0.4,
    max_tokens: 260,
    messages: [
      {
        role: "system",
        content:
          "You are Champa the cat. Write affectionate first-person lines for a private valentine memory site. Keep it sweet, playful, and concise."
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text:
              "Describe this memory from Champa's perspective. Return strict JSON with keys: shortCaption (1 sentence), blogSnippet (2-3 sentences), moodTags (array of 2-5 one-word tags), confidence (0..1). Filename context: " +
              filename
          },
          {
            type: "image_url",
            image_url: {
              url: `data:${mimeType};base64,${base64}`,
              detail
            }
          }
        ]
      }
    ]
  };

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${text}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content || typeof content !== "string") {
    throw new Error("OpenAI response did not contain message content.");
  }
  return tryParseJsonObject(content);
}

function createFallbackForVideo(filename) {
  return {
    filename,
    shortCaption: "I starred in a little movie scene and made the room feel extra cozy.",
    blogSnippet:
      "Dear diary, this was one of my cinematic moments. I moved with great purpose, then paused to receive admiration exactly on schedule.",
    moodTags: ["playful", "cozy", "beloved"],
    confidence: 0.35
  };
}

async function main() {
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is missing. Add it to .env.local or your shell.");
  }

  const { detail, limit, startAt } = parseArgs(process.argv.slice(2));
  const manifest = await readJson(manifestPath, []);
  if (!Array.isArray(manifest) || manifest.length === 0) {
    throw new Error("Manifest is missing or empty. Run generate:manifest first.");
  }

  const captions = await readJson(outputPath, {});
  const state = await readJson(statePath, {});
  const ffmpegReady = await hasFfmpeg();
  await fs.mkdir(thumbnailDir, { recursive: true });

  let completed = 0;
  let skipped = 0;
  let failed = 0;

  console.log(`Starting caption generation with model=${model}, detail=${detail}`);
  console.log(`Manifest items: ${manifest.length}`);
  console.log(`ffmpeg available: ${ffmpegReady ? "yes" : "no"}`);

  for (let i = startAt; i < manifest.length; i += 1) {
    if (completed >= limit) break;

    const item = manifest[i];
    const filename = item.filename;
    if (captions[filename]) {
      skipped += 1;
      continue;
    }

    const filePath = path.join(mediaDir, filename);
    process.stdout.write(`[${i + 1}/${manifest.length}] ${filename} ... `);
    try {
      if (item.kind === "video" && !ffmpegReady) {
        captions[filename] = normalizeCaptionObject(createFallbackForVideo(filename), filename);
        process.stdout.write("fallback (no ffmpeg)\n");
      } else {
        let imagePath = filePath;
        if (item.kind === "video") {
          const thumbPath = path.join(thumbnailDir, `${path.parse(filename).name}.jpg`);
          await videoFrameToImage(filePath, thumbPath);
          imagePath = thumbPath;
        }

        const ext = path.extname(imagePath).toLowerCase();
        const mimeType = extensionToMime(ext);
        const base64 = await imageToBase64(imagePath);
        const rawCaption = await requestCaption({ base64, mimeType, filename, detail });
        captions[filename] = normalizeCaptionObject(rawCaption, filename);
        process.stdout.write("ok\n");
      }

      completed += 1;
      state.lastProcessedIndex = i;
      state.lastProcessedFile = filename;
      state.updatedAt = new Date().toISOString();
      await writeJson(outputPath, captions);
      await writeJson(statePath, state);
    } catch (error) {
      failed += 1;
      process.stdout.write(`failed\n`);
      console.error(error);
    }
  }

  console.log("Done.");
  console.log(`Completed: ${completed}`);
  console.log(`Skipped existing: ${skipped}`);
  console.log(`Failed: ${failed}`);
  console.log(`Saved captions: ${Object.keys(captions).length}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
