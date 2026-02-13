#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const projectRoot = process.cwd();
const outputPath = path.join(projectRoot, "content", "media-manifest.json");
const filenamePattern = /^(?<date>\d{4}-\d{2}-\d{2})_(?<index>\d{3})\.(?<ext>jpg|jpeg|mp4)$/i;

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function resolveMediaDir() {
  const explicit = process.env.MEDIA_DIR?.trim();
  if (explicit) {
    return path.resolve(projectRoot, explicit);
  }

  const publicMediaDir = path.join(projectRoot, "public", "media");
  if (await pathExists(publicMediaDir)) {
    return publicMediaDir;
  }

  return path.join(projectRoot, "champa-resources");
}

function extensionToKind(ext) {
  return ext.toLowerCase() === "mp4" ? "video" : "image";
}

function parseFilename(filename) {
  const match = filenamePattern.exec(filename);
  if (!match || !match.groups) {
    return null;
  }

  const date = match.groups.date;
  const index = Number.parseInt(match.groups.index, 10);
  const ext = match.groups.ext.toLowerCase();
  return {
    id: `${date}-${String(index).padStart(3, "0")}`,
    filename,
    date,
    index,
    kind: extensionToKind(ext),
    src: `/media/${encodeURIComponent(filename)}`
  };
}

function sortItems(items) {
  return items.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.index - b.index;
  });
}

async function main() {
  const mediaDir = await resolveMediaDir();
  const entries = await fs.readdir(mediaDir, { withFileTypes: true });
  const items = entries
    .filter((entry) => entry.isFile())
    .map((entry) => parseFilename(entry.name))
    .filter(Boolean);

  const sorted = sortItems(items);
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, `${JSON.stringify(sorted, null, 2)}\n`, "utf8");

  const photos = sorted.filter((item) => item.kind === "image").length;
  const videos = sorted.length - photos;
  const firstDate = sorted[0]?.date || "n/a";
  const lastDate = sorted.at(-1)?.date || "n/a";

  console.log(`Manifest written: ${path.relative(projectRoot, outputPath)}`);
  console.log(`Media directory: ${path.relative(projectRoot, mediaDir)}`);
  console.log(`Items: ${sorted.length} (photos: ${photos}, videos: ${videos})`);
  console.log(`Timeline: ${firstDate} -> ${lastDate}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
