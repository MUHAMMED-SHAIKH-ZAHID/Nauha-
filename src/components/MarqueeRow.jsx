import { useRef } from "react";
import { useAnimationFrame, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

// Liquid CTA strip, fourth pass - found the actual bug behind the gap this
// time (I don't have a way to open your dev server from here to inspect it
// live, so this is from re-reading the layout logic line by line, and it's
// a real bug, not a guess):
//
// The previous version only rendered the phrase TWICE and translated by
// -50% to loop. That's seamless in principle, but only if two copies are
// wide enough to fully cover the strip. On a real full-width section (way
// wider than a short phrase at this font size), two copies run out before
// they've covered the visible area - so there's a stretch, every loop,
// where you're looking at empty space between the end of copy two and the
// start of copy one again. That empty space is the "gap"/"not full
// marquee" - it was never a timing bug, it was never enough content.
//
// Fixed by rendering the phrase REPEAT_COUNT times (10 - comfortably wider
// than any realistic section, phone to ultrawide) instead of twice, and
// looping by exactly one copy's width (-100/REPEAT_COUNT %) instead of
// -50%. Same "percentage is relative to the element's own live width, so
// it can't drift" logic as before, just with enough copies that the strip
// is never empty at any point in the loop.
//
// Also pulled the hover reveal in tighter - it was centered on the cursor
// correctly, but a 58px radius reads as "way ahead of/around the cursor"
// rather than right at it. Now 26px with a harder falloff.

const REPEAT_COUNT = 10;

export default function MarqueeRow({
  text = "AVAILABLE FOR WORK   ✦   LET'S BUILD SOMETHING GREAT   ✦   GET IN TOUCH   ✦   ",
  contactHref = "#contact",
  duration = 9, // seconds for one copy-width to scroll past
  revealRadius = 26, // px
  className = "",
}) {
  const uid = useRef(`mq-${Math.random().toString(36).slice(2, 8)}`).current;
  const stageRef = useRef(null);
  const baseRef = useRef(null);
  const overlayRef = useRef(null);
  const displaceRef = useRef(null);
  const turbRef = useRef(null);

  const reduceMotion = useReducedMotion();

  const elapsedRef = useRef(0);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const mousePos = useRef({ x: -9999, y: -9999 });

  useAnimationFrame((now, delta) => {
    if (reduceMotion) return;

    // time-driven, percentage-based loop - see note above on why this is
    // the part that finally makes the seam exact
    elapsedRef.current += delta;
    const progress = (elapsedRef.current / (duration * 1000)) % 1;
    const percent = (-(100 / REPEAT_COUNT) * progress).toFixed(3);
    const transform = `translateX(${percent}%)`;
    if (baseRef.current) baseRef.current.style.transform = transform;
    if (overlayRef.current) overlayRef.current.style.transform = transform;

    // constant, gentle water ripple on the base layer only
    const wobble = 0.022 + Math.sin(now / 1600) * 0.006;
    if (turbRef.current) {
      turbRef.current.setAttribute("baseFrequency", `${wobble.toFixed(4)} ${(wobble * 2).toFixed(4)}`);
    }
    if (displaceRef.current) {
      displaceRef.current.setAttribute("scale", "6");
    }

    // local reveal - a plain radial-gradient mask, recomputed every frame,
    // no url()/id reference anywhere
    mousePos.current.x += (mouseRef.current.x - mousePos.current.x) * 0.3;
    mousePos.current.y += (mouseRef.current.y - mousePos.current.y) * 0.3;
    if (overlayRef.current) {
      const gradient = `radial-gradient(circle ${revealRadius}px at ${mousePos.current.x}px ${mousePos.current.y}px, black 35%, transparent 85%)`;
      overlayRef.current.style.webkitMaskImage = gradient;
      overlayRef.current.style.maskImage = gradient;
    }
  });

  function onPointerMove(e) {
    const r = stageRef.current?.getBoundingClientRect();
    if (!r) return;
    mouseRef.current.x = e.clientX - r.left;
    mouseRef.current.y = e.clientY - r.top;
  }
  function onPointerLeave() {
    mouseRef.current.x = -9999;
    mouseRef.current.y = -9999;
  }

  if (reduceMotion) {
    return (
      <a
        href={contactHref}
        className={`block w-full py-3 px-4 overflow-hidden border-y border-black/10 dark:border-white/10 bg-neutral-50 dark:bg-neutral-950 transition-colors duration-500 ${className}`}
      >
        <p className="text-center font-display font-bold uppercase text-sm sm:text-base text-black dark:text-white">
          {text.replace(/\s*✦\s*/g, "  ·  ").trim()}
        </p>
      </a>
    );
  }

  return (
    <a
      ref={stageRef}
      href={contactHref}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      onPointerCancel={onPointerLeave}
      aria-label={text.replace(/\s*✦\s*/g, ", ").trim()}
      className={`group relative flex items-center w-full h-11 sm:h-14 md:h-16 py-0.5 px-0.5 overflow-hidden border-y border-black/10 dark:border-white/10 bg-neutral-50 dark:bg-neutral-950 transition-colors duration-500 cursor-pointer ${className}`}
    >
      {/* muted base layer - always visible, always gently rippling */}
      <div
        ref={baseRef}
        aria-hidden="true"
        className="flex w-max whitespace-nowrap font-display font-bold uppercase text-[clamp(1rem,3.6vw,1.7rem)] text-neutral-500/70 dark:text-neutral-300/55 will-change-transform"
        style={{ filter: `url(#${uid}-water)` }}
      >
        {Array.from({ length: REPEAT_COUNT }).map((_, i) => (
          <span key={i}>{text}</span>
        ))}
      </div>

      {/* solid black/white overlay - identical copy, same transform, only
          visible where the mask circle currently sits */}
      <div
        ref={overlayRef}
        aria-hidden="true"
        className="absolute inset-y-0 left-0 flex w-max items-center whitespace-nowrap font-display font-bold uppercase text-[clamp(1rem,3.6vw,1.7rem)] text-black dark:text-white will-change-transform"
        style={{
          WebkitMaskImage: "radial-gradient(circle 0px at -9999px -9999px, black 55%, transparent 100%)",
          maskImage: "radial-gradient(circle 0px at -9999px -9999px, black 55%, transparent 100%)",
        }}
      >
        {Array.from({ length: REPEAT_COUNT }).map((_, i) => (
          <span key={i}>{text}</span>
        ))}
      </div>

      <ArrowUpRight
        aria-hidden="true"
        size={18}
        strokeWidth={2.2}
        className="pointer-events-none absolute right-4 sm:right-5 text-black dark:text-white opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ease-out"
      />

      <svg className="absolute w-0 h-0" aria-hidden="true">
        <defs>
          <filter id={`${uid}-water`} x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
            <feTurbulence ref={turbRef} type="fractalNoise" baseFrequency="0.02 0.04" numOctaves="2" seed="5" result="noise" />
            <feDisplacementMap ref={displaceRef} in="SourceGraphic" in2="noise" scale="6" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>
    </a>
  );
}