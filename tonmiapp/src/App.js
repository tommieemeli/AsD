import { useState, useEffect, useRef, useCallback } from "react";
import GameCanvas from "./game/GameCanvas";
import StaticView from "./StaticView";
import { PROJECTS, SKILLS, JOBS, ABOUT, LINKS } from "./game/content";
import "./App.css";

// Touch-first devices get the static scrollable view; the playable world
// needs a keyboard. ?mobile=1 / ?game=1 force either for testing.
function detectMobile() {
  const q = new URLSearchParams(window.location.search);
  if (q.has("game")) return false;
  if (q.has("mobile")) return true;
  return (
    window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 640
  );
}

const QUEST_IDS = [
  "sign",
  "about",
  "proj-autovero",
  "proj-rave",
  "proj-saas",
  "proj-github",
  "skills",
  "experience",
  "cv",
  "contact",
];

// ─── Typewriter ───────────────────────────────────────────────────────────────
function useTypewriter(text, cps = 55) {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(0);
    const iv = setInterval(() => {
      setN((v) => {
        if (v >= text.length) {
          clearInterval(iv);
          return v;
        }
        return v + 1;
      });
    }, 1000 / cps);
    return () => clearInterval(iv);
  }, [text, cps]);
  return [text.slice(0, n), n >= text.length, () => setN(text.length)];
}

function TypeText({ text }) {
  const [shown, done, skip] = useTypewriter(text);
  return (
    <p className="dlg-text" onClick={skip}>
      {shown}
      {!done && <span className="cursor">▌</span>}
    </p>
  );
}

// ─── Dialog shells ────────────────────────────────────────────────────────────
function Dialog({ title, badge, onClose, children, wide }) {
  return (
    <div className="dlg-overlay" onClick={onClose}>
      <div
        className={"dlg-frame" + (wide ? " dlg-wide" : "")}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dlg-header">
          <span className="dlg-title">{title}</span>
          {badge && <span className="dlg-badge">{badge}</span>}
          <button className="dlg-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="dlg-body">{children}</div>
        <div className="dlg-footer">
          [E] / [Esc] close · click ▼ to continue
        </div>
      </div>
    </div>
  );
}

function PixelTag({ label }) {
  return <span className="ptag">{label}</span>;
}

function LinkBtn({ href, children, download, primary }) {
  return (
    <a
      className={primary ? "pbtn pbtn-gold" : "pbtn"}
      href={href}
      download={download}
      target={href && href.startsWith("http") ? "_blank" : undefined}
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
}

// ─── Dialog contents ──────────────────────────────────────────────────────────
function SignDialog({ onClose }) {
  return (
    <Dialog title="Weathered Signpost" onClose={onClose}>
      <TypeText
        text={
          "Welcome to the Realm of Tommi Haapa — Software Developer.\n\nFollow the torchlit roads:\n▲ North — Hall of Projects\n► East — Mage Tower of Skills & the Quest Board\n◄ West — a hidden treasure in the woods\n✦ Far north-east — the Portal of Contact"
        }
      />
      <div className="dlg-hint">Move: WASD / Arrow keys · Interact: E</div>
    </Dialog>
  );
}

function AboutDialog({ onClose }) {
  return (
    <Dialog
      title={`${ABOUT.name} — Lv.${ABOUT.level} ${ABOUT.title}`}
      badge="NPC"
      onClose={onClose}
    >
      <TypeText text={ABOUT.text} />
      <div className="btn-row">
        <LinkBtn href={LINKS.cv} download primary>
          ⤓ Download CV scroll
        </LinkBtn>
        <LinkBtn href={LINKS.github}>GitHub</LinkBtn>
        <LinkBtn href={LINKS.linkedin}>LinkedIn</LinkBtn>
      </div>
    </Dialog>
  );
}

function ProjectDialog({ project, onClose }) {
  return (
    <Dialog title={project.title} badge={project.subtitle} onClose={onClose}>
      <TypeText text={project.desc} />
      <div className="tag-row">
        {project.tags.map((t) => (
          <PixelTag key={t} label={t} />
        ))}
      </div>
      {project.url && (
        <div className="btn-row">
          <LinkBtn href={project.url} primary>
            ➤ {project.urlLabel}
          </LinkBtn>
        </div>
      )}
    </Dialog>
  );
}

function SkillsDialog({ onClose }) {
  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 60);
    return () => clearTimeout(t);
  }, []);
  return (
    <Dialog
      title="Archmage Codewyn"
      badge="Skill Appraisal"
      onClose={onClose}
      wide
    >
      <TypeText
        text={
          "Hmm… let me read your companion's aura. Impressive attributes, traveler!"
        }
      />
      <div className="skill-list">
        {SKILLS.map((s, i) => (
          <div className="skill-row" key={s.name}>
            <span className="skill-name">{s.name}</span>
            <span className="skill-cat">{s.cat}</span>
            <div className="skill-bar">
              <div
                className="skill-fill"
                style={{
                  width: animate ? `${s.lv}%` : "0%",
                  transitionDelay: `${i * 70}ms`,
                }}
              />
            </div>
            <span className="skill-lv">Lv.{s.lv}</span>
          </div>
        ))}
      </div>
    </Dialog>
  );
}

function ExperienceDialog({ onClose }) {
  return (
    <Dialog
      title="Quest Board — Campaign Log"
      badge="Experience"
      onClose={onClose}
      wide
    >
      {JOBS.map((j) => (
        <div className="quest-entry" key={j.company}>
          <div className="quest-head">
            <span className="quest-stamp">✔ QUEST COMPLETE</span>
            <span className="quest-period">{j.period}</span>
          </div>
          <div className="quest-company">{j.company}</div>
          <div className="quest-role">{j.role}</div>
          <p className="dlg-text small">{j.desc}</p>
          <div className="tag-row">
            {j.tags.map((t) => (
              <PixelTag key={t} label={t} />
            ))}
          </div>
        </div>
      ))}
      <div className="btn-row">
        <LinkBtn href={LINKS.cv} download primary>
          ⤓ Full CV (PDF)
        </LinkBtn>
      </div>
    </Dialog>
  );
}

function CvDialog({ onClose }) {
  return (
    <Dialog title="Treasure Chest" badge="Rare Loot!" onClose={onClose}>
      <TypeText
        text={
          "You open the chest and find…\n\n✨ Scroll of Curriculum Vitae ✨\n\nA legendary document detailing the campaigns, artifacts and abilities of Tommi Haapa."
        }
      />
      <div className="btn-row">
        <LinkBtn href={LINKS.cv} download primary>
          ⤓ Take the scroll (PDF)
        </LinkBtn>
      </div>
    </Dialog>
  );
}

function ContactDialog({ onClose }) {
  return (
    <Dialog title="Portal of Contact" badge="Summoning" onClose={onClose}>
      <TypeText
        text={
          "The portal hums with arcane energy. Speak, and the developer shall answer.\n\nI'm open to new challenges and projects — feel free to reach out!"
        }
      />
      <div className="btn-row wrap">
        <LinkBtn href={LINKS.email} primary>
          ✉ Whisper
        </LinkBtn>
        <LinkBtn href={LINKS.github}>GitHub</LinkBtn>
        <LinkBtn href={LINKS.linkedin}>LinkedIn</LinkBtn>
        <LinkBtn href={LINKS.instagram}>Instagram</LinkBtn>
      </div>
    </Dialog>
  );
}

// ─── HUD ──────────────────────────────────────────────────────────────────────
function Hud({ discovered, prompt, isTouch }) {
  const count = discovered.size;
  const total = QUEST_IDS.length;
  return (
    <>
      <div className="hud-plate">
        <div className="hud-name">TOMMI HAAPA</div>
        <div className="hud-sub">Lv.30 Software Developer</div>
        <div className="hud-bar hp">
          <div style={{ width: "100%" }} />
        </div>
        <div className="hud-bar mp">
          <div style={{ width: "86%" }} />
        </div>
      </div>
      <div className="hud-quest">
        <div className="hud-quest-title">⟡ QUEST: Explore the Realm</div>
        <div className="hud-quest-progress">
          {count >= total ? "Complete! ⚔" : `Discoveries ${count} / ${total}`}
        </div>
      </div>
      <div className="hud-hint">
        {prompt
          ? isTouch
            ? `Tap Ⓐ — ${prompt.label}`
            : `[E] ${prompt.label}`
          : isTouch
            ? "Use the pad to explore"
            : "WASD / Arrows — move · E — interact"}
      </div>
    </>
  );
}

function TouchControls({ controlsRef }) {
  const bind = (dir) => ({
    onTouchStart: (e) => {
      e.preventDefault();
      controlsRef.current[dir] = true;
    },
    onTouchEnd: (e) => {
      e.preventDefault();
      controlsRef.current[dir] = false;
    },
  });
  return (
    <>
      <div className="dpad">
        <button className="dpad-btn up" {...bind("up")}>
          ▲
        </button>
        <button className="dpad-btn left" {...bind("left")}>
          ◀
        </button>
        <button className="dpad-btn right" {...bind("right")}>
          ▶
        </button>
        <button className="dpad-btn down" {...bind("down")}>
          ▼
        </button>
      </div>
      <button
        className="action-btn"
        onTouchStart={(e) => {
          e.preventDefault();
          controlsRef.current.action = true;
        }}
      >
        A
      </button>
    </>
  );
}

// ─── Title screen ─────────────────────────────────────────────────────────────
function TitleScreen({ onStart }) {
  useEffect(() => {
    const fn = (e) => {
      if (e.code === "Enter" || e.code === "Space") onStart();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onStart]);
  return (
    <div className="title-screen" onClick={onStart}>
      <div className="title-inner">
        <div className="title-sub-top">A PIXEL-ART PORTFOLIO</div>
        <h1 className="title-name">
          TOMMI
          <br />
          HAAPA
        </h1>
        <div className="title-sub">— THE DEVELOPER'S QUEST —</div>
        <div className="title-start blink">▶ PRESS START</div>
        <div className="title-controls">
          WASD / ARROWS to move · E to interact
        </div>
      </div>
      <div className="title-footer">
        © 2026 Tommi Haapa · Finland · React + Canvas, no game engine
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [mobileView, setMobileView] = useState(detectMobile);
  const [started, setStarted] = useState(() =>
    new URLSearchParams(window.location.search).has("start"),
  );
  const [dialog, setDialog] = useState(
    () => new URLSearchParams(window.location.search).get("open") || null,
  );
  const [discovered, setDiscovered] = useState(() => new Set());
  const [prompt, setPrompt] = useState(null);
  const [toast, setToast] = useState(false);
  const uiRef = useRef({ started: false, dialog: null, openChest: null });
  const controlsRef = useRef({
    up: false,
    down: false,
    left: false,
    right: false,
    action: false,
  });
  const isTouch = typeof window !== "undefined" && "ontouchstart" in window;

  uiRef.current.started = started;
  uiRef.current.dialog = dialog;

  const onInteract = useCallback((entity) => {
    setDialog(entity.id);
    if (entity.id === "cv" && uiRef.current.openChest)
      uiRef.current.openChest();
    setDiscovered((prev) => {
      if (prev.has(entity.id)) return prev;
      const next = new Set(prev);
      next.add(entity.id);
      if (next.size === QUEST_IDS.length) {
        setToast(true);
        setTimeout(() => setToast(false), 6000);
      }
      return next;
    });
  }, []);

  const onNearest = useCallback((p) => setPrompt(p), []);
  const close = useCallback(() => setDialog(null), []);

  useEffect(() => {
    const fn = (e) => {
      if (e.code === "Escape") setDialog(null);
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  const project = PROJECTS.find((p) => p.id === dialog);

  if (mobileView) {
    return (
      <div className="app-root">
        <StaticView
          onPlay={() => {
            setMobileView(false);
            setStarted(true);
          }}
        />
        <div className="scanlines" />
      </div>
    );
  }

  return (
    <div className="app-root">
      <GameCanvas
        uiRef={uiRef}
        controlsRef={controlsRef}
        onInteract={onInteract}
        onNearest={onNearest}
      />
      <div className="scanlines" />

      {!started && <TitleScreen onStart={() => setStarted(true)} />}

      {started && (
        <Hud discovered={discovered} prompt={prompt} isTouch={isTouch} />
      )}
      {started && isTouch && <TouchControls controlsRef={controlsRef} />}

      {toast && (
        <div className="toast">
          ⚔ QUEST COMPLETE! You explored the whole realm — time to hire Tommi.
        </div>
      )}

      {dialog === "sign" && <SignDialog onClose={close} />}
      {dialog === "about" && <AboutDialog onClose={close} />}
      {project && <ProjectDialog project={project} onClose={close} />}
      {dialog === "skills" && <SkillsDialog onClose={close} />}
      {dialog === "experience" && <ExperienceDialog onClose={close} />}
      {dialog === "cv" && <CvDialog onClose={close} />}
      {dialog === "contact" && <ContactDialog onClose={close} />}
    </div>
  );
}
