import { BlogCards } from "@/components/blog-cards";
import { getCaptionMap } from "@/lib/captions";
import { getMediaItems } from "@/lib/media";
import { siteCopy } from "@/content/site-copy";
import styles from "@/app/(private)/blog/page.module.css";

export default async function BlogPage() {
  const [media, captions] = await Promise.all([getMediaItems(), getCaptionMap()]);
  const diarySource = media.filter((item) => item.kind === "image").slice(-36).reverse();

  return (
    <section className="page-shell">
      <header className={`${styles.header} section-card`}>
        <span className="chip">Cat Blog</span>
        <h1 className={`${styles.title} title-display`}>Dear Diary, It Is Me, Champa</h1>
        <p className={styles.description}>{siteCopy.blogIntro}</p>
      </header>
      <BlogCards items={diarySource} captions={captions} />
    </section>
  );
}
