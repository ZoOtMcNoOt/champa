import Link from "next/link";

import { getCaptionForFile, getCaptionMap } from "@/lib/captions";
import { getMediaItems, getMemoryStats } from "@/lib/media";
import { siteCopy } from "@/content/site-copy";
import styles from "@/app/(private)/home/page.module.css";

function formatMonthDay(date: string): string {
  const [y, m, d] = date.split("-");
  return new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });
}

export default async function HomePage() {
  const [media, stats, captions] = await Promise.all([getMediaItems(), getMemoryStats(), getCaptionMap()]);
  const featured = media[Math.floor(media.length / 2)] ?? media[0];
  const featuredCaption = featured ? getCaptionForFile(captions, featured.filename) : null;

  return (
    <section className="page-shell">
      <article className={`${styles.hero} section-card`}>
        <span className="chip">Mewmory Vault</span>
        <h1 className={`${styles.title} title-display`}>{siteCopy.heroSubtitle}</h1>
        <p className={styles.subtitle}>{siteCopy.dedication}</p>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Total Memories</p>
            <p className={styles.statValue}>{stats.total}</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Photos</p>
            <p className={styles.statValue}>{stats.photos}</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Videos</p>
            <p className={styles.statValue}>{stats.videos}</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statLabel}>Timeline</p>
            <p className={styles.statValue}>
              {stats.firstDate} → {stats.lastDate}
            </p>
          </div>
        </div>
      </article>

      <section className={styles.featureGrid}>
        <article className={`${styles.featureCard} section-card`}>
          <h2 className={styles.featureTitle}>Featured Snuggle Report</h2>
          {featured ? (
            <>
              <p className={styles.featureBody}>
                <strong>{formatMonthDay(featured.date)}:</strong> {featuredCaption?.blogSnippet}
              </p>
              <div className={styles.memoryPreview}>
                {featured.kind === "video" ? (
                  <video className={styles.memoryMedia} controls preload="metadata" src={featured.src} />
                ) : (
                  <img className={styles.memoryMedia} src={featured.src} alt={featuredCaption?.shortCaption || ""} />
                )}
              </div>
            </>
          ) : (
            <p className={styles.featureBody}>I am still arranging my cutest moments for you.</p>
          )}
        </article>

        <article className={`${styles.featureCard} section-card`}>
          <h2 className={styles.featureTitle}>Fun Corner</h2>
          <p className={styles.featureBody}>
            Treat-o-meter says our love level is dangerously cozy. Click around my scrapbook and collect every whisker
            chapter.
          </p>
          <div className={styles.meter} aria-label="Treat meter">
            <div className={styles.meterFill} />
          </div>
          <p className={styles.featureBody} style={{ marginTop: "0.9rem" }}>
            Next adventure:
          </p>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.45rem" }}>
            <Link className="chip" href="/timeline">
              Browse timeline
            </Link>
            <Link className="chip" href="/blog">
              Read my diary
            </Link>
          </div>
        </article>
      </section>
    </section>
  );
}
