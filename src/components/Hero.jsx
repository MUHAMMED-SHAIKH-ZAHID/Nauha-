import { motion, useReducedMotion } from "framer-motion";
import portraitImg from "../assets/Images/nilu_4x.webp";
import NameCycle from "./NameCycle";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import bgVideoDark from "../assets/videos/bg-dark.mp4";
import bgVideoLight from "../assets/videos/bg-yellow.mp4";
import { useTheme } from "../context/ThemeContext";

function useFadeUp(reduceMotion) {
  return {
    hidden: reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 },
    visible: (i = 0) =>
      reduceMotion
        ? { opacity: 1, transition: { delay: i * 0.08, duration: 0.35, ease: "easeOut" } }
        : {
            opacity: 1,
            y: 0,
            transition: { delay: i * 0.15, type: "spring", stiffness: 170, damping: 22, mass: 0.9 },
          },
  };
}

function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < breakpoint : false
  );
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const handler = () => setIsMobile(mq.matches);
    handler();
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [breakpoint]);
  return isMobile;
}

function heroGlass(theme) {
  const dark = theme === "dark";
  return {
    background: dark
      ? "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0) 60%), rgba(10,10,10,0.55)"
      : "linear-gradient(180deg, rgba(255,255,255,0.75), rgba(255,255,255,0) 60%), rgba(255,255,255,0.55)",
    backdropFilter: "blur(22px) saturate(180%) brightness(1.05)",
    WebkitBackdropFilter: "blur(22px) saturate(180%) brightness(1.05)",
    border: dark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(255,255,255,0.6)",
    boxShadow: dark
      ? "inset 0 1px 0 rgba(255,255,255,0.1), 0 8px 24px rgba(0,0,0,0.35)"
      : "inset 0 1px 0 rgba(255,255,255,0.8), 0 8px 24px rgba(0,0,0,0.08)",
  };
}

export default function Hero() {
  const { theme } = useTheme();
  const reduceMotion = useReducedMotion();
  const fadeUp = useFadeUp(reduceMotion);
  const isMobile = useIsMobile();

  const sectionRef = useRef(null);
  const imgRef = useRef(null);
  const darkVideoRef = useRef(null);
  const lightVideoRef = useRef(null);
  const [headlineTop, setHeadlineTop] = useState(0);

  useLayoutEffect(() => {
    let raf = null;
    function measure() {
      if (imgRef.current && sectionRef.current) {
        const imgRect = imgRef.current.getBoundingClientRect();
        const sectionRect = sectionRef.current.getBoundingClientRect();
        setHeadlineTop(imgRect.top - sectionRect.top + imgRect.height * 0.2);
      }
    }
    function onResize() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    }
    measure();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      darkVideoRef.current?.pause();
      lightVideoRef.current?.pause();
      return;
    }
    const active = theme === "dark" ? darkVideoRef.current : lightVideoRef.current;
    const inactive = theme === "dark" ? lightVideoRef.current : darkVideoRef.current;
    active?.play().catch(() => {});
    const t = setTimeout(() => inactive?.pause(), 600);
    return () => clearTimeout(t);
  }, [theme, reduceMotion]);

  return (
    <section
      ref={sectionRef}
      className="relative isolate h-screen w-full overflow-hidden m-0 p-0 bg-[#fffdf9] dark:bg-black transition-colors duration-500"
    >
      {!reduceMotion && (
        <>
          <video
            ref={lightVideoRef}
            autoPlay loop muted playsInline preload="auto"
            disablePictureInPicture disableRemotePlayback aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-700 ease-out"
            style={{ opacity: theme === "dark" ? 0 : 0.3 }}
          >
            <source src={bgVideoLight} type="video/mp4" />
          </video>
          <video
            ref={darkVideoRef}
            autoPlay loop muted playsInline preload="auto"
            disablePictureInPicture disableRemotePlayback aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-700 ease-out"
            style={{ opacity: theme === "dark" ? 0.3 : 0 }}
          >
            <source src={bgVideoDark} type="video/mp4" />
          </video>
        </>
      )}

      <div className="absolute z-0 w-[42vw] h-[42vw] max-w-[560px] max-h-[560px] rounded-full bg-amber-200/35 dark:bg-orange-500/15 blur-[11vw] bottom-[-12%] left-[-4%] transition-colors duration-500" />
      <div className="absolute z-0 w-[30vw] h-[30vw] max-w-[420px] max-h-[420px] rounded-full bg-orange-200/30 dark:bg-yellow-400/10 blur-[9vw] bottom-[2%] left-[14%] transition-colors duration-500" />
      <div className="absolute z-0 w-[24vw] h-[24vw] max-w-[340px] max-h-[340px] rounded-full bg-white/50 dark:bg-white/5 blur-[7vw] top-[8%] left-[42%] transition-colors duration-500" />

      <h1 className="sr-only">
        Hey, there — I am <span>Nauha</span>, Web Designer &amp; Developer
      </h1>

      {/* "Hey, there" headline sits mid-portrait via headlineTop - stays put,
          Name now lives well above it near the very top, so the two don't collide */}
      <motion.h2
        aria-hidden="true"
        custom={0}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        style={{ top: headlineTop }}
        className="absolute z-0 lg:left-[29%] left-[10%] font-thin-serif italic font-light text-[clamp(2.75rem,10vw,8rem)] leading-none tracking-tight text-black dark:text-white transition-colors duration-500"
      >
        Hey,
      </motion.h2>
      <motion.h2
        aria-hidden="true"
        custom={0.15}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        style={{ top: headlineTop }}
        className="absolute z-0 lg:right-[30%] right-[6%] font-thin-serif italic font-light text-[clamp(2.75rem,10vw,8rem)] leading-none tracking-tight text-black dark:text-white transition-colors duration-500"
      >
        there
      </motion.h2>

      <motion.img
        ref={imgRef}
        custom={0.3}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        src={portraitImg}
        alt=""
        aria-hidden="true"
        decoding="async"
        fetchPriority="high"
        className="absolute dark:opacity-[0.15] z-10 bottom-0 left-1/2 -translate-x-1/2 md:h-[100%] h-[80%] w-auto max-w-none object-contain object-bottom transition-opacity duration-500"
      />

   {/* Name — MOBILE: top, centered. "Web Designer / Developer" now sits
    directly under it (no longer bottom of screen). Desktop unchanged. */}
<motion.h4
  aria-hidden="true"
  custom={0.4}
  initial="hidden"
  animate="visible"
  variants={fadeUp}
  className="absolute z-20 hidden md:block
             top-[5%] left-1/2 -translate-x-1/2 text-center
             sm:top-auto sm:bottom-[3%] sm:left-[4%] sm:translate-x-0 sm:text-left
             font-display font-light uppercase leading-[1] tracking-tight text-[clamp(1.9rem,8vw,5rem)]
             px-3 py-2 rounded-2xl text-black
             sm:px-0 sm:py-0
             dark:text-white
             transition-colors duration-500"
>
  I am<br /><NameCycle />
</motion.h4>

<motion.h4
  aria-hidden="true"
  custom={0.4}
  initial="hidden"
  animate="visible"
  variants={fadeUp}
  className="
    absolute z-20 md:hidden

    top-[clamp(32px,6vh,70px)]
    left-1/2
    -translate-x-1/2
    w-max
    max-w-[90vw]
    text-center

    sm:top-auto
    sm:bottom-[3%]
    sm:left-[4%]
    sm:translate-x-0
    sm:text-left
    sm:w-auto

    font-display font-light uppercase
    leading-[1] tracking-tight
    text-[clamp(1.9rem,8vw,5rem)]

    px-3 py-2 rounded-2xl
    sm:px-0 sm:py-0

    text-black dark:text-white
    transition-colors duration-500
  "
>
  I am&nbsp; <NameCycle />
</motion.h4>

{/* Role — MOBILE: now directly beneath Name at the top, centered, not at
    the bottom. Desktop: fully unchanged (bottom-right). */}
<motion.h3
  aria-hidden="true"
  custom={0.5}
  initial="hidden"
  animate="visible"
  variants={fadeUp}
  className="absolute z-20
             top-[16%] left-1/2 -translate-x-1/2 text-center
             sm:top-auto sm:bottom-[8%] sm:left-auto sm:right-[4%] sm:translate-x-0 sm:text-right
             font-[Cairo] font-bold uppercase tracking-wide leading-tight text-[clamp(0.9rem,3.5vw,1.5rem)]
             px-3 py-2 rounded-xl text-black
             sm:px-0 sm:py-0
             dark:text-white
             transition-colors duration-500"
  style={isMobile ? heroGlass(theme) : undefined}
>
  Web<br />Designer<br />Developer
</motion.h3>

{/* Badge — MOBILE: bottom-left corner (left-0, bottom ~5%). Desktop unchanged. */}
<motion.div
  custom={0.6}
  initial="hidden"
  animate="visible"
  variants={fadeUp}
  whileHover={reduceMotion ? {} : { y: -2 }}
  transition={{ type: "spring", stiffness: 300, damping: 20 }}
  className="absolute z-20
             bottom-[5%] left-0
             sm:top-[46%] sm:left-[4%] sm:bottom-auto
             flex items-center gap-2 rounded-full px-4 py-2 text-[clamp(0.7rem,2.8vw,0.85rem)] sm:text-[clamp(0.7rem,1vw,0.85rem)]
             bg-white text-black shadow-md
             dark:bg-white/10 dark:text-white dark:shadow-none
             transition-colors duration-500"
>
  <span className="relative flex w-2 h-2 shrink-0" aria-hidden="true">
    {!reduceMotion && (
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 dark:bg-orange-300 opacity-75" />
    )}
    <span className="relative inline-flex w-2 h-2 rounded-full bg-orange-500 dark:bg-orange-400" />
  </span>
  <span role="status">Available for new opportunities</span>
</motion.div>

{/* Specialized text — MOBILE: bottom-right corner (right-0, bottom ~15%). Desktop unchanged. */}
<motion.p
  custom={0.7}
  initial="hidden"
  animate="visible"
  variants={fadeUp}
  className="absolute z-20
             bottom-[15%] right-2 text-right max-w-[160px]
             sm:top-[46%] sm:bottom-auto sm:right-[4%] sm:max-w-[220px]
             text-[clamp(0.65rem,2.6vw,0.8rem)] sm:text-[clamp(0.7rem,1vw,0.85rem)]
             px-3 py-2 rounded-xl text-black
             sm:px-0 sm:py-0
             dark:text-white/85
             transition-colors duration-500"
  style={isMobile ? heroGlass(theme) : undefined}
>
  Specialized in Web Design, UX / UI, and Front End Development.
</motion.p>

   
    </section>
  );
}