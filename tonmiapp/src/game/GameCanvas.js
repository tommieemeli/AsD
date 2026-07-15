// ─── Game engine: loop, input, camera, lighting, particles ───────────────────
import { useEffect, useRef } from "react";
import { TILE, getSprites } from "./sprites";
import { buildWorld, renderGround, MAP_W, MAP_H } from "./world";

const WALK_SPEED = 92; // world px / s
const NIGHT = "rgba(9,13,34,0.5)";

export default function GameCanvas({ uiRef, controlsRef, onInteract, onNearest }) {
  const canvasRef = useRef(null);
  const cbRef = useRef({ onInteract, onNearest });
  cbRef.current.onInteract = onInteract;
  cbRef.current.onNearest = onNearest;

  useEffect(() => {
    const cvs = canvasRef.current;
    const ctx = cvs.getContext("2d");
    const S = getSprites();
    const world = buildWorld(S);
    const ground = renderGround(S, world);

    // lighting overlay buffer (world-pixel resolution of the viewport)
    const lightCvs = document.createElement("canvas");
    const lightCtx = lightCvs.getContext("2d");

    // debug/testing: ?at=castle|tower|portal|camp|chest jumps the player there
    const AT = {
      castle: { x: 28 * TILE, y: 12 * TILE },
      courtyard: { x: 28 * TILE, y: 6 * TILE },
      tower: { x: 45 * TILE, y: 23 * TILE },
      portal: { x: 47 * TILE, y: 10 * TILE },
      camp: { x: 39 * TILE, y: 35 * TILE },
      chest: { x: 9 * TILE, y: 30 * TILE },
      lake: { x: 14 * TILE, y: 16 * TILE },
    };
    const atParam = new URLSearchParams(window.location.search).get("at");
    const spawnAt = (atParam && AT[atParam]) || world.spawn;

    const player = {
      x: spawnAt.x,
      y: spawnAt.y,
      dir: "up",
      moving: false,
      frame: 0,
      frameT: 0,
    };

    const keys = {};
    let nearest = null;
    let lastNearKey = "";
    let raf = 0;
    let last = performance.now();
    let time = 0;
    let scale = 3;
    let viewW = 0;
    let viewH = 0;

    const particles = [];
    const fireflies = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cvs.width = Math.floor(window.innerWidth * dpr);
      cvs.height = Math.floor(window.innerHeight * dpr);
      cvs.style.width = window.innerWidth + "px";
      cvs.style.height = window.innerHeight + "px";
      scale = (window.innerWidth < 760 ? 2.6 : 3.4) * dpr;
      viewW = cvs.width / scale;
      viewH = cvs.height / scale;
      lightCvs.width = Math.ceil(viewW);
      lightCvs.height = Math.ceil(viewH);
    };
    resize();
    window.addEventListener("resize", resize);

    // ── input ──
    const KEYMAP = {
      ArrowUp: "up", KeyW: "up",
      ArrowDown: "down", KeyS: "down",
      ArrowLeft: "left", KeyA: "left",
      ArrowRight: "right", KeyD: "right",
    };
    const onKeyDown = (e) => {
      if (KEYMAP[e.code]) {
        keys[KEYMAP[e.code]] = true;
        e.preventDefault();
      }
      if ((e.code === "KeyE" || e.code === "Enter" || e.code === "Space") && !uiRef.current.dialog) {
        if (nearest) {
          e.preventDefault();
          cbRef.current.onInteract(nearest);
        }
      }
    };
    const onKeyUp = (e) => {
      if (KEYMAP[e.code]) keys[KEYMAP[e.code]] = false;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    // ── collision ──
    const solidAt = (x, y) => {
      const tx = Math.floor(x / TILE);
      const ty = Math.floor(y / TILE);
      if (tx < 0 || ty < 0 || tx >= MAP_W || ty >= MAP_H) return true;
      return world.solid[ty * MAP_W + tx] === 1;
    };
    const feetBox = (x, y) => ({ x: x - 5, y: y - 3, w: 10, h: 6 });
    const collides = (x, y) => {
      const b = feetBox(x, y);
      // tile collision at box corners
      for (const [cx, cy] of [
        [b.x, b.y], [b.x + b.w, b.y], [b.x, b.y + b.h], [b.x + b.w, b.y + b.h],
      ]) {
        if (solidAt(cx, cy)) return true;
      }
      for (const r of world.colliders) {
        if (b.x < r.x + r.w && b.x + b.w > r.x && b.y < r.y + r.h && b.y + b.h > r.y) return true;
      }
      return false;
    };

    // ── particles ──
    const spawnParticles = (dt, camX, camY) => {
      // fire sparks from strong warm lights in view
      for (const L of world.lights) {
        if (L.flicker < 0.3) continue;
        if (L.x < camX - 40 || L.x > camX + viewW + 40 || L.y < camY - 40 || L.y > camY + viewH + 40) continue;
        if (Math.random() < dt * 6) {
          particles.push({
            x: L.x + (Math.random() * 6 - 3),
            y: L.y - 2,
            vx: Math.random() * 8 - 4,
            vy: -14 - Math.random() * 12,
            life: 0,
            max: 0.9 + Math.random() * 0.5,
            color: Math.random() < 0.4 ? "255,220,120" : "255,150,60",
            size: 1,
          });
        }
      }
      // portal swirl
      const portal = world.entities.find((e) => e.portalCenter);
      if (portal) {
        const p = portal.portalCenter;
        if (p.x > camX - 60 && p.x < camX + viewW + 60 && p.y > camY - 60 && p.y < camY + viewH + 60) {
          if (Math.random() < dt * 22) {
            const a = Math.random() * Math.PI * 2;
            const r = 14 + Math.random() * 8;
            particles.push({
              x: p.x + Math.cos(a) * r,
              y: p.y + Math.sin(a) * r * 0.9,
              vx: -Math.cos(a) * 9,
              vy: -Math.sin(a) * 9 - 3,
              life: 0,
              max: 1.1 + Math.random() * 0.6,
              color: Math.random() < 0.5 ? "176,107,255" : "220,180,255",
              size: 1,
            });
          }
        }
      }
      // crystal sparkles
      for (const L of world.lights) {
        if (!L.pulse || L.flicker >= 0.3) continue;
        if (L.x < camX || L.x > camX + viewW || L.y < camY || L.y > camY + viewH) continue;
        if (Math.random() < dt * 1.6) {
          particles.push({
            x: L.x + (Math.random() * 10 - 5),
            y: L.y + (Math.random() * 8 - 4),
            vx: 0,
            vy: -6,
            life: 0,
            max: 0.8,
            color: L.color,
            size: 1,
          });
        }
      }
    };

    const ensureFireflies = () => {
      if (fireflies.length) return;
      for (const z of world.fireflyZones) {
        for (let i = 0; i < 14; i++) {
          fireflies.push({
            zx: z.x, zy: z.y, zw: z.w, zh: z.h,
            x: z.x + Math.random() * z.w,
            y: z.y + Math.random() * z.h,
            t: Math.random() * 100,
            sp: 0.3 + Math.random() * 0.5,
          });
        }
      }
    };
    ensureFireflies();

    // ── main loop ──
    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      let dt = (now - last) / 1000;
      last = now;
      if (dt > 0.1) dt = 0.1;
      time += dt;

      const ui = uiRef.current;
      const ctrl = controlsRef.current;

      // consume touch action
      if (ctrl.action) {
        ctrl.action = false;
        if (nearest && !ui.dialog) cbRef.current.onInteract(nearest);
      }

      // movement
      let mx = 0, my = 0;
      if (!ui.dialog && ui.started) {
        if (keys.up || ctrl.up) my -= 1;
        if (keys.down || ctrl.down) my += 1;
        if (keys.left || ctrl.left) mx -= 1;
        if (keys.right || ctrl.right) mx += 1;
      }
      player.moving = mx !== 0 || my !== 0;
      if (player.moving) {
        if (my < 0) player.dir = "up";
        else if (my > 0) player.dir = "down";
        if (mx < 0) player.dir = "left";
        else if (mx > 0) player.dir = "right";
        const len = Math.hypot(mx, my);
        const step = (WALK_SPEED * dt) / len;
        const nx = player.x + mx * step;
        const ny = player.y + my * step;
        if (!collides(nx, player.y)) player.x = nx;
        if (!collides(player.x, ny)) player.y = ny;
        player.frameT += dt;
        if (player.frameT > 0.14) {
          player.frameT = 0;
          player.frame = (player.frame + 1) % 4;
        }
      } else {
        player.frame = 0;
        player.frameT = 0;
      }

      // nearest interactable
      let best = null;
      let bestD = 1e9;
      for (const e of world.entities) {
        const d = Math.hypot(e.x - player.x, e.y - player.y);
        if (d < e.radius && d < bestD) {
          bestD = d;
          best = e;
        }
      }
      nearest = best;
      const nk = best ? best.id : "";
      if (nk !== lastNearKey) {
        lastNearKey = nk;
        cbRef.current.onNearest(best ? { id: best.id, label: best.label } : null);
      }

      // camera
      let camX = player.x - viewW / 2;
      let camY = player.y - viewH / 2 - 8;
      camX = Math.max(0, Math.min(world.pxW - viewW, camX));
      camY = Math.max(0, Math.min(world.pxH - viewH, camY));

      // particles
      spawnParticles(dt, camX, camY);
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life += dt;
        if (p.life > p.max) {
          particles.splice(i, 1);
          continue;
        }
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy -= 3 * dt;
      }
      for (const f of fireflies) {
        f.t += dt * f.sp;
        f.x += Math.cos(f.t * 1.7) * 8 * dt;
        f.y += Math.sin(f.t * 1.3) * 6 * dt;
        if (f.x < f.zx) f.x = f.zx + f.zw;
        if (f.x > f.zx + f.zw) f.x = f.zx;
        if (f.y < f.zy) f.y = f.zy + f.zh;
        if (f.y > f.zy + f.zh) f.y = f.zy;
      }

      // ── render ──
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.imageSmoothingEnabled = false;
      ctx.fillStyle = "#060910";
      ctx.fillRect(0, 0, cvs.width, cvs.height);
      ctx.setTransform(scale, 0, 0, scale, -camX * scale, -camY * scale);

      // ground
      ctx.drawImage(ground, 0, 0);

      // animated water
      const wFrame = Math.floor(time * 2.4) % 3;
      const wImg = S.tiles.water[wFrame];
      for (const w of world.waterList) {
        const wx = w.x * TILE;
        const wy = w.y * TILE;
        if (wx < camX - TILE || wx > camX + viewW || wy < camY - TILE || wy > camY + viewH) continue;
        ctx.drawImage(S.tiles.water[(wFrame + w.v) % 3] || wImg, wx, wy);
      }

      // y-sorted drawables
      const drawables = [];
      for (const d of world.decors) {
        if (
          d.x > camX + viewW || d.x + d.img.width < camX ||
          d.y > camY + viewH + 24 || d.y + d.img.height < camY
        ) continue;
        drawables.push(d);
      }
      // NPCs
      for (const e of world.entities) {
        if (!e.npc) continue;
        const frames = e.npc === "guide" ? S.guide : S.wizard;
        const img = frames[Math.floor(time * 1.6) % 2];
        drawables.push({
          img,
          x: e.x - img.width / 2,
          y: e.y - img.height + 3,
          ySort: e.y + 0.1,
        });
      }
      // player
      const heroFrames = S.hero[player.dir];
      const heroImg = player.moving
        ? heroFrames[[1, 0, 2, 0][player.frame]]
        : heroFrames[0];
      drawables.push({
        img: heroImg,
        x: player.x - heroImg.width / 2,
        y: player.y - heroImg.height + 3,
        ySort: player.y + 0.2,
      });
      drawables.sort((a, b) => a.ySort - b.ySort);
      for (const d of drawables) {
        let dy = 0;
        let img = d.img;
        if (d.anim) {
          if (d.anim.type === "bob") dy = Math.sin(now * d.anim.speed) * d.anim.amp;
          else if (d.anim.type === "frames")
            img = d.anim.frames[Math.floor(now / d.anim.speed) % d.anim.frames.length];
        }
        ctx.drawImage(img, Math.round(d.x), Math.round(d.y + dy));
      }

      // portal inner glow (behind particles)
      const portalEnt = world.entities.find((e) => e.portalCenter);
      if (portalEnt) {
        const p = portalEnt.portalCenter;
        const g = ctx.createRadialGradient(p.x, p.y, 2, p.x, p.y, 17);
        const pulse = 0.55 + Math.sin(time * 2.2) * 0.15;
        g.addColorStop(0, `rgba(220,190,255,${pulse})`);
        g.addColorStop(0.6, `rgba(150,80,240,${pulse * 0.7})`);
        g.addColorStop(1, "rgba(120,60,200,0)");
        ctx.fillStyle = g;
        ctx.fillRect(p.x - 18, p.y - 20, 36, 40);
      }

      // particles
      for (const p of particles) {
        const a = 1 - p.life / p.max;
        ctx.fillStyle = `rgba(${p.color},${a.toFixed(2)})`;
        ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
      }
      // fireflies (drawn as glow dots)
      for (const f of fireflies) {
        if (f.x < camX || f.x > camX + viewW || f.y < camY || f.y > camY + viewH) continue;
        const bl = 0.4 + 0.6 * Math.abs(Math.sin(f.t * 2.4));
        ctx.fillStyle = `rgba(190,255,140,${(bl * 0.9).toFixed(2)})`;
        ctx.fillRect(Math.round(f.x), Math.round(f.y), 1, 1);
      }

      // interaction marker
      if (nearest) {
        const bob = Math.sin(time * 5) * 1.5;
        const mx2 = Math.round(nearest.x);
        const my2 = Math.round(nearest.y - 34 + bob);
        ctx.fillStyle = "#0e0e1a";
        ctx.fillRect(mx2 - 4, my2 - 5, 9, 11);
        ctx.fillStyle = "#ffd76a";
        ctx.fillRect(mx2 - 3, my2 - 4, 7, 9);
        ctx.fillStyle = "#0e0e1a";
        ctx.fillRect(mx2, my2 - 2, 1, 4);
        ctx.fillRect(mx2, my2 + 3, 1, 1);
      }

      // ── night lighting ──
      lightCtx.setTransform(1, 0, 0, 1, 0, 0);
      lightCtx.globalCompositeOperation = "source-over";
      lightCtx.fillStyle = NIGHT;
      lightCtx.fillRect(0, 0, lightCvs.width, lightCvs.height);
      lightCtx.globalCompositeOperation = "destination-out";
      const punch = (x, y, r, strength) => {
        const g = lightCtx.createRadialGradient(x - camX, y - camY, 0, x - camX, y - camY, r);
        g.addColorStop(0, `rgba(0,0,0,${strength})`);
        g.addColorStop(0.65, `rgba(0,0,0,${strength * 0.45})`);
        g.addColorStop(1, "rgba(0,0,0,0)");
        lightCtx.fillStyle = g;
        lightCtx.fillRect(x - camX - r, y - camY - r, r * 2, r * 2);
      };
      punch(player.x, player.y - 8, 88, 0.9);
      for (const L of world.lights) {
        if (L.x < camX - L.r || L.x > camX + viewW + L.r || L.y < camY - L.r || L.y > camY + viewH + L.r) continue;
        let r = L.r;
        if (L.flicker) r += Math.sin(time * 9 + L.x) * L.flicker * 6 + (Math.random() - 0.5) * L.flicker * 4;
        if (L.pulse) r += Math.sin(now * L.pulse) * 6;
        punch(L.x, L.y, r, 0.95);
      }
      for (const f of fireflies) {
        if (f.x < camX || f.x > camX + viewW || f.y < camY || f.y > camY + viewH) continue;
        punch(f.x, f.y, 7, 0.5 * Math.abs(Math.sin(f.t * 2.4)));
      }
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      ctx.drawImage(lightCvs, 0, 0);

      // warm color glow (additive)
      ctx.globalCompositeOperation = "lighter";
      for (const L of world.lights) {
        if (L.x < camX - L.r || L.x > camX + viewW + L.r || L.y < camY - L.r || L.y > camY + viewH + L.r) continue;
        const g = ctx.createRadialGradient(
          L.x - camX, L.y - camY, 0,
          L.x - camX, L.y - camY, L.r * 0.8
        );
        g.addColorStop(0, `rgba(${L.color},0.16)`);
        g.addColorStop(1, `rgba(${L.color},0)`);
        ctx.fillStyle = g;
        ctx.fillRect(L.x - camX - L.r, L.y - camY - L.r, L.r * 2, L.r * 2);
      }
      ctx.globalCompositeOperation = "source-over";

      // vignette (screen space)
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      const vg = ctx.createRadialGradient(
        cvs.width / 2, cvs.height / 2, Math.min(cvs.width, cvs.height) * 0.38,
        cvs.width / 2, cvs.height / 2, Math.max(cvs.width, cvs.height) * 0.72
      );
      vg.addColorStop(0, "rgba(4,6,16,0)");
      vg.addColorStop(1, "rgba(4,6,16,0.38)");
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, cvs.width, cvs.height);
    };
    raf = requestAnimationFrame(frame);

    // expose a hook for opening the chest
    uiRef.current.openChest = () => {
      const chest = world.entities.find((e) => e.id === "cv");
      if (chest && chest.chestDecor) chest.chestDecor.img = S.chestOpen;
    };

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        display: "block",
        imageRendering: "pixelated",
        background: "#060910",
      }}
    />
  );
}
