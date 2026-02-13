"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { HeartfieldCanvas } from "@/components/heartfield-canvas";
import { siteCopy } from "@/content/site-copy";
import styles from "@/components/private-shell.module.css";

export function PrivateShell({ children }: { children: React.ReactNode }) {
  const [fromEnvelope, setFromEnvelope] = useState(false);

  useEffect(() => {
    const transitionSource = window.sessionStorage.getItem("champa-route-transition");
    if (transitionSource !== "envelope") {
      return;
    }

    window.sessionStorage.removeItem("champa-route-transition");

    const frame = window.requestAnimationFrame(() => {
      setFromEnvelope(true);
    });

    const timer = window.setTimeout(() => {
      setFromEnvelope(false);
    }, 900);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <div className={`${styles.shell} ${fromEnvelope ? styles.fromEnvelope : ""}`}>
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
