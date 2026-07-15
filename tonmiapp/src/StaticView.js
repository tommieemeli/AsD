// ─── Static RPG-styled portfolio for mobile / touch devices ──────────────────
import { useEffect, useRef, useState } from "react";
import { getSprites } from "./game/sprites";
import { PROJECTS, SKILLS, JOBS, ABOUT, LINKS } from "./game/content";

// Draws one of the game's code-generated pixel sprites into a <canvas>,
// optionally cycling animation frames.
function PixelSprite({ frames, scale = 4, fps = 3, style, className }) {
  const ref = useRef(null);
  useEffect(() => {
    const cvs = ref.current;
    const list = Array.isArray(frames) ? frames : [frames];
    const w = Math.max(...list.map((f) => f.width));
    const h = Math.max(...list.map((f) => f.height));
    cvs.width = w * scale;
    cvs.height = h * scale;
    const ctx = cvs.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    let raf = 0;
    let i = 0;
    let last = 0;
    const draw = (t) => {
      ctx.clearRect(0, 0, cvs.width, cvs.height);
      ctx.drawImage(list[i], 0, 0, w * scale, h * scale);
      if (list.length > 1) {
        if (t - last > 1000 / fps) {
          last = t;
          i = (i + 1) % list.length;
        }
        raf = requestAnimationFrame(draw);
      }
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [frames, scale, fps]);
  return (
    <canvas
      ref={ref}
      className={className}
      style={{ imageRendering: "pixelated", display: "block", ...style }}
    />
  );
}

function Panel({ title, badge, children, id }) {
  return (
    <section className="mv-panel" id={id}>
      {(title || badge) && (
        <div className="mv-panel-head">
          {title && <h2 className="mv-panel-title">{title}</h2>}
          {badge && <span className="dlg-badge">{badge}</span>}
        </div>
      )}
      {children}
    </section>
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

export default function StaticView({ onPlay }) {
  const S = getSprites();
  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAnimate(true), 250);
    return () => clearTimeout(t);
  }, []);

  const crystalColors = ["#3ec8dc", "#ffae4a", "#5ad46e", "#a86ee8"];

  return (
    <div className="mv-root">
      <div className="mv-inner">
        {/* ── hero ── */}
        <header className="mv-hero">
          <div className="mv-sub-top">A PIXEL-ART PORTFOLIO</div>
          <h1 className="mv-name">TOMMI HAAPA</h1>
          <div className="mv-sub">— THE DEVELOPER'S QUEST —</div>
          <div className="mv-hero-scene">
            <PixelSprite frames={S.hero.down[0]} scale={5} />
            <PixelSprite frames={S.campfire} scale={5} fps={6} />
            <PixelSprite frames={S.guide} scale={5} fps={2} />
          </div>
          <div className="hud-plate mv-plate">
            <div className="hud-name">TOMMI HAAPA</div>
            <div className="hud-sub">Lv.{ABOUT.level} {ABOUT.title}</div>
            <div className="hud-bar hp"><div style={{ width: "100%" }} /></div>
            <div className="hud-bar mp"><div style={{ width: "86%" }} /></div>
          </div>
        </header>

        {/* ── about ── */}
        <Panel title="Well met, traveler!" badge="NPC · About">
          <p className="dlg-text">{ABOUT.text}</p>
          <div className="btn-row">
            <LinkBtn href={LINKS.cv} download primary>⤓ Download CV scroll</LinkBtn>
          </div>
        </Panel>

        {/* ── projects ── */}
        <Panel title="Hall of Projects" badge="Artifacts">
          <div className="mv-projects">
            {PROJECTS.map((p, i) => (
              <div className="mv-card" key={p.id}>
                <div className="mv-card-head">
                  <PixelSprite frames={S.crystals[i]} scale={4} />
                  <div>
                    <h3 className="mv-card-title" style={{ color: crystalColors[i] }}>
                      {p.title}
                    </h3>
                    <div className="mv-card-sub">{p.subtitle}</div>
                  </div>
                </div>
                <p className="dlg-text small">{p.desc}</p>
                <div className="tag-row">
                  {p.tags.map((t) => <PixelTag key={t} label={t} />)}
                </div>
                {p.url && (
                  <div className="btn-row">
                    <LinkBtn href={p.url} primary>➤ {p.urlLabel}</LinkBtn>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Panel>

        {/* ── skills ── */}
        <Panel title="Skill Appraisal" badge="Archmage Codewyn">
          <div className="mv-wizard-row">
            <PixelSprite frames={S.wizard} scale={4} fps={2} />
            <p className="dlg-text small" style={{ margin: 0 }}>
              "Hmm… let me read your companion's aura. Impressive attributes,
              traveler!"
            </p>
          </div>
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
        </Panel>

        {/* ── experience ── */}
        <Panel title="Quest Board" badge="Experience">
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
                {j.tags.map((t) => <PixelTag key={t} label={t} />)}
              </div>
            </div>
          ))}
        </Panel>

        {/* ── treasure / CV ── */}
        <Panel title="Treasure Chest" badge="Rare Loot!">
          <div className="mv-wizard-row">
            <PixelSprite frames={S.chestClosed} scale={4} />
            <p className="dlg-text small" style={{ margin: 0 }}>
              ✨ Scroll of Curriculum Vitae ✨ — a legendary document detailing
              the campaigns, artifacts and abilities of Tommi Haapa.
            </p>
          </div>
          <div className="btn-row">
            <LinkBtn href={LINKS.cv} download primary>⤓ Take the scroll (PDF)</LinkBtn>
          </div>
        </Panel>

        {/* ── contact ── */}
        <Panel title="Portal of Contact" badge="Summoning">
          <p className="dlg-text small">
            The portal hums with arcane energy. I'm open to new challenges and
            projects — feel free to reach out!
          </p>
          <div className="btn-row wrap">
            <LinkBtn href={LINKS.email} primary>✉ tommi-haapa@hotmail.com</LinkBtn>
            <LinkBtn href={LINKS.github}>GitHub</LinkBtn>
            <LinkBtn href={LINKS.linkedin}>LinkedIn</LinkBtn>
            <LinkBtn href={LINKS.instagram}>Instagram</LinkBtn>
          </div>
        </Panel>

        {/* ── play the game ── */}
        <div className="mv-play">
          <button className="pbtn pbtn-gold mv-play-btn" onClick={onPlay}>
            ⚔ Enter the interactive realm
          </button>
          <div className="mv-play-note">
            A playable RPG version of this portfolio — best experienced on a
            desktop with a keyboard.
          </div>
        </div>

        <footer className="mv-footer">
          © 2026 Tommi Haapa · Finland · React + Canvas, no game engine
        </footer>
      </div>
    </div>
  );
}
