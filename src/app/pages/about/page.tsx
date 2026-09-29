"use client";

import Image from "next/image";
import Header from "@/components/Header";
import Preloader from "@/components/Preloader";
import Footer from "@/components/Footer";
import FloatingControls from "@/components/FloatingControls";
import { useState, useEffect } from "react";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function parseMonthYear(str: string): Date {
  if (str === "Present") return new Date();
  const [mon, yr] = str.trim().split(" ");
  return new Date(parseInt(yr), MONTHS.indexOf(mon));
}

function calcDuration(start: string, end = "Present"): string {
  const s = parseMonthYear(start);
  const e = parseMonthYear(end);
  let total = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
  if (total < 1) total = 1;
  const yrs = Math.floor(total / 12);
  const mos = total % 12;
  return [yrs ? `${yrs} yr${yrs > 1 ? "s" : ""}` : "", mos ? `${mos} mo${mos > 1 ? "s" : ""}` : ""]
    .filter(Boolean)
    .join(" ");
}

function formatTimeframe(start: string, end = "Present"): string {
  return `${start} - ${end} · ${calcDuration(start, end)}`;
}

function groupDuration(roles: Role[]): string {
  const starts = roles.map((r) => parseMonthYear(r.start).getTime());
  const ends = roles.map((r) => parseMonthYear(r.end ?? "Present").getTime());
  const minStart = new Date(Math.min(...starts));
  const maxEnd = new Date(Math.max(...ends));

  const startStr = `${MONTHS[minStart.getMonth()]} ${minStart.getFullYear()}`;
  const isActive = roles.some((r) => !r.end || r.end === "Present");
  const endStr = isActive ? "Present" : `${MONTHS[maxEnd.getMonth()]} ${maxEnd.getFullYear()}`;

  return calcDuration(startStr, endStr);
}

interface Role {
  position: string;
  start: string;
  end?: string;
  description?: string;
  skills?: string[];
}
interface ExperienceGroup {
  company: string;
  type: string;
  location: string;
  roles: Role[];
}
interface EducationItem {
  level: string;
  school: string;
  years: string;
  description: string;
}
interface Achievement {
  title: string;
  year: string;
  place: string;
  description: string;
}

function Modal({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!isOpen) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [isOpen, onClose]);
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="about-modal relative z-10 w-full max-w-4xl max-h-[85vh] bg-[#000000] border border-[#f0ede4]/10 rounded-2xl flex flex-col shadow-2xl">
        <div className="about-modal-header flex items-center justify-between px-6 py-5 border-b border-[#f0ede4]/10 shrink-0">
          <h2 className="about-modal-title text-sm font-semibold tracking-[0.2em] uppercase text-[#f0ede4]">{title}</h2>
          <button
            onClick={onClose}
            className="about-modal-close text-[#f0ede4]/50 hover:text-[#f0ede4] transition-colors p-1"
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-6">{children}</div>
      </div>
    </div>
  );
}

function parseYear(str: string): number {
  const m = str.match(/\d{4}/g);
  return m ? Math.max(...m.map(Number)) : 0;
}

function ExperienceGroupCard({ group }: { group: ExperienceGroup }) {
  const isSingle = group.roles.length === 1;
  const duration = groupDuration(group.roles);

  return (
    <div className="flex gap-4">
      <div
        className="shrink-0 w-10 h-10 rounded-md flex items-center justify-center text-[10px] font-bold tracking-wide mt-0.5"
        style={{
          backgroundColor: "var(--border-subtle)",
          color: "var(--fg-muted)",
        }}
      >
        {group.company.slice(0, 2).toUpperCase()}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <h3 className="about-card-title text-[0.95rem] font-semibold leading-snug">{group.company}</h3>
          <span className="about-card-muted text-[11px] opacity-50">· {group.type}</span>
          <span className="about-card-muted text-[11px] opacity-40">· {duration}</span>
        </div>
        <p className="about-card-sub text-[11px] opacity-45 mt-0.5">{group.location}</p>

        <div className={`mt-3 ${!isSingle ? "border-l border-[var(--border-subtle)] pl-4" : ""}`}>
          {group.roles.map((role, i) => (
            <div key={i} className={`relative ${!isSingle && i < group.roles.length - 1 ? "mb-5" : ""}`}>
              {!isSingle && (
                <div
                  className="absolute -left-[21px] top-[5px] w-2 h-2 rounded-full border"
                  style={{
                    backgroundColor: "var(--bg-base)",
                    borderColor: "var(--border-subtle)",
                  }}
                />
              )}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-0.5">
                <p className="about-card-title text-[0.88rem] font-semibold">{role.position}</p>
                <span className="about-card-muted text-[11px] opacity-40 shrink-0 whitespace-nowrap">
                  {formatTimeframe(role.start, role.end)}
                </span>
              </div>
              {role.description && (
                <p className="about-card-body text-[0.8rem] opacity-55 mt-1.5 leading-relaxed max-w-prose">
                  {role.description}
                </p>
              )}
              {role.skills && role.skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {role.skills.map((s, si) => (
                    <span
                      key={si}
                      className="text-[10px] tracking-wide px-2.5 py-0.5 rounded-full"
                      style={{
                        backgroundColor: "var(--border-subtle)",
                        color: "var(--fg-muted)",
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InfoCard({ top, sub, meta, body }: { top: string; sub: string; meta: string; body?: string }) {
  return (
    <div className="about-card flex flex-col gap-1 p-4 border border-[#f0ede4]/10 rounded-xl hover:border-[#f0ede4]/25 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <h3 className="about-card-title text-sm font-semibold leading-snug">{top}</h3>
        <span className="about-card-muted text-[10px] opacity-40 tracking-widest shrink-0 mt-0.5 uppercase">
          {meta}
        </span>
      </div>
      <span className="about-card-sub text-[11px] font-medium opacity-50 tracking-wide uppercase">{sub}</span>
      {body && <p className="about-card-body text-xs opacity-55 leading-relaxed mt-1">{body}</p>}
    </div>
  );
}

export default function AboutPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [achievementsOpen, setAchievementsOpen] = useState(false);
  const [showAllExp, setShowAllExp] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(t);
  }, []);

  const experienceGroups: ExperienceGroup[] = [
    {
      company: "BetterKabankalan",
      type: "Full-time",
      location: "Remote",
      roles: [
        {
          position: "Maintainer, Founder",
          start: "Dec 2025",
          description: "Developed and maintained the BetterKabankalan platform. A civic-tech platform for the City of Kabankalan, Philippines.",
          skills: [],
        },
      ],
    },
    {
      company: "Web Design Davao / Scalyn OPC",
      type: "Full-time",
      location: "Remote",
      roles: [
        {
          position: "Backend Developer",
          start: "Aug 2026",
          description: "",
          skills: [],
        },
      ],
    },
    {
      company: "KCAT Inc.",
      type: "Full-time",
      location: "Kabankalan, Western Visayas, Philippines · On-site",
      roles: [
        {
          position: "Software Developer",
          start: "Oct 2025",
          end: "Jul 2026",
          description:
            "Software developer and IT generalist across application development, infrastructure, and network operations. Built all the internal web app and system for operational management.",
          skills: ["Network Administration", "Proxmox", "Grafana", "Laravel", "IT Support"],
        },
      ],
    },
    {
      company: "Freelance",
      type: "Self-employed",
      location: "Philippines · Remote",
      roles: [
        {
          position: "Full-stack Developer",
          start: "Jun 2024",
          description:
            "Built and shipped websites and mobile applications from scratch — front-end to QA — for clients across multiple industries.",
          skills: ["React", "Next.js", "Laravel", "Supabase", "Tailwind CSS"],
        },
        {
          position: "Application Developer",
          start: "Nov 2025",
          end: "Feb 2026",
          skills: ["Electron", "SQLite", "TypeScript"],
        },
        {
          position: "Web Application Developer",
          start: "May 2025",
          end: "Aug 2025",
          skills: ["API Development", "Next.js"],
        },
        {
          position: "Mobile Application Developer",
          start: "Nov 2024",
          end: "Jan 2025",
          skills: ["Flutter", "Dart", "Firebase"],
        },
      ],
    },
    {
      company: "Spring Valley Tech Corp",
      type: "Internship",
      location: "Bago City, Western Visayas, Philippines · On-site",
      roles: [
        {
          position: "Full-stack Developer",
          start: "Apr 2025",
          end: "Jun 2025",
          skills: ["API Development", "React", "Node.js"],
        },
        {
          position: "Frontend Developer",
          start: "Apr 2025",
          end: "Apr 2025",
          skills: ["React Native", "UI Design"],
        },
        {
          position: "Cloud Engineer",
          start: "Mar 2025",
          end: "Apr 2025",
          skills: ["AWS", "Lambda"],
        },
        {
          position: "Software Developer",
          start: "Feb 2025",
          end: "Mar 2025",
          skills: ["Python", "Flask"],
        },
      ],
    },
    {
      company: "Goranow",
      type: "Freelance",
      location: "Cebu, Central Visayas, Philippines · Remote",
      roles: [
        {
          position: "WordPress Developer",
          start: "Jun 2024",
          end: "Aug 2024",
          skills: ["WordPress", "Elementor"],
        },
      ],
    },
  ];

  const education: EducationItem[] = [
    {
      level: "College",
      school: "Southland College",
      years: "2021 - 2025",
      description: "B.S. Information Technology — Cum Laude",
    },
    {
      level: "Senior High School",
      school: "Southland College",
      years: "2019 - 2021",
      description: "STEM Strand",
    },
    {
      level: "Junior High School",
      school: "Southland College",
      years: "2015 - 2019",
      description: "Junior High School",
    },
    {
      level: "Elementary",
      school: "Southland College",
      years: "2009 - 2015",
      description: "Elementary",
    },
  ];

  const achievementsRaw: Achievement[] = [
    {
      title: "Latin Honors",
      year: "2025",
      place: "Southland College",
      description: "Graduated Cum Laude, Top 3 overall academic rankings.",
    },
    {
      title: "Dean's Lister",
      year: "2021 - 2024",
      place: "Southland College",
      description: "Consistently achieved Dean's List recognition.",
    },
    {
      title: "Class Honor",
      year: "2021",
      place: "Southland College",
      description: "Achieved class honor during freshman year.",
    },
    {
      title: "Department Honors",
      year: "2022 - 2024",
      place: "Southland College",
      description: "Sophomore and junior year department honor.",
    },
    {
      title: "FBC Interschool Web Design",
      year: "2025",
      place: "Champion",
      description: "Won championship in the FBC Interschool Web Design Competition.",
    },
    {
      title: "SECSA Week Web Design",
      year: "2024",
      place: "2nd Place",
      description: "Placed 2nd in the SECSA Week 2024 Web Design Competition.",
    },
    {
      title: "SECSA Week Web Dev Sprint",
      year: "2025",
      place: "1st Place & Best in Design",
      description: "Won 1st place in SECSA Week 2025 Web Development Sprint.",
    },
    {
      title: "SC IT Day Web Design",
      year: "2024",
      place: "Champion",
      description: "Won championship in the SC IT Day 2024 Web Design Competition.",
    },
    {
      title: "WVSU Interschool Web Design",
      year: "2023",
      place: "Champion",
      description: "Won championship in the WVSU Interschool Web Design Competition.",
    },
    {
      title: "PITCHUP: Social Solution Challenge",
      year: "2025",
      place: "4th Place",
      description: "Top 4 in the PITCHUP Social Solution Challenge.",
    },
    {
      title: "Exemplary Awards — Tech Innovation",
      year: "2025",
      place: "Southland College",
      description: "Won Exemplary Awards for Technology Innovation at commencement.",
    },
  ];

  const achievements = [...achievementsRaw].sort((a, b) => parseYear(b.year) - parseYear(a.year));
  const EXP_PREVIEW = 2;
  const ACH_PREVIEW = 4;
  const visibleGroups = showAllExp ? experienceGroups : experienceGroups.slice(0, EXP_PREVIEW);
  const hiddenGroupsCount = experienceGroups.length - EXP_PREVIEW;
  const achievementsPreview = achievements.slice(0, ACH_PREVIEW);
  const remainingAch = achievements.length - ACH_PREVIEW;

  return isLoading ? (
    <Preloader />
  ) : (
    <>
      <Header overlayHero={false} />

      <section className="about-page-section min-h-screen px-[5%] py-12 bg-[#000000] text-[#f0ede4]">
        <div className="flex flex-col md:flex-row gap-8">
          {/* ── Sticky sidebar ── */}
          <div className="md:w-1/3 md:sticky top-20 self-start">
            <Image
              src="/images/me-1.jpg"
              width={300}
              height={300}
              alt="DevAdora"
              className="rounded-[10%] mx-auto md:mx-0"
              style={{ filter: "grayscale(60%) brightness(1) contrast(1.1)" }}
            />
            <div className="about-name text-[1.2rem] sm:text-[1.5rem] md:text-[1.6rem] lg:text-[1.8rem] xl:text-[2rem] leading-7 sm:leading-10 text-center md:text-left mt-4">
              <h1>DevAdora (Rai M. Reyes Jr.)</h1>
            </div>
            <div className="about-bio text-[1rem] sm:text-[1.1rem] md:text-[1.2rem] leading-5 sm:leading-7 text-center md:text-left mt-4">
              <h1>Aspiring Software Developer 👩🏻‍💻 and currently a freelancer based in Philippines 📍.</h1>
            </div>
            <div className="mt-8 flex flex-col justify-center items-center md:justify-start md:items-start">
              <p className="about-label text-md font-semibold mb-2">RESUME & CV</p>
              <div className="flex gap-4">
                <a
                  href="/Rai M. Reyes Jr. - Resume.pdf"
                  target="_blank"
                  className="about-resume-view bg-[#f0ede4] text-black px-4 py-2 rounded-md hover:opacity-80 transition-opacity"
                >
                  View
                </a>
                <a
                  href="/Rai M. Reyes Jr. - Resume.pdf"
                  download
                  className="about-resume-dl border border-[#f0ede4]/30 px-4 py-2 rounded-md hover:bg-[#f0ede4] hover:text-black transition-colors"
                >
                  Download
                </a>
              </div>
            </div>
          </div>

          {/* ── Main content ── */}
          <div className="md:w-2/3 flex flex-col gap-2">
            <div className="md:p-8">
              <span className="about-intro text-[1.2rem] sm:text-[1.2rem] md:text-[1.5rem] lg:text-[1.6rem] leading-8">
                Ar-ar Reyes, the mind behind DevAdora, is a multifaceted freelancer, developer, and designer devoted to
                transforming bold ideas into impactful digital realities.
              </span>
            </div>

            <div className="py-4 md:p-8">
              <p className="about-label mb-4">(ABOUT ME)</p>
              <span className="about-body text-[1rem] md:text-[1.2rem] leading-6">
                With a seamless end-to-end process and a sharp eye for detail, Ar-ar bridges imagination and innovation
                — crafting solutions that dont just function, but resonate.
              </span>
            </div>

            {/* Work Experience */}
            <div className="md:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="about-section-heading text-xl font-semibold">WORK EXPERIENCE</h2>
                <span className="about-card-muted text-xs tracking-widest uppercase opacity-40">
                  {experienceGroups.length} companies
                </span>
              </div>
              <div className="flex flex-col gap-7">
                {visibleGroups.map((group, i) => (
                  <ExperienceGroupCard key={i} group={group} />
                ))}
              </div>
              {hiddenGroupsCount > 0 && (
                <button
                  onClick={() => setShowAllExp((v) => !v)}
                  className="about-view-all mt-6 w-full py-3 rounded-xl border border-[#f0ede4]/15 text-[#f0ede4]/60 text-xs tracking-widest uppercase hover:border-[#f0ede4]/35 hover:text-[#f0ede4] transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <span>{showAllExp ? "Show less" : `Show ${hiddenGroupsCount} more companies`}</span>
                  <svg
                    width="12"
                    height="12"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    className={`transition-transform duration-300 ${showAllExp ? "rotate-180" : ""}`}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              )}
            </div>

            {/* Achievements */}
            <div className="md:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="about-section-heading text-xl font-semibold">ACHIEVEMENTS</h2>
                <span className="about-card-muted text-xs tracking-widest uppercase opacity-40">
                  {achievements.length} total
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {achievementsPreview.map((item, i) => (
                  <InfoCard key={i} top={item.title} sub={item.place} meta={item.year} body={item.description} />
                ))}
              </div>
              {remainingAch > 0 && (
                <button
                  onClick={() => setAchievementsOpen(true)}
                  className="about-view-all w-full mt-4 py-3 rounded-xl border border-[#f0ede4]/15 text-[#f0ede4]/60 text-xs tracking-widest uppercase hover:border-[#f0ede4]/35 hover:text-[#f0ede4] transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <span>View {remainingAch} more</span>
                  <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              )}
            </div>

            {/* Education (last) */}
            <div className="md:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="about-section-heading text-xl font-semibold">EDUCATION</h2>
                <span className="about-card-muted text-xs tracking-widest uppercase opacity-40">Southland College</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {education.map((item, i) => (
                  <InfoCard key={i} top={item.level} sub={item.school} meta={item.years} body={item.description} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <FloatingControls />

      <Modal
        isOpen={achievementsOpen}
        onClose={() => setAchievementsOpen(false)}
        title={`All Achievements (${achievements.length})`}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {achievements.map((item, i) => (
            <InfoCard key={i} top={item.title} sub={item.place} meta={item.year} body={item.description} />
          ))}
        </div>
      </Modal>
    </>
  );
}
