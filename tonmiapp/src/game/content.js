// ─── Portfolio content presented through the game's dialogs ──────────────────

export const LINKS = {
  github: "https://github.com/tommieemeli",
  linkedin: "https://linkedin.com/in/tommihaapa/",
  instagram: "https://www.instagram.com/taikuritommi/",
  email: "mailto:tommi-haapa@hotmail.com",
  cv: "/CV-Tommi-Haapa.pdf",
};

export const PROJECTS = [
  {
    id: "proj-autovero",
    title: "autojentuontiverot.fi",
    subtitle: "Legendary Artifact · Live",
    desc: "A public web service simplifying car import tax calculations in Finland. Forged end-to-end — architecture, implementation, deployment, and ongoing maintenance.",
    tags: ["React", "Node.js", "PostgreSQL"],
    url: "https://autojentuontiverot.fi",
    urlLabel: "Visit autojentuontiverot.fi",
  },
  {
    id: "proj-rave",
    title: "IFE Demo — RAVE Aerospace",
    subtitle: "Epic Artifact · Showcased at AIX Hamburg 2026",
    desc: "A modern In-Flight Entertainment demo app showcased at Aircraft Interiors Expo (AIX) in Hamburg. Built with Qt/QML with a focus on clean architecture and visual quality.",
    tags: ["Qt", "QML", "CMake", "Ansible", "Linux"],
    url: null,
  },
  {
    id: "proj-saas",
    title: "SaaS Lending Platform",
    subtitle: "Epic Artifact · Financial sector",
    desc: "A modern SaaS lending platform covering the full lending lifecycle. Key clients include Valtiokonttori and Kuntarahoitus.",
    tags: ["React", "TypeScript", "C#", ".NET", "Azure", "PostgreSQL"],
    url: null,
  },
  {
    id: "proj-github",
    title: "GitHub — more quests",
    subtitle: "Open Archive",
    desc: "Additional projects and code samples on GitHub. Full-stack applications built with React, Node.js, and PostgreSQL.",
    tags: ["React", "Node.js", "PostgreSQL"],
    url: LINKS.github,
    urlLabel: "Open GitHub",
  },
];

export const SKILLS = [
  { name: "React", lv: 92, cat: "Frontend" },
  { name: "TypeScript", lv: 88, cat: "Frontend" },
  { name: "JavaScript / HTML / CSS", lv: 90, cat: "Frontend" },
  { name: "C# / .NET", lv: 84, cat: "Backend" },
  { name: "Node.js", lv: 82, cat: "Backend" },
  { name: "PostgreSQL / SQL", lv: 80, cat: "Backend" },
  { name: "Azure / CI-CD / Docker", lv: 78, cat: "DevOps" },
  { name: "Jest / Cypress / xUnit", lv: 76, cat: "Testing" },
  { name: "Qt / QML / Kotlin", lv: 70, cat: "Other" },
  { name: "Linux / Bash / Ansible", lv: 72, cat: "Other" },
  { name: "AI tools · Claude / Copilot / Figma MCP", lv: 85, cat: "Arcane" },
];

export const JOBS = [
  {
    company: "Reaktor",
    role: "Software Developer (consultant)",
    period: "2025 – 2026",
    desc: "Designing and delivering modern software solutions as a consultant. Built an IFE demo app for RAVE Aerospace (Qt/QML) presented at AIX in Hamburg. Technical specialist in sales processes and contributed to the architecture of EQ's new web presence.",
    tags: ["Qt", "QML", "Kotlin", "CMake", "Ansible", "Linux", "Bash"],
  },
  {
    company: "Evitec Oy",
    role: "Software Engineer",
    period: "2021 – 2025",
    desc: "Designing and developing a modern SaaS lending platform for the financial sector. Key clients: Valtiokonttori and Kuntarahoitus. Mentored junior developers. Responsible for full frontend/backend development, CI/CD pipelines on Azure, and database solutions.",
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

export const ABOUT = {
  name: "Tommi Haapa",
  title: "Software Engineer",
  level: 30,
  text:
    "Well met, traveler! I am Tommi — a software engineer from Finland. " +
    "I build full-stack web services, polished UIs and the occasional aerospace demo. " +
    "Explore this realm to discover my quests, skills and past campaigns — and open the portal if you wish to summon me.",
};
