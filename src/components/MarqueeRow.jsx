import { useRef, useEffect, useState } from "react";
import { useAnimationFrame, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

// Liquid CTA strip, fifth pass - the "stuck/slow, mainly on iPhone X"
// report traced back to two real perf bugs, not device weirdness:
//
// 1. The turbulence filter's `baseFrequency` was being rewritten on EVERY
//    animation frame to make it "wobble". `feTurbulence` is one of the
//    most expensive SVG primitives there is - changing its attributes
//    forces the browser to regenerate the noise texture and re-rasterize
//    the whole filtered subtree from scratch, every frame, with no way to
//    cache or GPU-composite around it. On a modern desktop GPU that's
//    masked by raw horsepower; on an iPhone X's 2017 GPU it's enough on
//    its own to visibly stutter, and everything else animating on the
//    page (scroll-linked springs, video) was competing with it for the
//    same frame budget. Fixed by computing the wobble ONCE on mount
//    instead of every frame - the filter becomes static, so the browser
//    can rasterize it once and just move the (cheap, GPU-composited)
//    transform on top, same as any other layer.
// 2. The cursor-reveal mask (the radial-gradient "spotlight" that shows
//    the solid black/white text under the mouse) was being recomputed
//    every frame regardless of device - including on phones, which have
//    no cursor and can never trigger it. That's pure wasted work on
//    exactly the device that most needs the frame budget back. Fixed by
//    detecting hover/fine-pointer capability once (`hasHover`) and
//    skipping the entire mask branch - and not even mounting the overlay
//    layer's DOM - on touch-only devices.
//
// Also: the loop now checks whether the strip is actually on screen
// (IntersectionObserver) and skips its per-frame work entirely when it
// isn't, instead of animating forever in the background the moment the
// visitor scrolls past it.

const REPEAT_COUNT = 10;

function useHasHover() {
  const [hasHover, setHasHover] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    setHasHover(mq.matches);
    const onChange = (e) => setHasHover(e.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);
  return hasHover;
}

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
  const turbRef = useRef(null);

  const reduceMotion = useReducedMotion();
  const hasHover = useHasHover();

  const elapsedRef = useRef(0);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const mousePos = useRef({ x: -9999, y: -9999 });
  const visibleRef = useRef(true);

  // Freeze the ripple once instead of animating baseFrequency per frame -
  // see note above, this is the main fix.
  useEffect(() => {
    if (reduceMotion || !turbRef.current) return;
    const wobble = 0.022 + (Math.random() - 0.5) * 0.006;
    turbRef.current.setAttribute("baseFrequency", `${wobble.toFixed(4)} ${(wobble * 2).toFixed(4)}`);
  }, [reduceMotion]);

  // Pause all per-frame work while the strip is scrolled out of view.
  useEffect(() => {
    const el = stageRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => {
      visibleRef.current = entry.isIntersecting;
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useAnimationFrame((now, delta) => {
    if (reduceMotion || !visibleRef.current) return;

    // time-driven, percentage-based loop - see earlier note on why this is
    // the part that finally makes the seam exact
    elapsedRef.current += delta;
    const progress = (elapsedRef.current / (duration * 1000)) % 1;
    const percent = (-(100 / REPEAT_COUNT) * progress).toFixed(3);
    const transform = `translateX(${percent}%)`;
    if (baseRef.current) baseRef.current.style.transform = transform;
    if (overlayRef.current) overlayRef.current.style.transform = transform;

    // Cursor-reveal mask only exists for devices that actually have a
    // cursor - skipped entirely (not just idle, never computed) on touch.
    if (!hasHover || !overlayRef.current) return;

    mousePos.current.x += (mouseRef.current.x - mousePos.current.x) * 0.3;
    mousePos.current.y += (mouseRef.current.y - mousePos.current.y) * 0.3;
    const gradient = `radial-gradient(circle ${revealRadius}px at ${mousePos.current.x}px ${mousePos.current.y}px, black 35%, transparent 85%)`;
    overlayRef.current.style.webkitMaskImage = gradient;
    overlayRef.current.style.maskImage = gradient;
  });

  function onPointerMove(e) {
    if (!hasHover) return;
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
      {/* muted base layer - always visible, gentle static ripple (no
          longer animated per-frame, see note above) */}
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

      {/* Solid black/white overlay with the cursor-reveal mask - only
          exists at all on devices that reported a real hover-capable
          pointer. On touch it would never become visible anyway (there's
          no cursor to reveal it), so it isn't mounted, saving the DOM
          nodes, the paint cost, and the (skipped) per-frame mask work. */}
      {hasHover && (
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
      )}

      <ArrowUpRight
        aria-hidden="true"
        size={18}
        strokeWidth={2.2}
        className="pointer-events-none absolute right-4 sm:right-5 text-black dark:text-white opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ease-out"
      />

      <svg className="absolute w-0 h-0" aria-hidden="true">
        <defs>
          <filter id={`${uid}-water`} x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
            <feTurbulence ref={turbRef} type="fractalNoise" baseFrequency="0.022 0.044" numOctaves="2" seed="5" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="6" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>
    </a>
  );
}