import React from 'react'
import MarqueeToPhysics from './MarqueeToPhysics'
import { motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import portraitImg from "../assets/Images/nilu_4x.webp";
import HangingBadge from './HangingBadge';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.6, ease: "easeOut" },
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

export default function About() {
  const { theme } = useTheme();

  return (
    <section className="relative w-full px-6 sm:px-10 pb-18  bg-[#fffdf9] dark:bg-black transition-colors duration-500">
      <MarqueeToPhysics />
          {/* Heading */}
     

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        {/* Left column: bio + services + lists */}
              <div>
                   <motion.h2
        custom={0}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
        className="font-display pt-18 font-black uppercase leading-[0.85] text-black dark:text-white text-[clamp(3.5rem,12vw,9rem)] mb-10"
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

          {/* Experience */}
          <motion.div
            custom={3}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="grid grid-cols-[100px_1fr] sm:grid-cols-[140px_1fr] gap-4 mt-12"
          >
            <p className="text-xs font-semibold tracking-wide text-black/50 dark:text-white/50 uppercase">Experience</p>
            <div className="space-y-6">
              {experience.map((e) => (
                <div key={e.role}>
                  <p className="text-sm sm:text-[15px] font-bold text-black dark:text-white">{e.role}</p>
                  <p className="text-sm text-black/70 dark:text-white/70">{e.company} · {e.dates}</p>
                  <p className="text-xs text-black/50 dark:text-white/50 mt-1">{e.location}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Education */}
          <motion.div
            custom={4}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="grid grid-cols-[100px_1fr] sm:grid-cols-[140px_1fr] gap-4 mt-12"
          >
            <p className="text-xs font-semibold tracking-wide text-black/50 dark:text-white/50 uppercase">Education</p>
            <div className="space-y-4">
              {education.map((ed) => (
                <div key={ed.degree}>
                  <p className="text-sm sm:text-[15px] font-bold text-black dark:text-white">{ed.degree}</p>
                  <p className="text-sm text-black/70 dark:text-white/70">{ed.institution} · {ed.dates}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Projects — replaces the reference's Certifications slot, since she has real project links instead */}
          {/* <motion.div
            custom={5}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="grid grid-cols-[100px_1fr] sm:grid-cols-[140px_1fr] gap-4 mt-12"
          >
            <p className="text-xs font-semibold tracking-wide text-black/50 dark:text-white/50 uppercase">Projects</p>
            <div className="space-y-4">
              {projects.map((p) => (
                <div key={p.name}>
                  <a
                    href={p.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm sm:text-[15px] font-bold text-black dark:text-white underline underline-offset-2 hover:opacity-70 transition-opacity"
                  >
                    {p.name}
                  </a>
                  <p className="text-sm text-black/70 dark:text-white/70">{p.stack}</p>
                </div>
              ))}
            </div>
          </motion.div> */}
        </div>

        {/* Right column: portrait, matching reference's offset image */}
       
          <HangingBadge />
      </div>
    </section>
  );
}