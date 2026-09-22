import { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Hand } from "lucide-react";

import macbookMockup from "../assets/mockups/macbook.png";
import ipadMockup from "../assets/mockups/ipad.png";
import iphoneMockup from "../assets/mockups/iphone.png";
import frootreeVideo from "../assets/videos/frootree-demo.mp4";
import fanzaLongImg from "../assets/Images/fanza_long.jpg";
import atyabImg from "../assets/Images/atyab.jpg";

// Selected Work v3 - real photorealistic device mockups (your own PNGs,
// not CSS-drawn frames), real content composited into each screen cutout,
// and ONE scroll mechanism shared by desktop and mobile.
//
// How the pin works: the outer wrapper is 3x the viewport height
// (`PROJECTS.length * 100vh`). Its inner stage is `position: sticky; top:
// 0; height: 100vh`, so as the page scrolls through that tall wrapper the
// stage stays pinned on screen. A framer-motion `useScroll` tracks that
// same scroll progress (0 -> 1 across the wrapper) and drives the inner
// track's `x` transform from 0 to -200vw, sliding the three full-viewport
// panels left underneath the pinned stage. This is native-scroll-driven -
// wheel, trackpad, touch and keyboard scrolling all just work identically
// on every device - and the moment the wrapper's bottom edge reaches the
// top of the viewport, the sticky stage un-pins on its own and normal
// vertical scrolling continues. That's the "smooth transition back to
// bottom scroll" for free, no extra code, and it's why mobile does NOT
// get a separate swipe carousel: it's the same component, same gesture,
// just laid out narrower.
//
// How the compositing works: each mockup PNG (macbook.png / ipad.png /
// iphone.png) has a transparent screen cutout. The real content (video or
// image) sits in an absolutely-positioned layer sized to that cutout's
// measured percentage bounds, BEHIND the mockup image in z-order. The
// mockup's opaque bezel then reads as a real frame around real content,
// with no perspective warping needed since these are front-facing shots.
const PROJECTS = [
  {
    device: "mac",
    name: "Frootree",
    href: "https://frootree.com",
    domain: "frootree.com",
    tags: "Shopify · E-commerce · UI/UX",
    description: "Fresh fruit & dry-fruit delivery storefront out of Kozhikode.",
    color: "#2f7d4f",
    video: frootreeVideo,
  },
  {
    device: "iphone",
    name: "Fanza Fashion",
    href: "https://fanzafashion.com",
    domain: "fanzafashion.com",
    tags: "Shopify · E-commerce · UI/UX",
    description: "Gold-plated & artificial fashion jewellery storefront.",
    color: "#a9812f",
    longImage: fanzaLongImg,
  },
  {
    device: "ipad",
    name: "Atyab Al Anbar",
    href: "https://atyabalanbar.com",
    domain: "atyabalanbar.com",
    tags: "Shopify · E-commerce · UI/UX",
    description: "Arabic oud perfumes & luxury fragrance storefront.",
    color: "#8a6a3a",
    image: atyabImg,
  },
];

// Measured once from each real mockup PNG: its own pixel aspect ratio
// (so the wrapper box never stretches the frame) and the screen cutout's
// bounds as percentages of that box, so the content layer lines up with
// the bezel regardless of how large the mockup is rendered. `maxWidth` is
// a generous px ceiling for big screens; the actual rendered size is
// worked out live in `deviceBoxStyle` below so it also never runs taller
// than the viewport allows, on any device.
const DEVICE_SPECS = {
  mac: {
    img: macbookMockup,
    ratio: 2400 / 1370,
    maxWidth: 640,
    screen: { left: 10.71, top: 2.19, width: 78.54, height: 86.28 },
    chrome: true,
  },
  ipad: {
    img: ipadMockup,
    ratio: 5000 / 3986,
    maxWidth: 500,
    screen: { left: 27.82, top: 12.47, width: 44.64, height: 74.94 },
    chrome: true,
  },
  iphone: {
    img: iphoneMockup,
    ratio: 750 / 1514,
    maxWidth: 320,
    screen: { left: 5.6, top: 2.38, width: 89.07, height: 95.18 },
    chrome: false,
  },
};

// How tall, as a share of the viewport, a device box is allowed to be.
// Expressing the width cap in vh units (not px/vw) is what makes this
// work as a *height* budget without any JS measuring: "Nvh" is always N%
// of the viewport's height in pixels, so `maxWidth * ratio` in vh units
// caps the box's rendered HEIGHT at `maxWidth` vh, whatever the screen
// size or orientation - it can never blow past a short laptop window or
// a landscape phone.
const HEIGHT_BUDGET_VH = 62;

function deviceBoxStyle(spec) {
  const heightCapAsWidth = (HEIGHT_BUDGET_VH * spec.ratio).toFixed(1);
  return {
    width: `min(${spec.maxWidth}px, 88vw, ${heightCapAsWidth}vh)`,
    aspectRatio: spec.ratio,
  };
}

function ScreenChrome({ domain }) {
  return (
    <div
      className="absolute top-0 inset-x-0 h-[7%] min-h-[18px] flex items-center gap-1 px-[3%] z-10"
      style={{ background: "rgba(0,0,0,0.34)", backdropFilter: "blur(2px)" }}
    >
      <span className="w-[6px] h-[6px] rounded-full" style={{ background: "#ff5f57" }} />
      <span className="w-[6px] h-[6px] rounded-full" style={{ background: "#febc2e" }} />
      <span className="w-[6px] h-[6px] rounded-full" style={{ background: "#28c840" }} />
      <span className="ml-1.5 text-[8px] sm:text-[9px] font-medium tracking-wide truncate" style={{ color: "rgba(255,255,255,0.75)" }}>
        {domain}
      </span>
    </div>
  );
}

// Autoplaying loop video, paused whenever its panel isn't the one in (or
// near) view - three panels' worth of video decoding at once is wasted
// battery/CPU for two panels the visitor isn't looking at.
function LoopVideo({ src, active }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (active) {
      el.play?.().catch(() => {});
    } else {
      el.pause?.();
    }
  }, [active]);
  return (
    <video
      ref={ref}
      src={src}
      className="absolute inset-0 w-full h-full object-cover"
      muted
      loop
      playsInline
      preload="metadata"
    />
  );
}

// The one real (non-decorative) interaction in the section: a genuinely
// long screenshot you drag up/down inside the phone's screen, clamped so
// it can't be dragged past either end. Works identically with touch.
function DraggableLongScreenshot({ src, alt, frameRef }) {
  const imgRef = useRef(null);
  const [maxDrag, setMaxDrag] = useState(0);
  const [hasDragged, setHasDragged] = useState(false);

  useEffect(() => {
    function measure() {
      if (!imgRef.current || !frameRef.current) return;
      setMaxDrag(Math.max(0, imgRef.current.offsetHeight - frameRef.current.offsetHeight));
    }
    const img = imgRef.current;
    if (img?.complete) measure();
    img?.addEventListener("load", measure);
    window.addEventListener("resize", measure);
    return () => {
      img?.removeEventListener("load", measure);
      window.removeEventListener("resize", measure);
    };
  }, [src, frameRef]);

  return (
    <>
      <motion.img
        ref={imgRef}
        src={src}
        alt={alt}
        drag="y"
        dragConstraints={{ top: -maxDrag, bottom: 0 }}
        dragElastic={0.06}
        onDragStart={() => setHasDragged(true)}
        draggable={false}
        className="w-full h-auto cursor-grab active:cursor-grabbing select-none touch-none"
      />
      {!hasDragged && maxDrag > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="pointer-events-none absolute bottom-[4%] left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wide z-10"
          style={{ background: "rgba(0,0,0,0.55)", color: "#fff" }}
        >
          <Hand size={10} strokeWidth={2} />
          Drag to explore
        </motion.div>
      )}
    </>
  );
}

function Shadow() {
  return (
    <div
      aria-hidden="true"
      className="mx-auto mt-3 h-4 w-[80%] rounded-full blur-lg opacity-40"
      style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0.35), transparent 70%)" }}
    />
  );
}

// One component drives all three device types: it lays out a box at the
// mockup's own aspect ratio, drops the real content into the measured
// screen-cutout bounds, then stacks the mockup PNG on top (pointer-events
// disabled so drags on the phone content pass straight through the bezel).
function DeviceMockup({ project, active }) {
  const spec = DEVICE_SPECS[project.device];
  const screenRef = useRef(null);

  let content;
  if (project.device === "mac") {
    content = <LoopVideo src={project.video} active={active} />;
  } else if (project.device === "iphone") {
    content = <DraggableLongScreenshot src={project.longImage} alt={project.name} frameRef={screenRef} />;
  } else {
    content = <img src={project.image} alt={project.name} draggable={false} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />;
  }

  return (
    <div className="relative mx-auto" style={deviceBoxStyle(spec)}>
      <div
        ref={screenRef}
        className="absolute overflow-hidden"
        style={{
          left: `${spec.screen.left}%`,
          top: `${spec.screen.top}%`,
          width: `${spec.screen.width}%`,
          height: `${spec.screen.height}%`,
        }}
      >
        {spec.chrome && <ScreenChrome domain={project.domain} />}
        {content}
      </div>
      <img
        src={spec.img}
        alt=""
        draggable={false}
        className="absolute inset-0 w-full h-full pointer-events-none select-none z-20"
      />
      <Shadow />
    </div>
  );
}

function ProjectDetails({ project }) {
  return (
    <div className="text-center md:text-left shrink-0">
      <p className="text-[10px] sm:text-[11px] font-semibold tracking-wide uppercase mb-1.5 sm:mb-2" style={{ color: project.color }}>
        {project.tags}
      </p>
      <h3 className="font-display font-black uppercase tracking-tight text-black dark:text-white text-[clamp(1.3rem,4vw,2.6rem)] leading-[0.95]">
        {project.name}
      </h3>
      <p className="hidden sm:block text-sm sm:text-[15px] text-black/60 dark:text-white/60 mt-2 sm:mt-3 max-w-sm mx-auto md:mx-0">
        {project.description}
      </p>
      <a
        href={project.href}
        target="_blank"
        rel="noopener noreferrer"
        className="group inline-flex items-center gap-1.5 mt-3 sm:mt-5 text-xs sm:text-sm font-semibold justify-center md:justify-start"
        style={{ color: project.color }}
      >
        {project.domain}
        <ArrowUpRight size={15} strokeWidth={2.2} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </a>
    </div>
  );
}

// Its own component (not a useTransform call inside a .map loop in the
// parent) so each dot's hook call is a normal, unconditional top-level
// call within its own component instance - satisfies the rules of hooks
// properly instead of just happening to work because PROJECTS.length
// never changes.
function ProgressDot({ index, total, scrollYProgress }) {
  // A panel is fully centered in the pinned stage at progress =
  // index / (total - 1) - that's where the track's x transform puts it
  // exactly in view (see ScrollTrack) - so the dot should peak there too,
  // not at a naive index/total split.
  const center = index / Math.max(1, total - 1);
  const gap = 0.5 / Math.max(1, total - 1);
  const opacity = useTransform(scrollYProgress, [Math.max(0, center - gap), center, Math.min(1, center + gap)], [0.3, 1, 0.3]);
  return <motion.span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white" style={{ opacity }} />;
}

// One panel of the track: device + details, laid out side by side on
// wider screens and stacked (with everything sized in vh/vw so it can
// never overflow a short mobile 100vh viewport) on narrow ones.
//
// Note there is deliberately NO scroll-driven opacity/fade on the panel
// itself. The horizontal slide (the track's `x` transform) is already
// the transition - a panel is fully visible exactly while it's
// geometrically on screen. Layering a second, independently-timed fade
// on top of that made panels visually vanish while they were still
// partway across the viewport, which read as a flicker/pop-out bug
// rather than a transition. The slide alone is the smoother result.
//
// It still tracks its own "am I the panel currently centered in the
// pinned stage" state, so the mac panel's video only plays while it's
// actually the one in view (the other two stay paused).
function ProjectPanel({ project, scrollYProgress, index, total }) {
  const center = index / Math.max(1, total - 1);
  const halfGap = 0.5 / Math.max(1, total - 1);
  const [active, setActive] = useState(index === 0);

  useEffect(
    () =>
      scrollYProgress.on("change", (v) => {
        setActive(Math.abs(v - center) <= halfGap);
      }),
    [scrollYProgress, center, halfGap]
  );

  return (
    <div className="h-full shrink-0 flex items-center justify-center px-5 sm:px-10 md:px-16 overflow-hidden" style={{ width: "100vw" }}>
      <div className="w-full max-w-6xl flex flex-col md:flex-row items-center justify-center gap-6 sm:gap-10 md:gap-16 lg:gap-24">
        <div className="flex items-center justify-center">
          <DeviceMockup project={project} active={active} />
        </div>
        <ProjectDetails project={project} />
      </div>
    </div>
  );
}

// The single scroll-pin track shared by every breakpoint. Desktop and
// mobile differ only in spacing/typography (handled inside ProjectPanel /
// ProjectDetails via responsive classes) - the mechanism itself, the
// sticky stage and the scroll-driven horizontal track, is identical.
function ScrollTrack() {
  const trackRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });
  const rawX = useTransform(scrollYProgress, [0, 1], ["0vw", `-${(PROJECTS.length - 1) * 100}vw`]);
  // A light spring smooths out the last bit of jitter from fast/notchy
  // trackpad and mouse-wheel input so the slide feels closer to the
  // native momentum scrolling every device already does vertically.
  // Reduced-motion visitors get the raw, immediate value instead.
  const springX = useSpring(rawX, { stiffness: 220, damping: 32, mass: 0.6 });
  const x = reduceMotion ? rawX : springX;

  return (
    <div ref={trackRef} className="relative" style={{ height: `${PROJECTS.length * 100}vh` }}>
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* persistent label + progress dots, stays fixed while panels slide underneath */}
        <div className="absolute top-5 sm:top-8 left-5 sm:left-8 md:left-16 z-30 flex items-center gap-3 sm:gap-4">
          <p className="text-[11px] sm:text-xs font-semibold tracking-wide text-black/50 dark:text-white/50 uppercase">Selected Work</p>
          <div className="flex items-center gap-1.5">
            {PROJECTS.map((p, i) => (
              <ProgressDot key={p.name} index={i} total={PROJECTS.length} scrollYProgress={scrollYProgress} />
            ))}
          </div>
        </div>

        <motion.div className="flex h-full" style={{ width: `${PROJECTS.length * 100}vw`, x, willChange: "transform" }}>
          {PROJECTS.map((project, i) => (
            <ProjectPanel key={project.name} project={project} scrollYProgress={scrollYProgress} index={i} total={PROJECTS.length} />
          ))}
        </motion.div>
      </div>
    </div>
  );
}

export default function SelectedWork() {
  return (
    <section id="work" className="relative w-full bg-[#fffdf9] dark:bg-black transition-colors duration-500">
      <ScrollTrack />
    </section>
  );
}