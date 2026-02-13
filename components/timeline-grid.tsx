import { getCaptionForFile, type CaptionMap } from "@/lib/captions";
import type { TimelineGroup } from "@/lib/types";
import styles from "@/components/timeline-grid.module.css";

function formatDate(date: string): string {
  const [year, month, day] = date.split("-");
  return new Date(Number(year), Number(month) - 1, Number(day)).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

export function TimelineGrid({ groups, captions }: { groups: TimelineGroup[]; captions: CaptionMap }) {
  return (
    <section className={styles.timelineWrap}>
      {groups.map((group) => (
        <article key={group.date} className={`${styles.dayGroup} section-card`}>
          <header className={styles.dayHeading}>
            <h2 className={styles.dateTitle}>{formatDate(group.date)}</h2>
            <span className={styles.count}>{group.items.length} memories</span>
          </header>
          <div className={styles.grid}>
            {group.items.map((item) => {
              const caption = getCaptionForFile(captions, item.filename);
              return (
                <figure key={item.id} className={styles.tile}>
                  {item.kind === "video" ? (
                    <video className={styles.media} controls preload="metadata" src={item.src} />
                  ) : (
                    <img
                      className={styles.media}
                      src={item.src}
                      alt={caption.shortCaption}
                      loading="lazy"
                      decoding="async"
                    />
                  )}
                  <figcaption className={styles.meta}>
                    <p className={styles.caption}>{caption.shortCaption}</p>
                    <div className={styles.tags}>
                      {caption.moodTags.slice(0, 3).map((tag) => (
                        <span className={styles.tag} key={`${item.id}-${tag}`}>
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </figcaption>
                </figure>
              );
            })}
          </div>
        </article>
      ))}
    </section>
  );
}
