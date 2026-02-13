import { TimelineGrid } from "@/components/timeline-grid";
import { getCaptionMap } from "@/lib/captions";
import { getTimelineGroups } from "@/lib/media";
import { siteCopy } from "@/content/site-copy";
import styles from "@/app/(private)/timeline/page.module.css";

export default async function TimelinePage() {
  const [groups, captions] = await Promise.all([getTimelineGroups(), getCaptionMap()]);
  return (
    <section className="page-shell">
      <header className={`${styles.header} section-card`}>
        <span className="chip">Timeline</span>
        <h1 className={`${styles.title} title-display`}>My Chronological Cuteness</h1>
        <p className={styles.description}>{siteCopy.timelineIntro}</p>
      </header>
      <TimelineGrid groups={groups} captions={captions} />
    </section>
  );
}
