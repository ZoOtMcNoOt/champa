import fs from "node:fs/promises";
import path from "node:path";
import { cacheLife, cacheTag } from "next/cache";

import type { CaptionEntry } from "@/lib/types";

const CAPTIONS_PATH = path.join(process.cwd(), "content", "captions.generated.json");

export type CaptionMap = Record<string, CaptionEntry>;

function normalizeCaption(entry: Partial<CaptionEntry>, filename: string): CaptionEntry {
  return {
    filename,
    shortCaption: entry.shortCaption || "I looked very adorable in this memory.",
    blogSnippet:
      entry.blogSnippet ||
      "Dear diary, I supervised my human with elegance, whiskers, and excellent snuggle judgment.",
    moodTags: Array.isArray(entry.moodTags) && entry.moodTags.length > 0 ? entry.moodTags : ["cozy", "loved"],
    confidence: typeof entry.confidence === "number" ? entry.confidence : 0.5
  };
}

export async function getCaptionMap(): Promise<CaptionMap> {
  "use cache";
  cacheLife("hours");
  cacheTag("captions");

  try {
    const raw = await fs.readFile(CAPTIONS_PATH, "utf8");
    const parsed = JSON.parse(raw) as Record<string, Partial<CaptionEntry>>;
    const result: CaptionMap = {};
    for (const [filename, value] of Object.entries(parsed || {})) {
      result[filename] = normalizeCaption(value, filename);
    }
    return result;
  } catch {
    return {};
  }
}

export function getCaptionForFile(captions: CaptionMap, filename: string): CaptionEntry {
  return normalizeCaption(captions[filename] || {}, filename);
}
