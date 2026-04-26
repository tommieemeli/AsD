import { useState, useEffect } from "react";
import emote2 from "./kuvat/emote2.png";
import "./App.css";

const ACCENT = "#f07868";

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconGithub = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
  </svg>
);
const IconLinkedin = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);
const IconInstagram = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
  </svg>
);
const IconExternal = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);
const IconDownload = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);
const IconArrow = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

// ─── Nav ──────────────────────────────────────────────────────────────────────
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.offsetTop - 72, behavior: "smooth" });
  };

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: "0 2rem",
        height: "64px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: scrolled ? "rgba(43,49,71,0.95)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        transition: "background 0.3s",
        borderBottom: scrolled ? "1px solid rgba(232,228,222,0.06)" : "none",
      }}
    >
      <span
        style={{
          fontFamily: "Space Grotesk",
          fontWeight: 700,
          fontSize: "1.1rem",
          letterSpacing: "-0.02em",
          color: ACCENT,
        }}
      >
        TH
      </span>
      <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
        {[
          ["portfolio", "Portfolio"],
          ["kokemus", "Experience"],
          ["yhteystiedot", "Contact"],
        ].map(([id, label]) => (
          <button key={id} onClick={() => scrollTo(id)} className="nav-btn">
            {label}
          </button>
        ))}
      </div>
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.offsetTop - 72, behavior: "smooth" });
  };

  return (
    <section
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "6rem 2rem 4rem",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.03,
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(232,228,222,0.8) 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />

      <div
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(-20px)",
          transition: "opacity 0.7s ease, transform 0.7s ease",
          marginBottom: "1.5rem",
        }}
      >
        <img
          src={emote2}
          alt="Tommi"
          style={{ width: 180, height: 180, objectFit: "cover" }}
        />
      </div>

      <div
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.7s ease 0.15s, transform 0.7s ease 0.15s",
        }}
      >
        <h1
          style={{
            fontFamily: "Space Grotesk",
            fontWeight: 700,
            fontSize: "clamp(2.5rem, 5vw, 4rem)",
            letterSpacing: "-0.04em",
            lineHeight: 1,
            color: ACCENT,
            marginBottom: "1.5rem",
            textShadow: `0 0 40px ${ACCENT}44`,
          }}
        >
          Töihin.
        </h1>
        <p
          style={{
            fontFamily: "Space Grotesk",
            fontWeight: 400,
            fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
            color: "rgba(232,228,222,0.55)",
            marginBottom: "0.5rem",
            letterSpacing: "0.01em",
          }}
        >
          Tommi Haapa
        </p>
        <p
          style={{
            fontSize: "1rem",
            color: "rgba(232,228,222,0.45)",
            marginBottom: "2.5rem",
            maxWidth: "440px",
            lineHeight: 1.6,
          }}
        >
          Software Developer · building staff
        </p>

        <div
          style={{
            display: "flex",
            gap: "1rem",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <button onClick={() => scrollTo("portfolio")} className="btn-primary">
            View projects <IconArrow />
          </button>
          <a href="/CV-Tommi-Haapa.pdf" download className="btn-outline">
            <IconDownload /> Download CV
          </a>
        </div>

        <div
          style={{
            display: "flex",
            gap: "1.25rem",
            justifyContent: "center",
            marginTop: "3rem",
          }}
        >
          {[
            ["https://github.com/tommieemeli", <IconGithub />],
            ["https://linkedin.com/in/tommihaapa/", <IconLinkedin />],
            ["https://www.instagram.com/taikuritommi/", <IconInstagram />],
          ].map(([href, icon], i) => (
            <a
              key={i}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="icon-link"
            >
              {icon}
            </a>
          ))}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: "2.5rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          opacity: 0.3,
          animation: "bounce 2s infinite",
        }}
      >
        <div
          style={{ width: 1, height: 40, background: "rgba(232,228,222,0.5)" }}
        />
      </div>
    </section>
  );
}

// ─── Tag ──────────────────────────────────────────────────────────────────────
function Tag({ label }) {
  return (
    <span
      style={{
        background: `${ACCENT}15`,
        color: ACCENT,
        border: `1px solid ${ACCENT}33`,
        borderRadius: "3px",
        padding: "0.2rem 0.55rem",
        fontSize: "0.75rem",
        fontFamily: "Space Grotesk",
        fontWeight: 500,
        letterSpacing: "0.02em",
      }}
    >
      {label}
    </span>
  );
}

// ─── SectionHeader ────────────────────────────────────────────────────────────
function SectionHeader({ label, title }) {
  return (
    <div>
      <p
        style={{
          fontFamily: "Space Grotesk",
          fontWeight: 600,
          fontSize: "0.7rem",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: ACCENT,
          marginBottom: "0.6rem",
        }}
      >
        {label}
      </p>
      <h2
        style={{
          fontFamily: "Space Grotesk",
          fontWeight: 700,
          fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
          letterSpacing: "-0.03em",
          color: "#e8e4de",
        }}
      >
        {title}
      </h2>
    </div>
  );
}

// ─── ProjectCard ──────────────────────────────────────────────────────────────
function ProjectCard({ project }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => project.url && window.open(project.url, "_blank")}
      style={{
        background: hovered
          ? "rgba(255,255,255,0.05)"
          : "rgba(255,255,255,0.03)",
        border: `1px solid ${hovered ? ACCENT + "44" : "rgba(232,228,222,0.08)"}`,
        borderRadius: "8px",
        padding: "1.75rem",
        transition: "all 0.2s ease",
        cursor: project.url ? "pointer" : "default",
        transform: hovered ? "translateY(-2px)" : "none",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "0.75rem",
        }}
      >
        <h3
          style={{
            fontFamily: "Space Grotesk",
            fontWeight: 600,
            fontSize: "1.05rem",
            color: "#e8e4de",
            letterSpacing: "-0.01em",
          }}
        >
          {project.title}
        </h3>
        <span
          style={{
            background:
              project.status === "Live"
                ? `${ACCENT}20`
                : "rgba(232,228,222,0.08)",
            color: project.status === "Live" ? ACCENT : "rgba(232,228,222,0.4)",
            border: `1px solid ${project.status === "Live" ? ACCENT + "44" : "rgba(232,228,222,0.1)"}`,
            borderRadius: "3px",
            padding: "0.15rem 0.5rem",
            fontSize: "0.7rem",
            fontFamily: "Space Grotesk",
            fontWeight: 600,
            letterSpacing: "0.05em",
            flexShrink: 0,
            marginLeft: "0.75rem",
          }}
        >
          {project.status}
        </span>
      </div>
      <p
        style={{
          fontSize: "0.875rem",
          color: "rgba(232,228,222,0.55)",
          lineHeight: 1.65,
          marginBottom: "1.25rem",
        }}
      >
        {project.desc}
      </p>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.4rem",
          marginBottom: project.url ? "1.25rem" : 0,
        }}
      >
        {project.tags.map((t) => (
          <Tag key={t} label={t} />
        ))}
      </div>
      {project.url && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.35rem",
            color: hovered ? ACCENT : "rgba(232,228,222,0.3)",
            fontSize: "0.8rem",
            fontFamily: "Space Grotesk",
            fontWeight: 500,
            transition: "color 0.2s",
          }}
        >
          {project.isGithub ? <IconGithub /> : <IconExternal />}
          {project.isGithub
            ? "github.com/tommieemeli"
            : project.url.replace("https://", "")}
        </div>
      )}
    </div>
  );
}

// ─── Portfolio ────────────────────────────────────────────────────────────────
function Portfolio() {
  const projects = [
    {
      title: "autojentuontiverot.fi",
      desc: "A public web service simplifying car import tax calculations in Finland. Built end-to-end — architecture, implementation, deployment, and ongoing maintenance.",
      tags: ["React", "Node.js", "PostgreSQL"],
      url: "https://autojentuontiverot.fi",
      status: "Live",
    },
    {
      title: "IFE Demo – RAVE Aerospace",
      desc: "A modern In-Flight Entertainment demo app showcased at Aircraft Interiors Expo (AIX) in Hamburg (2026). Built with Qt/QML with a focus on clean architecture and visual quality.",
      tags: ["Qt", "QML", "CMake", "Ansible", "Linux"],
      url: null,
      status: "Project",
    },
    {
      title: "SaaS Lending Platform",
      desc: "A modern SaaS lending platform for the financial sector covering the full lending lifecycle. Key clients include Valtiokonttori and Kuntarahoitus.",
      tags: ["React", "TypeScript", "C#", ".NET", "Azure", "PostgreSQL"],
      url: null,
      status: "Project",
    },
    {
      title: "GitHub – more projects",
      desc: "Additional projects and code samples on GitHub. Full-stack applications built with React, Node.js, and PostgreSQL.",
      tags: ["React", "Node.js", "PostgreSQL"],
      url: "https://github.com/tommieemeli",
      status: "GitHub",
      isGithub: true,
    },
  ];

  return (
    <section
      id="portfolio"
      style={{ padding: "6rem 2rem", maxWidth: "1100px", margin: "0 auto" }}
    >
      <SectionHeader label="Portfolio" title="Projects" />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "1.25rem",
          marginTop: "3rem",
        }}
      >
        {projects.map((p, i) => (
          <ProjectCard key={i} project={p} />
        ))}
      </div>
    </section>
  );
}

// ─── TimelineItem ─────────────────────────────────────────────────────────────
function TimelineItem({ job, isLast }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1px 1fr",
        gap: "0 1.75rem",
        marginBottom: isLast ? 0 : "2.5rem",
      }}
    >
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: ACCENT,
            flexShrink: 0,
            marginTop: "0.3rem",
            zIndex: 1,
          }}
        />
        {!isLast && (
          <div
            style={{
              flex: 1,
              width: 1,
              background: `${ACCENT}22`,
              marginTop: "0.5rem",
            }}
          />
        )}
      </div>
      <div style={{ paddingLeft: "0.25rem" }}>
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            alignItems: "baseline",
            flexWrap: "wrap",
            marginBottom: "0.3rem",
          }}
        >
          <h3
            style={{
              fontFamily: "Space Grotesk",
              fontWeight: 600,
              fontSize: "1rem",
              color: "#e8e4de",
              letterSpacing: "-0.01em",
            }}
          >
            {job.company}
          </h3>
          <span
            style={{
              fontSize: "0.75rem",
              color: ACCENT,
              fontFamily: "Space Grotesk",
              fontWeight: 500,
            }}
          >
            {job.period}
          </span>
        </div>
        <p
          style={{
            fontSize: "0.8rem",
            color: "rgba(232,228,222,0.4)",
            marginBottom: "0.6rem",
            fontFamily: "Space Grotesk",
            fontWeight: 500,
          }}
        >
          {job.role}
        </p>
        <p
          style={{
            fontSize: "0.875rem",
            color: "rgba(232,228,222,0.55)",
            lineHeight: 1.65,
            marginBottom: "0.85rem",
          }}
        >
          {job.desc}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
          {job.tags.map((t) => (
            <Tag key={t} label={t} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Kokemus ──────────────────────────────────────────────────────────────────
function Kokemus() {
  const jobs = [
    {
      company: "Reaktor",
      role: "Software Developer (consultant)",
      period: "2025–2026",
      desc: "Designing and delivering modern software solutions as a consultant. Built an IFE demo app for RAVE Aerospace (Qt/QML) presented at AIX in Hamburg. Technical specialist in sales processes and contributed to the architecture of EQ's new web presence.",
      tags: ["Qt", "QML", "Kotlin", "CMake", "Ansible", "Linux", "Bash"],
    },
    {
      company: "Evitec Oy",
      role: "Software engineer",
      period: "2021–2025",
      desc: "Designing and developing a modern SaaS lending platform for the financial sector. Key clients: Valtiokonttori and Kuntarahoitus. Mentored 3 junior developers. Responsible for full frontend/backend development, CI/CD pipelines on Azure, and database solutions.",
      tags: [
        "React",
        "TypeScript",
        "C#",
        ".NET",
        "Azure",
        "Docker",
        "PostgreSQL",
        "Jest",
        "Cypress",
      ],
    },
  ];

  const skills = {
    Frontend: ["React", "TypeScript", "JavaScript", "HTML", "CSS"],
    Backend: ["Node.js", "C#", ".NET", "PostgreSQL", "SQL"],
    "DevOps & Cloud": ["Azure", "Docker", "CI/CD", "Azure DevOps", "YAML"],
    Testing: ["Jest", "Cypress", "xUnit", "Moq"],
    Other: ["Qt", "QML", "Kotlin", "CMake", "Ansible", "Linux", "Bash"],
    "AI tools": ["GitHub Copilot", "Claude", "Figma MCP"],
  };

  return (
    <section
      id="kokemus"
      style={{ padding: "6rem 2rem", background: "rgba(0,0,0,0.15)" }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "1rem",
            marginBottom: "3rem",
          }}
        >
          <SectionHeader label="CV" title="Experience" />
          <a
            href="/CV-Tommi-Haapa.pdf"
            download
            className="btn-primary"
            style={{
              alignSelf: "flex-end",
              textDecoration: "none",
              padding: "0.65rem 1.25rem",
              fontSize: "0.85rem",
            }}
          >
            <IconDownload /> Download CV
          </a>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0,1fr) minmax(0,360px)",
            gap: "4rem",
            alignItems: "start",
          }}
        >
          <div>
            {jobs.map((job, i) => (
              <TimelineItem key={i} job={job} isLast={i === jobs.length - 1} />
            ))}
          </div>
          <div style={{ position: "sticky", top: "5rem" }}>
            <p
              style={{
                fontFamily: "Space Grotesk",
                fontWeight: 600,
                fontSize: "0.7rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "rgba(232,228,222,0.35)",
                marginBottom: "1.5rem",
              }}
            >
              Technologies
            </p>
            {Object.entries(skills).map(([cat, list]) => (
              <div key={cat} style={{ marginBottom: "1.25rem" }}>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "rgba(232,228,222,0.4)",
                    marginBottom: "0.5rem",
                    fontFamily: "Space Grotesk",
                    fontWeight: 500,
                  }}
                >
                  {cat}
                </p>
                <div
                  style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}
                >
                  {list.map((s) => (
                    <Tag key={s} label={s} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Contact ──────────────────────────────────────────────────────────────────
function Contact() {
  return (
    <section
      id="yhteystiedot"
      style={{ padding: "6rem 2rem 8rem", textAlign: "center" }}
    >
      <div style={{ maxWidth: "520px", margin: "0 auto" }}>
        <p
          style={{
            fontFamily: "Space Grotesk",
            fontWeight: 600,
            fontSize: "0.7rem",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: ACCENT,
            marginBottom: "0.75rem",
          }}
        >
          Get in touch
        </p>
        <h2
          style={{
            fontFamily: "Space Grotesk",
            fontWeight: 700,
            fontSize: "clamp(1.75rem, 5vw, 2.75rem)",
            letterSpacing: "-0.03em",
            marginBottom: "1rem",
            color: "#e8e4de",
          }}
        >
          Let's work.
        </h2>
        <p
          style={{
            color: "rgba(232,228,222,0.5)",
            fontSize: "1rem",
            lineHeight: 1.65,
            marginBottom: "2.5rem",
          }}
        >
          I'm open to new challenges and projects. Feel free to reach out
        </p>
        <a
          href="mailto:tommi-haapa@hotmail.com"
          className="btn-primary"
          style={{
            textDecoration: "none",
            padding: "0.9rem 2.25rem",
            fontSize: "1rem",
          }}
        >
          tommi-haapa@hotmail.com
        </a>
        <div
          style={{
            display: "flex",
            gap: "1.25rem",
            justifyContent: "center",
            marginTop: "2.5rem",
          }}
        >
          {[
            ["https://github.com/tommieemeli", <IconGithub />],
            ["https://linkedin.com/in/tommihaapa/", <IconLinkedin />],
            ["https://www.instagram.com/taikuritommi/", <IconInstagram />],
          ].map(([href, icon], i) => (
            <a
              key={i}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="icon-link"
            >
              {icon}
            </a>
          ))}
        </div>
      </div>
      <p
        style={{
          marginTop: "5rem",
          fontSize: "0.75rem",
          color: "rgba(232,228,222,0.2)",
          fontFamily: "Space Grotesk",
        }}
      >
        © 2026 Tommi Haapa · Finland
      </p>
    </section>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
function App() {
  return (
    <>
      <Nav />
      <Hero />
      <Portfolio />
      <Kokemus />
      <Contact />
    </>
  );
}

export default App;
