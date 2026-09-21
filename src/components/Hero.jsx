import { motion } from "framer-motion";
import portraitImg from "../assets/Images/nilu_4x.webp";
import NameCycle from "./NameCycle";
import { useLayoutEffect, useRef, useState } from "react";
import bgVideoDark from "../assets/videos/bg-dark.mp4";
import bgVideoLight from "../assets/videos/bg-yellow.mp4";
import { useTheme } from "../context/ThemeContext";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.7, ease: "easeOut" },
  }),
};

export default function Hero() {
  const { theme } = useTheme();
  const sectionRef = useRef(null);
  const imgRef = useRef(null);
  const [headlineTop, setHeadlineTop] = useState(0);

  useLayoutEffect(() => {
    function measure() {
      if (imgRef.current && sectionRef.current) {
        const imgRect = imgRef.current.getBoundingClientRect();
        const sectionRect = sectionRef.current.getBoundingClientRect();
        setHeadlineTop(imgRect.top - sectionRect.top + imgRect.height * 0.2);
      }
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative isolate h-screen w-full overflow-hidden m-0 p-0 bg-[#fffdf9] dark:bg-black transition-colors duration-500"
    >
      <video
        key={theme}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-30 z-0"
      >
        <source src={theme === "dark" ? bgVideoDark : bgVideoLight} type="video/mp4" />
      </video>

      {/* Glow */}
      <div className="absolute z-0 w-[42vw] h-[42vw] max-w-[560px] max-h-[560px] rounded-full bg-amber-200/35 dark:bg-orange-500/15 blur-[11vw] bottom-[-12%] left-[-4%] transition-colors duration-500" />
      <div className="absolute z-0 w-[30vw] h-[30vw] max-w-[420px] max-h-[420px] rounded-full bg-orange-200/30 dark:bg-yellow-400/10 blur-[9vw] bottom-[2%] left-[14%] transition-colors duration-500" />
      <div className="absolute z-0 w-[24vw] h-[24vw] max-w-[340px] max-h-[340px] rounded-full bg-white/50 dark:bg-white/5 blur-[7vw] top-[8%] left-[42%] transition-colors duration-500" />

      <motion.h2
        custom={0}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        style={{ top: headlineTop }}
        className="absolute z-0 lg:left-[29%] left-[10%] font-thin-serif italic font-light text-[clamp(2.75rem,10vw,8rem)] leading-none text-black dark:text-white transition-colors duration-500"
      >
        Hey,
      </motion.h2>
      <motion.h2
        custom={0.15}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        style={{ top: headlineTop }}
        className="absolute z-0 lg:right-[30%] right-[6%] font-thin-serif italic font-light text-[clamp(2.75rem,10vw,8rem)] leading-none text-black dark:text-white transition-colors duration-500"
      >
        there
      </motion.h2>

      {/* Portrait — restored to subtle background presence, not full opacity */}
      <motion.img
        ref={imgRef}
        custom={0.3}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        src={portraitImg}
        alt="Portrait"
        className="absolute saturate-0 opacity-10 dark:opacity-[0.15] z-10 bottom-0 left-1/2 -translate-x-1/2 h-[100%] w-auto max-w-none object-contain object-bottom transition-opacity duration-500"
      />

      {/* Badge — glass card on mobile so it's readable over video+photo, plain from sm: up */}
      <motion.div
        custom={0.5}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="hidden sm:flex absolute z-20 top-[46%] left-[4%] items-center gap-2 rounded-full px-4 py-2 text-[clamp(0.7rem,1vw,0.85rem)]
                   bg-white text-black shadow-md
                   dark:bg-white/10 dark:text-white dark:shadow-none
                   transition-colors duration-500"
      >
        <span className="w-2 h-2 rounded-full bg-orange-500 dark:bg-orange-400 animate-pulse shrink-0" />
        Available for new opportunities
      </motion.div>

      {/* Specialized text — glass card on mobile, plain from sm: up */}
      <motion.p
        custom={0.6}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="absolute z-20 top-[46%] right-[4%] text-right max-w-[220px] text-[clamp(0.7rem,1vw,0.85rem)]
                   px-3 py-2 rounded-xl bg-white/60 backdrop-blur-md text-black
                   sm:bg-transparent sm:backdrop-blur-none sm:px-0 sm:py-0
                   dark:bg-black/40 dark:sm:bg-transparent dark:text-white/85
                   transition-colors duration-500"
      >
        <span className="sm:hidden">UI / UX</span>
        <span className="hidden sm:inline">
          Specialized in Web Design, UX / UI, and Front End Development.
        </span>
      </motion.p>

      {/* Name — glass card on mobile only, since this sits right over the portrait there */}
      <motion.h4
        custom={0.7}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="absolute z-20 bottom-[3%] left-[4%] font-display font-light uppercase leading-[1] text-[clamp(2rem,7vw,5rem)]
                   px-3 py-2 rounded-2xl bg-white/50 backdrop-blur-md text-black
                   sm:bg-transparent sm:backdrop-blur-none sm:px-0 sm:py-0
                   dark:bg-black/40 dark:sm:bg-transparent dark:text-white
                   transition-colors duration-500"
      >
        I am<br /><NameCycle />
      </motion.h4>

      {/* Role — same glass treatment, mobile only */}
      <motion.h3
        custom={0.85}
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="absolute z-20 bottom-[8%] right-[4%] text-right font-[Cairo] font-bold uppercase tracking-wide leading-tight text-[clamp(0.9rem,2vw,1.5rem)]
                   px-3 py-2 rounded-xl bg-white/50 backdrop-blur-md text-black
                   sm:bg-transparent sm:backdrop-blur-none sm:px-0 sm:py-0
                   dark:bg-black/40 dark:sm:bg-transparent dark:text-white
                   transition-colors duration-500"
      >
        Web<br />Designer<br />Developer
      </motion.h3>
    </section>
  );
}