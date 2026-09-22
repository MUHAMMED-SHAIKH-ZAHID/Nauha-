import React from 'react'
import MarqueeToPhysics from './MarqueeToPhysics'
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import portraitImg from "../assets/Images/nilu_4x.webp";
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

const projects = [
  { name: "Frootree", stack: "Shopify", href: "https://frootree.com/" },
  { name: "Writeable Quran", stack: "WooCommerce", href: "https://writeablequran.in/" },
  { name: "Greenfin India", stack: "WooCommerce", href: "https://greenfinindia.com/" },
];

// Shared hover treatment for the Experience/Education rows: a thin accent
// bar that draws in from the top on hover, and the row nudging slightly to
// the right - small, quiet feedback that these are worth lingering on, not
// just static text. Kept in one place so every list in this section moves
// the same way.
function ListRow({ title, subtitle, meta, children }) {
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
      {children}
    </div>
  );
}

export default function About() {
  const { theme } = useTheme();

  return (
    <section className="relative w-full px-6 sm:px-10 pb-18 bg-[#fffdf9] dark:bg-black transition-colors duration-500">
      {/* MarqueeToPhysics renders itself as `absolute inset-0` - it fills
          whatever positioned box it's given. Before, it had no box of its
          own here (just this <section>, whose height is set entirely by
          the About content below it), so the marquee was silently
          stretching to the FULL height of the entire About section - its
          "floor" ended up wherever the page happened to end, not a few rem
          below the pills. Giving it its own sized, relative wrapper is what
          actually fixes that; nothing about where it visually sits changes. */}
   
        <MarqueeToPhysics />
     

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        {/* Left column: bio + services + lists */}
        <div>
          <motion.h2
            custom={0}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="font-display pt-20 font-black uppercase leading-[0.85] text-black dark:text-white text-[clamp(3.5rem,12vw,9rem)] mb-10"
          >
            About
          </motion.h2>

          <motion.div
            custom={1}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="space-y-4 max-w-xl text-black dark:text-white/90 uppercase text-sm sm:text-[15px] font-semibold tracking-wide leading-relaxed"
          >
            <p>
              I'm Nauha, a web developer based in Kozhikode, India. I build clean, functional websites — from custom WordPress themes to full Shopify and WooCommerce stores — with an eye for both design and performance.
            </p>
            <p>
              My background spans full-stack development, and I enjoy the range between screen-based interfaces and the technical groundwork that makes a site actually run well.
            </p>
            <p>Currently open to freelance work and full-time opportunities. Feel free to get in touch.</p>
          </motion.div>

          {/* Services */}
          <motion.div
            custom={2}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="grid grid-cols-[100px_1fr] sm:grid-cols-[140px_1fr] gap-4 mt-12"
          >
            <p className="text-xs font-semibold tracking-wide text-black/50 dark:text-white/50 uppercase">My Services</p>
            <div className="space-y-1">
              {services.map((s) => (
                <p key={s} className="text-sm sm:text-[15px] font-semibold text-black dark:text-white">{s}</p>
              ))}
            </div>
          </motion.div>

          {/* Tech Stack - moved here from the very top of the section (where
              it sat as a lone floating row jammed under the marquee, before
              any heading even appeared) into the same label/content rhythm
              as Services, Experience and Education. Reads naturally in this
              order too: what she does, then what she builds it with. */}
          <motion.div
            custom={3}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="grid grid-cols-[100px_1fr] sm:grid-cols-[140px_1fr] gap-4 mt-12 items-start"
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
            className="grid grid-cols-[100px_1fr] sm:grid-cols-[140px_1fr] gap-4 mt-12"
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
            className="grid grid-cols-[100px_1fr] sm:grid-cols-[140px_1fr] gap-4 mt-12"
          >
            <p className="text-xs font-semibold tracking-wide text-black/50 dark:text-white/50 uppercase">Education</p>
            <div className="space-y-4">
              {education.map((ed) => (
                <ListRow key={ed.degree} title={ed.degree} subtitle={`${ed.institution} · ${ed.dates}`} />
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right column: portrait, matching reference's offset image */}
        <HangingBadge />
      </div>
    </section>
  );
}