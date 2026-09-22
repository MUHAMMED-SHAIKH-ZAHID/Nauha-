import { useState, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

// Selected Work - researched from masontywong.com/projects (hover a title,
// the laptop screen swaps to that project) but rebuilt for this site as a
// pure 2D component: no WebGL, no 3D model, no continuous render loop. The
// laptop shell below is hand-drawn in CSS, not an image asset, so there's
// nothing to source/host and it stays crisp at any size. Full reasoning for
// going 2D instead of the WebGL/Three.js route is in the chat - short
// version: this site isn't selling 3D/WebGL skills the way the reference
// site is, so the lighter, faster version fits better.
//
// Each project below uses ITS OWN real brand color for the placeholder
// screen (green for Frootree, gold/brown for Fanza and Atyab) instead of
// one invented accent color for the whole section - the section chrome
// itself (laptop shell, active-state indicator) stays neutral charcoal/ink
// so it never clashes with whichever project is showing.
//
// Swap `image` for a real screenshot or a short muted/looping <video> per
// project once you have one - the crossfade logic doesn't change, it just
// starts rendering real content instead of the wordmark placeholder.
const PROJECTS = [
  {
    name: "Frootree",
    href: "https://frootree.com",
    domain: "frootree.com",
    tags: "Shopify · E-commerce · UI/UX",
    description: "Fresh fruit & dry-fruit delivery storefront out of Kozhikode.",
    color: "#2f7d4f",
    colorSoft: "rgba(47,125,79,0.12)",
    image: null,
  },
  {
    name: "Fanza Fashion",
    href: "https://fanzafashion.com",
    domain: "fanzafashion.com",
    tags: "Shopify · E-commerce · UI/UX",
    description: "Gold-plated & artificial fashion jewellery storefront.",
    color: "#a9812f",
    colorSoft: "rgba(169,129,47,0.14)",
    image: null,
  },
  {
    name: "Atyab Al Anbar",
    href: "https://atyabalanbar.com",
    domain: "atyabalanbar.com",
    tags: "Shopify · E-commerce · UI/UX",
    description: "Arabic oud perfumes & luxury fragrance storefront.",
    color: "#8a6a3a",
    colorSoft: "rgba(138,106,58,0.14)",
    image: null,
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 170, damping: 22, mass: 0.9 } },
};

// Front-facing laptop shell, pure CSS - no image asset, no 3D model. Fixed
// neutral colors regardless of theme, same rule the rest of the site's
// cards follow: the object itself doesn't shift with light/dark mode, only
// the page around it does.
function LaptopShell({ project }) {
  return (
    <div className="relative mx-auto w-full max-w-[420px]">
      {/* screen + bezel */}
      <div
        className="relative rounded-t-2xl rounded-b-sm p-2.5 sm:p-3"
        style={{ background: "#1b1b1b", boxShadow: "0 30px 60px -20px rgba(0,0,0,0.45)" }}
      >
        {/* camera notch */}
        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full" style={{ background: "#3a3a3a" }} />

        <div className="relative aspect-[16/10] rounded-md overflow-hidden" style={{ background: "#0e0e0e" }}>
          {/* fake browser chrome - real domain of whichever project is active */}
          <div className="absolute top-0 inset-x-0 h-6 flex items-center gap-1.5 px-2.5 z-10" style={{ background: "rgba(255,255,255,0.06)" }}>
            <span className="w-2 h-2 rounded-full" style={{ background: "#ff5f57" }} />
            <span className="w-2 h-2 rounded-full" style={{ background: "#febc2e" }} />
            <span className="w-2 h-2 rounded-full" style={{ background: "#28c840" }} />
            <span className="ml-2 text-[9px] font-medium tracking-wide truncate" style={{ color: "rgba(255,255,255,0.45)" }}>
              {project.domain}
            </span>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={project.name}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="absolute inset-0 top-6 flex items-center justify-center"
              style={{ background: `linear-gradient(160deg, ${project.colorSoft}, transparent 65%)` }}
            >
              {project.image ? (
                <img src={project.image} alt={project.name} className="w-full h-full object-cover" draggable={false} />
              ) : (
                <p
                  className="font-display font-black uppercase text-center leading-none px-4"
                  style={{ color: project.color, fontSize: "clamp(1.1rem, 6cqw, 2.1rem)" }}
                >
                  {project.name}
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* base / keyboard deck */}
      <div
        className="relative h-3 sm:h-3.5 rounded-b-2xl"
        style={{ background: "linear-gradient(180deg, #2a2a2a, #1b1b1b)" }}
      >
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-16 sm:w-20 h-1.5 rounded-b-md" style={{ background: "#0e0e0e" }} />
      </div>
      {/* subtle contact shadow, grounds the laptop on the page */}
      <div
        aria-hidden="true"
        className="mx-auto mt-3 h-4 w-[85%] rounded-full blur-lg opacity-40"
        style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0.35), transparent 70%)" }}
      />
    </div>
  );
}

export default function SelectedWork() {
  const [activeIndex, setActiveIndex] = useState(0);
  const reduceMotion = useReducedMotion();
  const active = PROJECTS[activeIndex];

  return (
    <section className="relative w-full bg-[#fffdf9] dark:bg-black transition-colors duration-500 px-6 sm:px-8 md:px-12 lg:px-16 py-16 sm:py-20 md:py-24">
      <div className="max-w-7xl mx-auto">
        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="text-xs font-semibold tracking-wide text-black/50 dark:text-white/50 uppercase mb-3"
        >
          Selected Work
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
          {/* Laptop - order-2 on mobile so the project list (the actual
              readable/interactive content) comes first for touch users,
              who can't "hover" to preview anyway. */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="order-2 md:order-1"
          >
            <LaptopShell project={active} />
          </motion.div>

          {/* Project list */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="order-1 md:order-2"
          >
            <ul className="divide-y divide-black/[0.06] dark:divide-white/10">
              {PROJECTS.map((p, i) => {
                const isActive = i === activeIndex;
                return (
                  <li key={p.name}>
                    <a
                      href={p.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onMouseEnter={() => setActiveIndex(i)}
                      onFocus={() => setActiveIndex(i)}
                      className="group flex items-center justify-between gap-4 py-5 sm:py-6"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0 transition-transform duration-300"
                            style={{
                              background: isActive ? p.color : "transparent",
                              border: isActive ? "none" : "1.5px solid rgba(0,0,0,0.2)",
                              transform: isActive ? "scale(1)" : "scale(0.8)",
                            }}
                          />
                          <p
                            className={`font-display font-bold uppercase tracking-tight transition-all duration-300 ${
                              isActive ? "text-black dark:text-white" : "text-black/35 dark:text-white/35"
                            }`}
                            style={{ fontSize: isActive ? "clamp(1.3rem, 3vw, 1.9rem)" : "clamp(1.1rem, 2.4vw, 1.5rem)" }}
                          >
                            {p.name}
                          </p>
                        </div>

                        <AnimatePresence>
                          {isActive && (
                            <motion.div
                              initial={reduceMotion ? false : { opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.25, ease: "easeOut" }}
                              className="overflow-hidden"
                            >
                              <p className="text-sm text-black/60 dark:text-white/60 mt-1.5 ml-4">{p.description}</p>
                              <p className="text-[11px] font-semibold tracking-wide uppercase mt-1.5 ml-4" style={{ color: p.color }}>
                                {p.tags}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <ArrowUpRight
                        size={20}
                        strokeWidth={2}
                        className={`shrink-0 transition-all duration-300 ${
                          isActive
                            ? "opacity-100 translate-x-0 text-black dark:text-white"
                            : "opacity-0 -translate-x-1 text-black/40 dark:text-white/40"
                        }`}
                      />
                    </a>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}