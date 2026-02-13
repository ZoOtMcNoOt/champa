import Link from "next/link";

import { HeartfieldCanvas } from "@/components/heartfield-canvas";
import { siteCopy } from "@/content/site-copy";
import styles from "@/components/private-shell.module.css";

export function PrivateShell({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <HeartfieldCanvas seed={19871} />
      <header className={styles.topbar}>
        <div className={styles.logo}>
          <strong>Dear {siteCopy.recipientName}</strong>
          <span>From Champa's whiskery heart</span>
        </div>
        <nav className={styles.nav} aria-label="Primary">
          <Link href="/home" className={styles.link}>
            Home
          </Link>
          <Link href="/timeline" className={styles.link}>
            Timeline
          </Link>
          <Link href="/blog" className={styles.link}>
            Blog
          </Link>
        </nav>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
