import fs from "node:fs/promises";
import path from "node:path";
import { cacheLife, cacheTag } from "next/cache";

import type { MediaItem, TimelineGroup } from "@/lib/types";

const MEDIA_NAME_PATTERN = /^(?<date>\d{4}-\d{2}-\d{2})_(?<index>\d{3})\.(?<ext>jpg|jpeg|mp4)$/i;
const MANIFEST_PATH = path.join(process.cwd(), "content", "media-manifest.json");
const MEDIA_DIR = path.join(process.cwd(), "champa-resources");

function extensionToKind(ext: string): "image" | "video" {
  return ext.toLowerCase() === "mp4" ? "video" : "image";
}

function parseFilename(name: string): MediaItem | null {
  const match = MEDIA_NAME_PATTERN.exec(name);
  if (!match?.groups) {
    return null;
  }

  const date = match.groups.date;
  const index = Number.parseInt(match.groups.index, 10);
  const ext = match.groups.ext.toLowerCase();
  return {
    id: `${date}-${index.toString().padStart(3, "0")}`,
    filename: name,
    date,
    index,
    kind: extensionToKind(ext),
    src: `/api/media/${encodeURIComponent(name)}`
  };
}

function sortMedia(items: MediaItem[]): MediaItem[] {
  return [...items].sort((a, b) => {
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }
    return a.index - b.index;
  });
}

async function readManifestFile(): Promise<MediaItem[] | null> {
  try {
    const raw = await fs.readFile(MANIFEST_PATH, "utf8");
    const parsed = JSON.parse(raw) as MediaItem[];
    if (!Array.isArray(parsed)) {
      return null;
    }
    return sortMedia(parsed);
  } catch {
    return null;
  }
}

async function readMediaDirectory(): Promise<MediaItem[]> {
  const entries = await fs.readdir(MEDIA_DIR, { withFileTypes: true });
  const parsed = entries
    .filter((entry) => entry.isFile())
    .map((entry) => parseFilename(entry.name))
    .filter((item): item is MediaItem => Boolean(item));
  return sortMedia(parsed);
}

export async function getMediaItems(): Promise<MediaItem[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("media");

  const manifest = await readManifestFile();
  if (manifest && manifest.length > 0) {
    return manifest;
  }
  return readMediaDirectory();
}

export async function getTimelineGroups(): Promise<TimelineGroup[]> {
  const items = await getMediaItems();
  const grouped = new Map<string, MediaItem[]>();

  for (const item of items) {
    const bucket = grouped.get(item.date) || [];
    bucket.push(item);
    grouped.set(item.date, bucket);
  }

  return [...grouped.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, bucket]) => ({ date, items: sortMedia(bucket) }));
}

export async function getMemoryStats() {
  const items = await getMediaItems();
  const photos = items.filter((item) => item.kind === "image").length;
  const videos = items.length - photos;
  const firstDate = items[0]?.date ?? "";
  const lastDate = items.at(-1)?.date ?? "";
  return {
    total: items.length,
    photos,
    videos,
    firstDate,
    lastDate
  };
}
