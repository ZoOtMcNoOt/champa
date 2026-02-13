import fs from "node:fs/promises";
import path from "node:path";
import { cacheLife, cacheTag } from "next/cache";

import type { MediaItem, TimelineGroup } from "@/lib/types";

const MANIFEST_PATH = path.join(process.cwd(), "content", "media-manifest.json");

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
    const normalized = parsed.map((item) => {
      if (!item.src) {
        return { ...item, src: `/media/${encodeURIComponent(item.filename)}` };
      }
      if (item.src.startsWith("/api/media/")) {
        return { ...item, src: item.src.replace("/api/media/", "/media/") };
      }
      return item;
    });
    return sortMedia(normalized);
  } catch {
    return null;
  }
}

export async function getMediaItems(): Promise<MediaItem[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("media");

  return (await readManifestFile()) ?? [];
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
