export type MediaKind = "image" | "video";

export type MediaItem = {
  id: string;
  filename: string;
  date: string;
  index: number;
  kind: MediaKind;
  src: string;
};

export type TimelineGroup = {
  date: string;
  items: MediaItem[];
};

export type CaptionEntry = {
  filename: string;
  shortCaption: string;
  blogSnippet: string;
  moodTags: string[];
  confidence: number;
};
