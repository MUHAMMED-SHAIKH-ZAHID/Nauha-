import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

// A worldly signature: each entry is a stylized transliteration of the same
// name into a different script, not a literal translation - the point is
// "Nauha" wearing different scripts, not eight unrelated words. Swap in
// exact native-speaker-verified spellings if you have them; the component
// itself doesn't care what the strings are, only that each has a `text`,
// a `lang` tag, and (for RTL scripts) a `dir`.
const variants = [
  { text: "Nauha", lang: "en", className: "font-display" },
  { text: "نوها", lang: "ar", dir: "rtl", className: "font-arabic" },
  { text: "娜哈", lang: "zh", className: "font-chinese" },
  { text: "नौहा", lang: "hi", className: "font-hindi" },
  { text: "ナウハ", lang: "ja", className: "font-japanese" },
];

const HOLD_MS = 1500;

// Apple Design §4: this is a passive, un-touched text swap, not a gesture the
// user carried momentum into - so it gets NO bounce. `bounce: 0` is
// critically damped (settles cleanly, no overshoot), and `duration: 0.4`
// matches Apple's own shipped value for a plain reposition/content change.
// The previous stiffness/damping/mass trio (260/26/0.9) was accidentally
// *under*-damped - real critical damping at that stiffness/mass would need
// damping ≈30.6, not 26 - so it was overshooting slightly on every single
// cycle without anyone asking it to.
const SPRING = { type: "spring", bounce: 0, duration: 0.4 };

export default function NameCycle() {
  const [index, setIndex] = useState(0);
  const reduceMotion = useReducedMotion();
  const hiddenRef = useRef(false);
  // Apple Design §16 (Agency): keep people in control of ongoing motion.
  // Hovering or focusing the name pauses the cycle so someone who wants to
  // actually read a script they don't recognize can - it resumes the
  // instant they move away, no separate control needed.
  const pausedRef = useRef(false);

  useEffect(() => {
    if (reduceMotion) return;
    function tick() {
      if (!hiddenRef.current && !pausedRef.current) {
        setIndex((i) => (i + 1) % variants.length);
      }
    }
    const timer = setInterval(tick, HOLD_MS);

    function onVisibility() {
      hiddenRef.current = document.hidden;
    }
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduceMotion]);

  // Reduced motion: one name, held still - a moving multilingual marquee is
  // exactly the kind of motion that preference exists to opt out of
  // (Apple Design §14).
  if (reduceMotion) {
    return (
      <span className="inline-block font-light uppercase font-display tracking-tight" lang="en">
        Nauha
      </span>
    );
  }

  const current = variants[index];

  return (
    <motion.span
      layout
      transition={SPRING}
      className="inline-block relative align-baseline cursor-default"
      aria-label="Nauha"
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; }}
      onFocus={() => { pausedRef.current = true; }}
      onBlur={() => { pausedRef.current = false; }}
      tabIndex={0}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={index}
          dir={current.dir || "ltr"}
          lang={current.lang}
          aria-hidden="true"
          initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -14, filter: "blur(6px)" }}
          transition={SPRING}
          // Apple Design §15: negative tracking on large display type - the
          // name renders at display sizes (clamp up to 5rem in Hero), and
          // letters read too far apart at that size without it. `will-change`
          // hints the compositor ahead of the blur+transform animation
          // (§1: kill every avoidable frame of latency).
          className={`inline-block font-light uppercase tracking-tight ${current.className}`}
          style={{ willChange: "transform, opacity, filter" }}
        >
          {current.text}
        </motion.span>
      </AnimatePresence>
    </motion.span>
  );
}