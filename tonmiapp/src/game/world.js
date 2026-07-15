// ─── World: tile map, collision, entities, light sources ─────────────────────
import { TILE, mulberry32 } from "./sprites";

export const MAP_W = 56;
export const MAP_H = 44;

// tile codes
const GRASS = 0;
const DARK = 1;
const DIRT = 2;
const WATER = 3;
const STONE = 4;

export function buildWorld(S) {
  const rnd = mulberry32(20260715);
  const tiles = new Uint8Array(MAP_W * MAP_H).fill(GRASS);
  const solid = new Uint8Array(MAP_W * MAP_H);
  const reserved = new Uint8Array(MAP_W * MAP_H); // keep clear of trees
  const idx = (x, y) => y * MAP_W + x;
  const inMap = (x, y) => x >= 0 && y >= 0 && x < MAP_W && y < MAP_H;

  const setTile = (x, y, t) => {
    if (inMap(x, y)) tiles[idx(x, y)] = t;
  };
  const reserve = (x, y, w = 1, h = 1, pad = 1) => {
    for (let yy = y - pad; yy < y + h + pad; yy++)
      for (let xx = x - pad; xx < x + w + pad; xx++)
        if (inMap(xx, yy)) reserved[idx(xx, yy)] = 1;
  };

  // ── base variation: patches of dark grass ──
  for (let i = 0; i < 40; i++) {
    const cx = Math.floor(rnd() * MAP_W);
    const cy = Math.floor(rnd() * MAP_H);
    const r = 2 + Math.floor(rnd() * 4);
    for (let y = cy - r; y <= cy + r; y++)
      for (let x = cx - r; x <= cx + r; x++)
        if (inMap(x, y) && (x - cx) ** 2 + (y - cy) ** 2 <= r * r && rnd() < 0.8)
          setTile(x, y, DARK);
  }

  // ── lake (north-west) ──
  const lake = { cx: 9, cy: 9, rx: 7, ry: 5.4 };
  for (let y = 0; y < MAP_H; y++)
    for (let x = 0; x < MAP_W; x++) {
      const dx = (x - lake.cx) / lake.rx;
      const dy = (y - lake.cy) / lake.ry;
      if (dx * dx + dy * dy <= 1) {
        setTile(x, y, WATER);
        solid[idx(x, y)] = 1;
        reserved[idx(x, y)] = 1;
      }
    }

  // ── paths ──
  const carve = (x0, y0, x1, y1) => {
    // L-shaped path, 2 tiles wide, with slight jitter
    let x = x0, y = y0;
    const put = (px, py) => {
      for (let dy = 0; dy < 2; dy++)
        for (let dx = 0; dx < 2; dx++)
          if (inMap(px + dx, py + dy) && tiles[idx(px + dx, py + dy)] !== WATER) {
            setTile(px + dx, py + dy, DIRT);
            reserve(px + dx, py + dy, 1, 1, 1);
          }
    };
    while (x !== x1) {
      put(x, y);
      x += x < x1 ? 1 : -1;
    }
    while (y !== y1) {
      put(x, y);
      y += y < y1 ? 1 : -1;
    }
    put(x1, y1);
  };

  // POI anchor tiles
  const SPAWN = { x: 27, y: 34 };
  const GATE = { x: 27, y: 13 };
  const CHEST = { x: 8, y: 27 };
  const CAMP = { x: 39, y: 32 };
  const TOWER_DOOR = { x: 45, y: 20 };
  const PORTAL = { x: 47, y: 6 };

  carve(SPAWN.x, SPAWN.y, GATE.x, GATE.y); // spawn → castle gate
  carve(SPAWN.x, SPAWN.y + 1, CHEST.x + 1, 33); // spawn → west forest
  carve(CHEST.x + 1, 33, CHEST.x + 1, CHEST.y + 2);
  carve(SPAWN.x + 1, SPAWN.y + 1, CAMP.x, CAMP.y + 2); // spawn → camp
  carve(CAMP.x + 1, CAMP.y, TOWER_DOOR.x, TOWER_DOOR.y + 2); // camp → tower
  carve(TOWER_DOOR.x, TOWER_DOOR.y + 2, PORTAL.x, PORTAL.y + 3); // tower → portal

  // ── castle plaza (stone floor in front of the keep) ──
  const CY = { x0: 19, y0: 8, x1: 36, y1: 13 };
  for (let y = CY.y0; y <= CY.y1; y++)
    for (let x = CY.x0; x <= CY.x1; x++) {
      setTile(x, y, STONE);
      reserve(x, y, 1, 1, 0);
    }
  // keep footprint + plaza margin stay clear of trees
  for (let y = 2; y <= 15; y++)
    for (let x = 17; x <= 38; x++) reserve(x, y, 1, 1, 0);

  const decors = []; // {img, x, y, ySort, anim?}
  const colliders = []; // px rects {x,y,w,h}
  const entities = []; // interactables + npcs
  const lights = []; // {x, y, r, color, flicker, pulse}
  const waterList = [];

  for (let y = 0; y < MAP_H; y++)
    for (let x = 0; x < MAP_W; x++)
      if (tiles[idx(x, y)] === WATER) waterList.push({ x, y, v: Math.floor(rnd() * 3) });

  const px = (t) => t * TILE;

  const addDecor = (img, tx, ty, opts = {}) => {
    // anchored: bottom-center of image sits at bottom-center of the tile
    const x = px(tx) + TILE / 2 - img.width / 2 + (opts.dx || 0);
    const y = px(ty) + TILE - img.height + (opts.dy || 0);
    decors.push({ img, x, y, ySort: opts.ySort ?? y + img.height, anim: opts.anim });
    if (opts.solid !== false) {
      const cw = opts.cw ?? Math.min(img.width - 4, TILE);
      const ch = opts.ch ?? 8;
      colliders.push({
        x: x + img.width / 2 - cw / 2,
        y: y + img.height - ch,
        w: cw,
        h: ch,
      });
    }
  };

  // ── castle keep (backdrop building, plaza in front) ──
  {
    const img = S.castle;
    const cx = px(CY.x0) - 8;
    const cy = px(2);
    decors.push({ img, x: cx, y: cy, ySort: cy + img.height - 4 });
    colliders.push({ x: cx, y: cy + 18, w: img.width, h: img.height - 22 });
    // window lights
    lights.push({ x: cx + 24, y: cy + 48, r: 34, color: "255,180,90", flicker: 0.15 });
    lights.push({ x: cx + img.width - 24, y: cy + 48, r: 34, color: "255,180,90", flicker: 0.15 });
    lights.push({ x: cx + img.width / 2, y: cy + 70, r: 46, color: "255,170,80", flicker: 0.2 });
  }

  // ── pedestals + crystals on the plaza ──
  const PED_Y = 11;
  const PED_X = [21, 25, 30, 34];
  PED_X.forEach((tx, i) => {
    addDecor(S.pedestal, tx, PED_Y, { cw: 14, ch: 8 });
    const cimg = S.crystals[i];
    const cx = px(tx) + TILE / 2;
    const cy = px(PED_Y) - 8;
    decors.push({
      img: cimg,
      x: cx - cimg.width / 2,
      y: cy,
      ySort: px(PED_Y) + TILE + 1,
      anim: { type: "bob", speed: 0.003 + i * 0.0004, amp: 2.5 },
    });
    const colors = ["100,220,255", "255,180,90", "120,255,150", "190,130,255"];
    lights.push({ x: cx, y: cy + 6, r: 44, color: colors[i], flicker: 0.12, pulse: 0.002 + i * 0.0005 });
    entities.push({
      id: ["proj-autovero", "proj-rave", "proj-saas", "proj-github"][i],
      x: cx,
      y: px(PED_Y) + TILE - 2,
      radius: 30,
      label: "Inspect",
    });
    reserve(tx, PED_Y);
  });

  // plaza torches
  for (const [tx, ty] of [[19, 10], [36, 10], [23, 13], [32, 13]]) {
    addDecor(S.torch[0], tx, ty, { solid: false, anim: { type: "frames", frames: S.torch, speed: 180 } });
    lights.push({ x: px(tx) + 8, y: px(ty) + 2, r: 52, color: "255,160,70", flicker: 0.3 });
    reserve(tx, ty);
  }

  // ── spawn area: campfire, sign, guide ──
  addDecor(S.campfire[0], 29, 33, { cw: 12, ch: 6, anim: { type: "frames", frames: S.campfire, speed: 140 } });
  lights.push({ x: px(29) + 8, y: px(33) + 8, r: 95, color: "255,150,60", flicker: 0.35 });
  reserve(29, 33);

  addDecor(S.sign, 25, 34, { cw: 12, ch: 6 });
  entities.push({ id: "sign", x: px(25) + 8, y: px(34) + 14, radius: 26, label: "Read" });
  reserve(25, 34);

  entities.push({
    id: "about",
    npc: "guide",
    x: px(30) + 8,
    y: px(35) + 15,
    radius: 30,
    label: "Talk",
  });
  colliders.push({ x: px(30) + 2, y: px(35) + 8, w: 12, h: 8 });
  reserve(30, 35);

  // ── west forest: CV chest ──
  addDecor(S.chestClosed, CHEST.x + 1, CHEST.y, { cw: 14, ch: 8, id: "chest" });
  const chestDecor = decors[decors.length - 1];
  entities.push({
    id: "cv",
    x: px(CHEST.x + 1) + 8,
    y: px(CHEST.y) + 14,
    radius: 28,
    label: "Open",
    chestDecor,
  });
  lights.push({ x: px(CHEST.x + 1) + 8, y: px(CHEST.y) + 6, r: 30, color: "255,200,110", flicker: 0.1, pulse: 0.0025 });
  reserve(CHEST.x + 1, CHEST.y);
  // torches flanking the chest clearing
  for (const [tx, ty] of [[CHEST.x - 1, CHEST.y], [CHEST.x + 3, CHEST.y]]) {
    addDecor(S.torch[0], tx, ty, { solid: false, anim: { type: "frames", frames: S.torch, speed: 200 } });
    lights.push({ x: px(tx) + 8, y: px(ty) + 2, r: 48, color: "255,160,70", flicker: 0.3 });
    reserve(tx, ty);
  }

  // ── camp: quest board ──
  addDecor(S.questBoard, CAMP.x, CAMP.y, { cw: 30, ch: 8 });
  entities.push({ id: "experience", x: px(CAMP.x) + 16, y: px(CAMP.y) + 16, radius: 34, label: "Read" });
  reserve(CAMP.x - 1, CAMP.y, 3, 1);
  for (const [tx, ty] of [[CAMP.x - 2, CAMP.y + 1], [CAMP.x + 3, CAMP.y + 1]]) {
    addDecor(S.torch[0], tx, ty, { solid: false, anim: { type: "frames", frames: S.torch, speed: 170 } });
    lights.push({ x: px(tx) + 8, y: px(ty) + 2, r: 48, color: "255,160,70", flicker: 0.3 });
    reserve(tx, ty);
  }

  // ── mage tower + wizard ──
  {
    const img = S.tower;
    const x = px(TOWER_DOOR.x) + 8 - img.width / 2;
    const y = px(TOWER_DOOR.y) + TILE - img.height;
    decors.push({ img, x, y, ySort: y + img.height - 2 });
    colliders.push({ x: x + 14, y: y + 44, w: img.width - 28, h: img.height - 48 });
    lights.push({ x: x + img.width / 2, y: y + 6, r: 60, color: "120,220,255", flicker: 0.1, pulse: 0.0018 });
    lights.push({ x: x + img.width / 2, y: y + 58, r: 30, color: "255,180,90", flicker: 0.15 });
    reserve(TOWER_DOOR.x - 2, TOWER_DOOR.y - 4, 5, 6);
  }
  entities.push({
    id: "skills",
    npc: "wizard",
    x: px(TOWER_DOOR.x) + 8,
    y: px(TOWER_DOOR.y + 2) + 15,
    radius: 30,
    label: "Talk",
  });
  colliders.push({ x: px(TOWER_DOOR.x) + 2, y: px(TOWER_DOOR.y + 2) + 8, w: 12, h: 8 });
  reserve(TOWER_DOOR.x, TOWER_DOOR.y + 2);

  // ── portal ──
  {
    const img = S.portalArch;
    const x = px(PORTAL.x) + 8 - img.width / 2;
    const y = px(PORTAL.y) + TILE - img.height;
    decors.push({ img, x, y, ySort: y + img.height - 2, portal: true });
    colliders.push({ x: x, y: y + 20, w: 14, h: img.height - 24 });
    colliders.push({ x: x + img.width - 14, y: y + 20, w: 14, h: img.height - 24 });
    lights.push({ x: x + img.width / 2, y: y + 36, r: 85, color: "176,107,255", flicker: 0.15, pulse: 0.0022 });
    entities.push({
      id: "contact",
      x: x + img.width / 2,
      y: y + img.height - 6,
      radius: 34,
      label: "Enter",
      portalCenter: { x: x + img.width / 2, y: y + 34 },
    });
    reserve(PORTAL.x - 2, PORTAL.y - 3, 5, 5);
  }

  // ── trees ──
  const treeAt = (tx, ty) => {
    if (!inMap(tx, ty) || reserved[idx(tx, ty)] || tiles[idx(tx, ty)] === WATER) return false;
    const r = rnd();
    const img = r < 0.6 ? S.pine[Math.floor(rnd() * 3)] : S.oak[Math.floor(rnd() * 2)];
    addDecor(img, tx, ty, { cw: 12, ch: 7 });
    reserved[idx(tx, ty)] = 1;
    return true;
  };
  // border ring
  for (let x = 0; x < MAP_W; x++) {
    treeAt(x, 0); treeAt(x, 1);
    if (rnd() < 0.7) treeAt(x, 2);
    treeAt(x, MAP_H - 2); treeAt(x, MAP_H - 1);
    if (rnd() < 0.7) treeAt(x, MAP_H - 3);
  }
  for (let y = 0; y < MAP_H; y++) {
    treeAt(0, y); treeAt(1, y);
    if (rnd() < 0.7) treeAt(2, y);
    treeAt(MAP_W - 2, y); treeAt(MAP_W - 1, y);
    if (rnd() < 0.7) treeAt(MAP_W - 3, y);
  }
  // west forest cluster
  for (let i = 0; i < 90; i++) {
    treeAt(3 + Math.floor(rnd() * 14), 15 + Math.floor(rnd() * 26));
  }
  // scattered woodland everywhere else
  for (let i = 0; i < 130; i++) {
    treeAt(Math.floor(rnd() * MAP_W), Math.floor(rnd() * MAP_H));
  }
  // rocks
  for (let i = 0; i < 26; i++) {
    const tx = Math.floor(rnd() * MAP_W);
    const ty = Math.floor(rnd() * MAP_H);
    if (!inMap(tx, ty) || reserved[idx(tx, ty)] || tiles[idx(tx, ty)] === WATER) continue;
    addDecor(S.rock[Math.floor(rnd() * 2)], tx, ty, { cw: 10, ch: 5 });
    reserved[idx(tx, ty)] = 1;
  }

  // fireflies zones (dark grass + forest)
  const fireflyZones = [
    { x: px(3), y: px(15), w: px(14), h: px(26) },
    { x: px(40), y: px(24), w: px(13), h: px(16) },
    { x: px(20), y: px(14), w: px(16), h: px(10) },
  ];

  decors.sort((a, b) => a.ySort - b.ySort);

  return {
    tiles,
    solid,
    decors,
    colliders,
    entities,
    lights,
    waterList,
    fireflyZones,
    spawn: { x: px(SPAWN.x) + 8, y: px(SPAWN.y) + 8 },
    pxW: MAP_W * TILE,
    pxH: MAP_H * TILE,
  };
}

// Pre-render the ground layer once
export function renderGround(S, world) {
  const c = document.createElement("canvas");
  c.width = world.pxW;
  c.height = world.pxH;
  const ctx = c.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  const { tiles } = world;
  const pick = (arr, x, y) => arr[(x * 7 + y * 13) % arr.length];
  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < MAP_W; x++) {
      const t = tiles[y * MAP_W + x];
      let img;
      if (t === GRASS) img = pick(S.tiles.grass, x, y);
      else if (t === DARK) img = pick(S.tiles.darkGrass, x, y);
      else if (t === DIRT) img = pick(S.tiles.dirt, x, y);
      else if (t === WATER) img = S.tiles.water[0];
      else img = pick(S.tiles.stone, x, y);
      ctx.drawImage(img, x * TILE, y * TILE);
    }
  }
  // shoreline: darken land pixels adjacent to water
  ctx.fillStyle = "rgba(10,18,30,0.55)";
  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < MAP_W; x++) {
      if (tiles[y * MAP_W + x] === WATER) continue;
      const nb = [
        [x, y - 1], [x, y + 1], [x - 1, y], [x + 1, y],
      ];
      for (const [nx, ny] of nb) {
        if (nx < 0 || ny < 0 || nx >= MAP_W || ny >= MAP_H) continue;
        if (tiles[ny * MAP_W + nx] === WATER) {
          if (ny > y) ctx.fillRect(x * TILE, y * TILE + TILE - 2, TILE, 2);
          else if (ny < y) ctx.fillRect(x * TILE, y * TILE, TILE, 2);
          else if (nx < x) ctx.fillRect(x * TILE, y * TILE, 2, TILE);
          else ctx.fillRect(x * TILE + TILE - 2, y * TILE, 2, TILE);
        }
      }
    }
  }
  return c;
}
