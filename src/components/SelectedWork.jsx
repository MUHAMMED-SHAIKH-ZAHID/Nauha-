import { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Hand } from "lucide-react";

import macbookMockup from "../assets/mockups/macbook.png";
import ipadMockup from "../assets/mockups/ipad.png";
import iphoneMockup from "../assets/mockups/iphone.png";
import frootreeVideo from "../assets/videos/frootree-demo.mp4";
import fanzaLongImg from "../assets/Images/fanza_long.jpg";
import atyabImg from "../assets/Images/atyab.jpg";

const PROJECTS = [
  {
    device: "mac",
    name: "Frootree",
    href: "https://frootree.com",
    domain: "frootree.com",
    tags: "Shopify · E-commerce · UI/UX",
    description: "A full Shopify storefront for a Calicut fruit & dry-fruit delivery business — quick-add cart, curated collections, and same-day delivery, trusted by 10,000+ local customers.",
    color: "#2f7d4f",
    video: frootreeVideo,
  },
  {
    device: "iphone",
    name: "Fanza Fashion",
    href: "https://fanzafashion.com",
    domain: "fanzafashion.com",
    tags: "Shopify · E-commerce · UI/UX",
    description: "A gold-plated & artificial jewellery storefront organized by category — rings, necklaces, earrings — with wedding, daily-wear, and office collections, plus a built-in referral program.",
    color: "#a9812f",
    longImage: fanzaLongImg,
  },
  {
    device: "ipad",
    name: "Atyab Al Anbar",
    href: "https://atyabalanbar.com",
    domain: "atyabalanbar.com",
    tags: "Shopify · E-commerce · UI/UX",
    description: "A luxury Arabic oud & fragrance storefront with GCC-wide delivery across the UAE, Saudi Arabia, Qatar, Oman, Kuwait & Bahrain, plus real customer reviews sourced from every one of those markets.",
    color: "#8a6a3a",
    image: atyabImg,
  },
];

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

const HEIGHT_BUDGET_VH = 62;

function deviceBoxStyle(spec) {
  const heightCapAsWidth = (HEIGHT_BUDGET_VH * spec.ratio).toFixed(1);
  return {
    width: `min(${spec.maxWidth}px, 88vw, ${heightCapAsWidth}vh)`,
    aspectRatio: spec.ratio,
  };
}

// Reused from About.jsx's exact heading pattern - same one-shot spring
// fade, same class treatment, so this section introduces itself with the
// identical visual weight instead of the previous small in-stage label
// standing in as the "title".
const headingFade = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 170, damping: 22, mass: 0.9 } },
};

// No `backdropFilter` here on purpose. A blur filter on an element that
// sits inside a track being transformed 60x/sec during scroll forces the
// browser to recomposite that blur every frame - on mid-range/older
// iPhones under Safari that alone is enough to turn a scroll janky. A
// slightly more opaque flat background reads almost identically and
// costs nothing to paint.
function ScreenChrome({ domain }) {
  return (
    <div
      className="absolute top-0 inset-x-0 h-[7%] min-h-[18px] flex items-center gap-1 px-[3%] z-10"
      style={{ background: "rgba(0,0,0,0.45)" }}
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

function SlideInHeading() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.98", "start 0.55"],
  });
  const x = useTransform(scrollYProgress, [0, 1], ["-18vw", "4vw"]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [0, 1]);

  return (
    <div ref={ref} className="overflow-hidden w-full">
      <motion.p
        style={{ x, opacity }}
        className="font-display md:pt-16 font-medium uppercase tracking-tight py-4 text-black dark:text-white
                   text-[clamp(2.25rem,7vw,5.5rem)] leading-[0.9] whitespace-nowrap"
      >
        Things I've built.
      </motion.p>
    </div>
  );
}

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

// Was a framer-motion `drag="y"` image with `touch-action: none`. That's
// the bug behind the "stuck on iPhone" report: disabling touch-action on
// an element means the browser hands EVERY touch there to the JS drag
// recognizer instead of to page scroll - so a visitor trying to keep
// scrolling the page (which is what advances the horizontal track) while
// their finger happens to land on the phone screen gets their gesture
// hijacked into dragging the screenshot instead, and the page just stops
// moving. It's a textbook "vertical drag inside a vertically-scrolling
// page" conflict.
//
// Native scroll fixes it outright: it's hardware-accelerated (no JS runs
// per touch-move frame, which is also just lighter/less "heavy" on its
// own), AND once the inner image hits the top/bottom of its own scroll
// range, the browser automatically chains the rest of that scroll gesture
// up to the page - so scrolling never dead-ends here, it just continues
// past. That handoff is exactly the behavior the old drag-with-clamped-
// constraints version was trying to hand-roll, for free, from the
// platform.
function ScrollableLongScreenshot({ src, alt }) {
  const [hasScrolled, setHasScrolled] = useState(false);
  return (
    <>
      <div
        className="absolute inset-0 overflow-y-auto"
        style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}
        onScroll={() => setHasScrolled(true)}
      >
        <img src={src} alt={alt} draggable={false} className="w-full h-auto select-none" />
      </div>
      {!hasScrolled && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="pointer-events-none absolute bottom-[4%] left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wide z-10"
          style={{ background: "rgba(0,0,0,0.55)", color: "#fff" }}
        >
          <Hand size={10} strokeWidth={2} />
          Scroll to explore
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

function DeviceMockup({ project, active }) {
  const spec = DEVICE_SPECS[project.device];

  let content;
  if (project.device === "mac") {
    content = <LoopVideo src={project.video} active={active} />;
  } else if (project.device === "iphone") {
    content = <ScrollableLongScreenshot src={project.longImage} alt={project.name} />;
  } else {
    content = <img src={project.image} alt={project.name} draggable={false} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />;
  }

  return (
    <div className="relative mx-auto" style={deviceBoxStyle(spec)}>
      <div
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

function ProjectDetails({ project, active }) {
  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
  };
  const item = {
    hidden: { opacity: 0.4, y: 6 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 24, mass: 0.7 } },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate={active ? "visible" : "hidden"}
      className="text-center md:text-left shrink-0"
    >
      <motion.p
        variants={item}
        className="text-[10px] sm:text-[11px] font-semibold tracking-wide uppercase mb-1.5 sm:mb-2"
        style={{ color: project.color }}
      >
        {project.tags}
      </motion.p>

      <motion.h3
        variants={item}
        className="font-display  uppercase tracking-tight text-black dark:text-white text-[clamp(1.3rem,4vw,2.6rem)] leading-[0.95]"
      >
        {project.name}
      </motion.h3>

      <motion.p
        variants={item}
        className="text-xs sm:text-sm sm:text-[15px] text-black/60 dark:text-white/60 mt-2 sm:mt-3 max-w-sm mx-auto md:mx-0
                   line-clamp-2 sm:line-clamp-none"
      >
        {project.description}
      </motion.p>

      <motion.a
        variants={item}
        href={project.href}
        target="_blank"
        rel="noopener noreferrer"
        className="group inline-flex items-center gap-1.5 mt-3 sm:mt-5 text-xs sm:text-sm font-semibold justify-center md:justify-start
                   transition-transform duration-150 active:scale-[0.97]"
        style={{ color: project.color }}
      >
        {project.domain}
        <ArrowUpRight size={15} strokeWidth={2.2} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </motion.a>
    </motion.div>
  );
}

function ProgressDot({ index, total, scrollYProgress }) {
  const center = index / Math.max(1, total - 1);
  const gap = 0.5 / Math.max(1, total - 1);
  const opacity = useTransform(scrollYProgress, [Math.max(0, center - gap), center, Math.min(1, center + gap)], [0.25, 1, 0.25]);
  const scale = useTransform(scrollYProgress, [Math.max(0, center - gap), center, Math.min(1, center + gap)], [1, 1.6, 1]);
  return <motion.span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white" style={{ opacity, scale }} />;
}

function PanelCounter({ total, scrollYProgress }) {
  const [current, setCurrent] = useState(1);
  useEffect(
    () =>
      scrollYProgress.on("change", (v) => {
        const idx = Math.round(v * (total - 1)) + 1;
        setCurrent(Math.min(total, Math.max(1, idx)));
      }),
    [scrollYProgress, total]
  );
  return (
    <span className="text-[11px] sm:text-xs font-semibold tabular-nums text-black/40 dark:text-white/40">
      {String(current).padStart(2, "0")} / {String(total).padStart(2, "0")}
    </span>
  );
}

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
        <ProjectDetails project={project} active={active} />
      </div>
    </div>
  );
}

function ScrollTrack() {
  const trackRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });
  const rawX = useTransform(scrollYProgress, [0, 1], ["0vw", `-${(PROJECTS.length - 1) * 100}vw`]);
  const springX = useSpring(rawX, { type: "spring", bounce: 0, duration: 0.28 });
  const x = reduceMotion ? rawX : springX;

  return (
    <div ref={trackRef} className="relative" style={{ height: `${PROJECTS.length * 100}vh` }}>
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="absolute top-5 sm:top-8 left-5 sm:left-8 md:left-16 z-30 flex items-center gap-3 sm:gap-4">
          <p className="text-[11px] sm:text-xs font-semibold tracking-wide text-black/50 dark:text-white/50 uppercase">Selected Work</p>
          <div className="flex items-center gap-1.5">
            {PROJECTS.map((p, i) => (
              <ProgressDot key={p.name} index={i} total={PROJECTS.length} scrollYProgress={scrollYProgress} />
            ))}
          </div>
          <PanelCounter total={PROJECTS.length} scrollYProgress={scrollYProgress} />
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
      <SlideInHeading />
      <ScrollTrack />
    </section>
  );
}