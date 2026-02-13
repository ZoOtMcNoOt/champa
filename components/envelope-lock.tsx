"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { HeartfieldCanvas } from "@/components/heartfield-canvas";
import { siteCopy } from "@/content/site-copy";
import styles from "@/components/envelope-lock.module.css";

type Stage = "idle" | "submitting" | "opening";

export function EnvelopeLock() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState("");

  const isSubmitting = stage !== "idle";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setStage("submitting");

    const response = await fetch("/api/auth/unlock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });

    if (!response.ok) {
      setStage("idle");
      setError("Mrrp... that phrase is not quite right. Try again, sweetheart.");
      return;
    }

    setStage("opening");
    window.setTimeout(() => {
      router.push("/home");
    }, 1500);
  }

  return (
    <main className={styles.screen}>
      <HeartfieldCanvas seed={2142026} />
      <section className={styles.stage}>
        <header className={styles.titleWrap}>
          <p className={styles.kicker}>Private Valentine Invitation</p>
          <h1 className={`${styles.title} title-display`}>{siteCopy.heroTitle}</h1>
          <p className={styles.subtitle}>{siteCopy.invitationText}</p>
        </header>

        <div className={styles.envelopeScene}>
          <article className={`${styles.envelope} ${stage === "opening" ? styles.opening : ""}`}>
            <div className={styles.envelopeBody}>
              <div className={styles.flap} />
              <div className={styles.seal} aria-hidden>
                sealed
              </div>
            </div>
            <div className={styles.letter}>
              <p className={styles.paperText}>
                Dear {siteCopy.recipientName}, I tucked all of my best memories in this letter just for you.
                Type the secret phrase and I will open it with my most dramatic paw flourish.
              </p>
              <form className={styles.form} onSubmit={handleSubmit}>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className={styles.input}
                  placeholder="secret phrase"
                  autoComplete="current-password"
                  required
                  disabled={isSubmitting}
                />
                <button className={styles.button} type="submit" disabled={isSubmitting}>
                  {stage === "submitting" ? "Checking the seal..." : "Open my envelope"}
                </button>
              </form>
              {error ? <p className={styles.error}>{error}</p> : null}
              <p className={styles.status}>{stage === "opening" ? "Opening letter..." : ""}</p>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
