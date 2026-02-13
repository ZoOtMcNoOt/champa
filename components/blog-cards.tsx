import { getCaptionForFile, type CaptionMap } from "@/lib/captions";
import type { MediaItem } from "@/lib/types";
import styles from "@/components/blog-cards.module.css";

function toPrettyDate(date: string): string {
  const [y, m, d] = date.split("-");
  return new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function buildTitle(index: number): string {
  const titles = [
    "How I Managed Today's Cuddle Schedule",
    "Professional Nap Notes and Cozy Findings",
    "A Report on Zoomies, Treats, and Love",
    "Whisker Dispatch From My Favorite Spot",
    "An Important Statement About Being Adored"
  ];
  return titles[index % titles.length];
}

export function BlogCards({ items, captions }: { items: MediaItem[]; captions: CaptionMap }) {
  return (
    <section className={styles.stack}>
      {items.map((item, index) => {
        const caption = getCaptionForFile(captions, item.filename);
        return (
          <article key={item.id} className={`${styles.post} section-card`}>
            <header className={styles.head}>
              <h2 className={styles.title}>{buildTitle(index)}</h2>
              <p className={styles.date}>{toPrettyDate(item.date)}</p>
            </header>
            <p className={styles.body}>{caption.blogSnippet}</p>
            <div className={styles.meta}>
              {caption.moodTags.slice(0, 4).map((tag) => (
                <span key={`${item.id}-${tag}`} className={styles.chip}>
                  #{tag}
                </span>
              ))}
            </div>
          </article>
        );
      })}
    </section>
  );
}
