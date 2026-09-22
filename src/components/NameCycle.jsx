import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

// A worldly signature: each entry is a stylized transliteration of the same
// name into a different script, not a literal translation - the point is
// "Nauha" wearing different scripts, not eight unrelated words. Swap in
// exact native-speaker-verified spellings if you have them; the component
// itself doesn't care what the strings are, only that each has a `text`,
// a `lang` tag, and (for RTL scripts) a `dir`.
//
// `className` points at a font-family utility per script (font-display,
// font-arabic, etc.) so each renders in a face suited to that script instead
// of falling through to one generic font. Only font-display/font-arabic/
// font-hindi/font-chinese existed before - if font-japanese/font-korean/
// font-cyrillic/font-hebrew aren't defined in your Tailwind config yet,
// those four will just fall back to the browser's default font for that
// script (still fully legible, just not custom-styled) until you add them.
const variants = [
  { text: "Nauha", lang: "en", className: "font-display" },
  { text: "نوها", lang: "ar", dir: "rtl", className: "font-arabic" },
  { text: "नौहा", lang: "hi", className: "font-hindi" },
  { text: "നൗഹ", lang: "ml", className: "font-malayalam" }, // her own mother tongue - Kerala
  { text: "娜哈", lang: "zh", className: "font-chinese" },
  { text: "Nauha", lang: "fr", className: "font-display italic" },
  { text: "ナウハ", lang: "ja", className: "font-japanese" },
  { text: "나우하", lang: "ko", className: "font-korean" },
  { text: "Науха", lang: "ru", className: "font-cyrillic" },
  { text: "נאוהה", lang: "he", dir: "rtl", className: "font-hebrew" },
];

// Long enough to actually read a script you don't know, short enough to
// still feel alive - the previous 900ms was closer to a flicker than a
// reveal, especially for the denser scripts (Hindi, Arabic).
const HOLD_MS = 1500;

// One spring, reused for both the text crossfade and the container's width
// morph, so the two never feel like they're animating on separate clocks.
const SPRING = { type: "spring", stiffness: 260, damping: 26, mass: 0.9 };

export default function NameCycle() {
  const [index, setIndex] = useState(0);
  const reduceMotion = useReducedMotion();
  const hiddenRef = useRef(false);

  useEffect(() => {
    if (reduceMotion) return; // static name only - see render below
    function tick() {
      if (!hiddenRef.current) setIndex((i) => (i + 1) % variants.length);
    }
    const timer = setInterval(tick, HOLD_MS);

    // Don't spend cycles (or announce language changes) on a tab nobody's
    // looking at - pause while it's hidden, pick back up when it returns.
    function onVisibility() {
      hiddenRef.current = document.hidden;
    }
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduceMotion]);

  // Reduced motion: skip the cycling entirely rather than just slowing it
  // down - a moving multilingual marquee is exactly the kind of motion that
  // preference exists to opt out of. One name, held still.
  if (reduceMotion) {
    return (
      <span className="inline-block font-light uppercase font-display" lang="en">
        Nauha
      </span>
    );
  }

  const current = variants[index];

  return (
    // `layout` on the wrapper is what makes the container's width morph
    // smoothly as shorter/longer scripts swap in, instead of snapping - the
    // AnimatePresence child below can't do this itself since each cycle is a
    // brand-new element (different `key`), not the same one resizing.
    <motion.span
      layout
      transition={SPRING}
      className="inline-block relative align-baseline"
      aria-label="Nauha"
    >
      {/* `popLayout` lets the incoming script start animating in immediately
          while the outgoing one finishes fading out on top of it, instead of
          the old `mode="wait"`, which fully removes one before starting the
          next and reads as a small blank flicker every cycle. */}
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
          className={`inline-block font-light uppercase ${current.className}`}
        >
          {current.text}
        </motion.span>
      </AnimatePresence>
    </motion.span>
  );
}