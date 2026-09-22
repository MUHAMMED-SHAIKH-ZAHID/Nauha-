import { useRef } from "react";
import MarqueeToPhysics from './MarqueeToPhysics'
import { motion, useScroll, useTransform } from "framer-motion";
import HangingBadge from './HangingBadge';
import StackRow from './Stackrow';

// Spring-based instead of a plain easeOut tween, so this section's entrance
// matches the same physical, springy motion language used everywhere else
// on the site (Hero, Navbar, Contact) rather than feeling like a separate,
// flatter animation system bolted on.
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, type: "spring", stiffness: 170, damping: 22, mass: 0.9 },
  }),
};

const services = ["Web Design", "WordPress & Shopify Development", "Full-Stack Development", "UI / UX"];

const experience = [
  {
    role: "WordPress & Shopify Developer",
    company: "BackB",
    dates: "Jan 2024 – Nov 2025",
    location: "Kozhikode, Kerala, India",
    desc: "Designed, developed, and customized WordPress and Shopify websites — theme and plugin development, performance optimization, responsive design, SEO, and site security.",
  },
  {
    role: "Software Developer (Internship)",
    company: "Trylogic Soft Solutions AP Pvt Ltd",
    dates: "Apr 2023 – Dec 2023",
    location: "Trivandrum, Kerala, India",
    desc: "Worked on real-time projects, assisted in web application development, and learned coding, debugging, and testing under experienced developers.",
  },
];

const education = [
  { degree: "BSc Computer Science", institution: "University of Calicut", dates: "Jun 2020 – Mar 2023" },
  { degree: "Higher Secondary", institution: "EMS Govt HSS, Calicut", dates: "2018 – 2020" },
  { degree: "High School", institution: "Govt GMGHSS, Calicut", dates: "2015 – 2018" },
];

// Trimmed to two lines' worth of actual signal: who + where, what you
// build, and that you're open to work - the three things a scanning
// recruiter actually needs, instead of three paragraphs they'll skim past.
const bio =
  "I'm Nauha, a web developer in Kozhikode building fast, functional sites — from custom WordPress themes to full Shopify stores. Open to freelance and full-time work.";

// Shared hover treatment for the Experience/Education rows: a thin accent
// bar that draws in from the top on hover, and the row nudging slightly to
// the right - small, quiet feedback that these are worth lingering on, not
// just static text. Kept in one place so every list in this section moves
// the same way.
function ListRow({ title, subtitle, meta }) {
  return (
    <div className="group relative pl-4 -ml-4 py-0.5 transition-transform duration-300 ease-out hover:translate-x-1">
      <span
        aria-hidden="true"
        className="absolute left-0 top-0.5 bottom-0.5 w-[2px] origin-top scale-y-0 rounded-full
                   bg-black/15 dark:bg-white/20 transition-transform duration-300 ease-out
                   group-hover:scale-y-100"
      />
      <p className="text-sm sm:text-[15px] font-bold text-black dark:text-white">{title}</p>
      {subtitle && <p className="text-sm text-black/70 dark:text-white/70">{subtitle}</p>}
      {meta && <p className="text-xs text-black/50 dark:text-white/50 mt-1">{meta}</p>}
    </div>
  );
}

// Word-by-word scroll reveal: each word's opacity is tied directly to how
// far the paragraph has scrolled through the viewport, not to a one-shot
// "in view" trigger. Scroll past it slowly and the words visibly light up
// left to right as you go; scroll fast and they simply resolve to full
// opacity - it never blocks reading, it just rewards a slower scroll.
function Word({ children, progress, range }) {
  const opacity = useTransform(progress, range, [0.16, 1]);
  return (
    <motion.span style={{ opacity }} className="mr-[0.28em] inline-block">
      {children}
    </motion.span>
  );
}

function ScrollRevealText({ text, className }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.92", "start 0.4"],
  });
  const words = text.split(" ");

  return (
    <p ref={ref} className={className}>
      {words.map((word, i) => {
        const start = i / words.length;
        const end = start + 1 / words.length;
        return (
          <Word key={i} progress={scrollYProgress} range={[start, end]}>
            {word}
          </Word>
        );
      })}
    </p>
  );
}

export default function About() {
  return (
    <section id="about" className="relative w-full bg-[#fffdf9] dark:bg-black transition-colors duration-500">
      {/* MarqueeToPhysics renders itself as `absolute inset-0` - it fills
          whatever positioned box it's given, so it needs a real sized,
          relative wrapper here or it silently stretches to the height of
          the entire section instead of sitting in a compact strip. Bleeds
          to the true viewport edge regardless of the section's own
          padding, so it still reads as a full-width band. */}
        <MarqueeToPhysics />

      {/* Generous but capped horizontal padding, and a max-width so the
          content doesn't stretch edge-to-edge and thin out on very wide
          screens - the actual fix for "too little padding on md+". */}
      <div className="max-w-7xl  mx-auto px-6 sm:px-8 md:px-12 lg:px-16 pb-16 sm:pb-20 md:pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14 lg:gap-16">
          {/* Left column: bio + services + lists */}
          <div>
            <motion.h2
              custom={0}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="font-display pt-18 lg:pt-20 font-black uppercase leading-[0.85] text-black dark:text-white text-[clamp(3rem,10vw,7rem)] mb-6"
            >
              About
            </motion.h2>

            <ScrollRevealText
              text={bio}
              className="max-w-md sm:max-w-lg text-black dark:text-white/90 uppercase text-sm sm:text-[15px] font-semibold tracking-wide leading-relaxed"
            />

            {/* Services */}
            <motion.div
              custom={2}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="grid grid-cols-[100px_1fr] sm:grid-cols-[140px_1fr] gap-4 mt-10"
            >
              <p className="text-xs font-semibold tracking-wide text-black/50 dark:text-white/50 uppercase">My Services</p>
              <div className="space-y-1">
                {services.map((s) => (
                  <p key={s} className="text-sm sm:text-[15px] font-semibold text-black dark:text-white">{s}</p>
                ))}
              </div>
            </motion.div>

            {/* Tech Stack - lives in the same label/content rhythm as
                Services, Experience and Education, right after Services:
                what she does, then what she builds it with. */}
            <motion.div
              custom={3}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="grid grid-cols-[100px_1fr] sm:grid-cols-[140px_1fr] gap-4 mt-10 items-start"
            >
              <p className="text-xs font-semibold tracking-wide text-black/50 dark:text-white/50 uppercase pt-2">Tech Stack</p>
              <StackRow showLabel={false} />
            </motion.div>

            {/* Experience */}
            <motion.div
              custom={4}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="grid grid-cols-[100px_1fr] sm:grid-cols-[140px_1fr] gap-4 mt-10"
            >
              <p className="text-xs font-semibold tracking-wide text-black/50 dark:text-white/50 uppercase">Experience</p>
              <div className="space-y-6">
                {experience.map((e) => (
                  <ListRow key={e.role} title={e.role} subtitle={`${e.company} · ${e.dates}`} meta={e.location} />
                ))}
              </div>
            </motion.div>

            {/* Education */}
            <motion.div
              custom={5}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              className="grid grid-cols-[100px_1fr] sm:grid-cols-[140px_1fr] gap-4 mt-10"
            >
              <p className="text-xs font-semibold tracking-wide text-black/50 dark:text-white/50 uppercase">Education</p>
              <div className="space-y-4">
                {education.map((ed) => (
                  <ListRow key={ed.degree} title={ed.degree} subtitle={`${ed.institution} · ${ed.dates}`} />
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right column: portrait. Matches the grid's own breakpoint
              (md) instead of a separate one, so the badge appears exactly
              when the two-column layout does - no stacked, orphaned badge
              on tablet widths while the grid is still single-column. */}
          <div className="hidden md:block">
            <HangingBadge />
          </div>
        </div>
      </div>
    </section>
  );
}