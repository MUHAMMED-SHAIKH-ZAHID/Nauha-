import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useMotionTemplate } from "framer-motion";
import portraitImg from "../assets/Images/nilu_4x.webp";
import { useTheme } from "../context/ThemeContext";

export default function Navbar() {
    const { theme, toggleTheme } = useTheme();

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const pillRef = useRef(null);

  const mouseX = useMotionValue(50);
  const mouseY = useMotionValue(50);
  const highlight = useMotionTemplate`radial-gradient(circle at ${mouseX}% ${mouseY}%, rgba(255,255,255,0.6), transparent 55%)`;

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 80);
    }
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);



  function handlePointerMove(e) {
    const rect = pillRef.current.getBoundingClientRect();
    mouseX.set(((e.clientX - rect.left) / rect.width) * 100);
    mouseY.set(((e.clientY - rect.top) / rect.height) * 100);
  }

  const links = ["Work", "About"];
  const emailHref = "mailto:fathimanauhap03@gmail.com";

  return (
    <>
      <nav className="fixed top-4 left-0 w-full z-40 px-4 flex items-center justify-between">
        {/* Left — location, hidden below 1100px, unchanged */}
        
         <a
href="/"
          className="hidden lg:flex items-center gap-1 text-xs font-mono uppercase tracking-wide text-black dark:text-white"
        >
          <span aria-hidden>📍</span>
          <span>Kozhikode, IN</span>
        </a>

        {/* Desktop pill — exactly as before, untouched, only visible from 741px up */}
        <motion.div
          ref={pillRef}
          onPointerMove={handlePointerMove}
          animate={{ gap: scrolled ? 10 : 16 }}
          transition={{ type: "spring", damping: 22, stiffness: 220 }}
          className="relative hidden min-[741px]:flex mx-auto items-center rounded-full border border-white/50 px-2 py-1.5 overflow-hidden"
          style={{
            backdropFilter: scrolled ? "blur(18px) saturate(180%)" : "blur(14px) saturate(160%)",
            WebkitBackdropFilter: scrolled ? "blur(18px) saturate(180%)" : "blur(14px) saturate(160%)",
            background: "rgba(255,255,255,0.2)",
            boxShadow: scrolled
              ? "inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -1px 0 rgba(120,170,255,0.15), inset 1px 0 0 rgba(255,180,220,0.1), 0 18px 40px rgba(0,0,0,0.14)"
              : "inset 0 1px 0 rgba(255,255,255,0.45), inset 0 -1px 0 rgba(120,170,255,0.12), inset 1px 0 0 rgba(255,180,220,0.08), 0 8px 24px rgba(0,0,0,0.08)",
            transition: "box-shadow 0.4s ease, backdrop-filter 0.4s ease",
          }}
        >
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-full opacity-80"
            style={{ background: highlight }}
          />

          
           <a
href="/"
            className="relative z-10 w-9 h-9 rounded-full overflow-hidden shrink-0 border border-white/60"
          >
            <img src={portraitImg} alt="Nauha's photo" className="w-full h-full object-cover" />
          </a>

          <div
            className="relative z-10 flex items-center gap-2 overflow-hidden whitespace-nowrap"
            style={{
              opacity: scrolled ? 1 : 0,
              maxWidth: scrolled ? "220px" : "0px",
              transitionProperty: "max-width, opacity",
              transitionDuration: "450ms, 250ms",
              transitionTimingFunction: "cubic-bezier(0.4,0,0.2,1), ease",
              transitionDelay: scrolled ? "0.05s, 0.05s" : "0s, 0s",
            }}
          >
            <span className="text-sm font-normal">Available for work</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          </div>

          <div
            className="relative z-10 flex items-center gap-1 overflow-hidden whitespace-nowrap"
            style={{
              opacity: scrolled ? 0 : 1,
              maxWidth: scrolled ? "0px" : "500px",
              transitionProperty: "max-width, opacity",
              transitionDuration: "450ms, 200ms",
              transitionTimingFunction: "cubic-bezier(0.4,0,0.2,1), ease",
            }}
          >
            {links.map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                className="inline-block px-3 py-1.5 text-sm font-normal rounded-full border border-transparent hover:border-white/60 transition-colors"
              >
                {link}
              </a>
            ))}
            
             <a
href={emailHref}
              className="flex items-center gap-1.5 bg-white text-black text-sm font-normal px-4 py-2 rounded-full shrink-0"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" aria-hidden>
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-10 5L2 7" />
              </svg>
              Work with me
            </a>
          </div>
        </motion.div>

        {/* Mobile hamburger — separate element, left-anchored, no pill/padding wrapper, no photo */}
        <motion.button
          onClick={() => setMenuOpen(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", damping: 18, stiffness: 300 }}
          aria-label="Open menu"
          aria-expanded={menuOpen}
          className="min-[741px]:hidden flex flex-col justify-center items-center gap-1.5 w-11 h-11 rounded-full border border-white/50"
          style={{
            backdropFilter: "blur(14px) saturate(160%)",
            WebkitBackdropFilter: "blur(14px) saturate(160%)",
            background: "rgba(255,255,255,0.2)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.45), 0 8px 20px rgba(0,0,0,0.08)",
          }}
        >
          <span className="w-4 h-0.5 bg-black dark:bg-white transition-colors" />
          <span className="w-4 h-0.5 bg-black dark:bg-white transition-colors" />
        </motion.button>

        {/* Right — single real theme toggle, dummy button removed */}
        <motion.button
          onClick={toggleTheme}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          aria-label="Toggle dark mode"
          className="w-10 h-10 rounded-full flex items-center justify-center border border-white/50"
          style={{
            backdropFilter: "blur(14px) saturate(160%)",
            background: "rgba(255,255,255,0.2)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.4), 0 6px 16px rgba(0,0,0,0.08)",
          }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={theme}
              initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
              transition={{ duration: 0.25 }}
            >
              {theme === "light" ? "☀️" : "🌙"}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </nav>

      {/* Mobile full-screen menu — now genuinely theme-aware instead of a fixed blue */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, scale: 1, backdropFilter: "blur(24px)" }}
            exit={{ opacity: 0, scale: 0.97, backdropFilter: "blur(0px)" }}
            transition={{ type: "spring", damping: 26, stiffness: 240 }}
            className="fixed inset-0 z-50 flex flex-col justify-center px-8
                       bg-[#faf6ef]/95 dark:bg-[#111111]/95"
          >
            <button
              onClick={() => setMenuOpen(false)}
              className="absolute top-6 left-6 text-sm text-black dark:text-white"
              aria-label="Close menu"
            >
              Close
            </button>

            <div className="flex flex-col gap-6">
              {links.map((link, i) => (
                <div key={link} className="flex items-baseline gap-3">
                  <span className="text-xs font-mono text-black/40 dark:text-white/40">0{i + 1}</span>
                  
                   <a
href={`#${link.toLowerCase()}`}
                    onClick={() => setMenuOpen(false)}
                    className="font-serif text-5xl text-black dark:text-white"
                  >
                    {link}
                  </a>
                </div>
              ))}

              <div className="flex items-baseline gap-3">
                <span className="text-xs font-mono text-black/40 dark:text-white/40">0{links.length + 1}</span>
                
                 <a
href={emailHref}
                  onClick={() => setMenuOpen(false)}
                  className="font-serif text-5xl text-black dark:text-white"
                >
                  Work with me
                </a>
              </div>
            </div>

            
             <a
href="/"
              className="absolute bottom-6 left-6 text-xs font-mono uppercase text-black/60 dark:text-white/60"
            >
              Kozhikode, IN
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}