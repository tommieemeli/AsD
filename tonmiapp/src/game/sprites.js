// ─── Programmatic pixel art ───────────────────────────────────────────────────
// Every sprite is drawn in code: string-grid art for characters/props,
// seeded procedural generation for terrain and foliage. No image assets.

export const TILE = 16;

// Deterministic RNG so the world looks identical on every load
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function canvas(w, h) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  return [c, ctx];
}

// Render a string grid into a canvas. '.' and ' ' are transparent.
function art(rows, pal) {
  const h = rows.length;
  const w = rows[0].length;
  const [c, ctx] = canvas(w, h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const ch = rows[y][x];
      if (ch === "." || ch === " " || ch === undefined) continue;
      const col = pal[ch];
      if (!col) continue;
      ctx.fillStyle = col;
      ctx.fillRect(x, y, 1, 1);
    }
  }
  return c;
}

function flipH(src) {
  const [c, ctx] = canvas(src.width, src.height);
  ctx.translate(src.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(src, 0, 0);
  return c;
}

// ─── Terrain tiles (procedural) ───────────────────────────────────────────────

function grassTile(seed, base, specks) {
  const [c, ctx] = canvas(TILE, TILE);
  const rnd = mulberry32(seed);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, TILE, TILE);
  for (let i = 0; i < 26; i++) {
    ctx.fillStyle = specks[Math.floor(rnd() * specks.length)];
    ctx.fillRect(Math.floor(rnd() * TILE), Math.floor(rnd() * TILE), 1, 1);
  }
  // a few grass blades
  for (let i = 0; i < 4; i++) {
    const x = Math.floor(rnd() * (TILE - 1));
    const y = 2 + Math.floor(rnd() * (TILE - 4));
    ctx.fillStyle = specks[specks.length - 1];
    ctx.fillRect(x, y, 1, 2);
  }
  return c;
}

function dirtTile(seed) {
  const [c, ctx] = canvas(TILE, TILE);
  const rnd = mulberry32(seed);
  ctx.fillStyle = "#544636";
  ctx.fillRect(0, 0, TILE, TILE);
  const cols = ["#4a3d2e", "#5d4e3c", "#463a2b", "#645442"];
  for (let i = 0; i < 30; i++) {
    ctx.fillStyle = cols[Math.floor(rnd() * cols.length)];
    ctx.fillRect(Math.floor(rnd() * TILE), Math.floor(rnd() * TILE), 2, 1);
  }
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = "#6b5b46";
    ctx.fillRect(Math.floor(rnd() * 14), Math.floor(rnd() * 14), 2, 2);
  }
  return c;
}

function waterTile(seed, frame) {
  const [c, ctx] = canvas(TILE, TILE);
  const rnd = mulberry32(seed + frame * 977);
  ctx.fillStyle = "#102540";
  ctx.fillRect(0, 0, TILE, TILE);
  ctx.fillStyle = "#0c1e35";
  for (let i = 0; i < 10; i++) {
    ctx.fillRect(Math.floor(rnd() * TILE), Math.floor(rnd() * TILE), 3, 1);
  }
  ctx.fillStyle = "#274d74";
  for (let i = 0; i < 5; i++) {
    ctx.fillRect(Math.floor(rnd() * 13), Math.floor(rnd() * TILE), 3, 1);
  }
  ctx.fillStyle = "#3f6f9e";
  for (let i = 0; i < 2; i++) {
    ctx.fillRect(Math.floor(rnd() * 14), Math.floor(rnd() * TILE), 2, 1);
  }
  return c;
}

function stoneFloorTile(seed) {
  const [c, ctx] = canvas(TILE, TILE);
  const rnd = mulberry32(seed);
  ctx.fillStyle = "#3d4254";
  ctx.fillRect(0, 0, TILE, TILE);
  // flagstone joints
  ctx.fillStyle = "#333849";
  ctx.fillRect(0, 7, TILE, 1);
  ctx.fillRect(0, 15, TILE, 1);
  ctx.fillRect(rnd() > 0.5 ? 4 : 9, 0, 1, 7);
  ctx.fillRect(rnd() > 0.5 ? 11 : 6, 8, 1, 7);
  ctx.fillStyle = "#474d62";
  for (let i = 0; i < 6; i++) {
    ctx.fillRect(Math.floor(rnd() * TILE), Math.floor(rnd() * TILE), 2, 1);
  }
  return c;
}

// ─── Foliage (procedural) ─────────────────────────────────────────────────────

function pineTree(seed) {
  const w = 24, h = 34;
  const [c, ctx] = canvas(w, h);
  const rnd = mulberry32(seed);
  const dark = "#16301f";
  const mid = "#1e4029";
  const lit = "#2c5c3a";
  // trunk
  ctx.fillStyle = "#3a2c1e";
  ctx.fillRect(10, 28, 4, 6);
  ctx.fillStyle = "#2c2116";
  ctx.fillRect(12, 28, 2, 6);
  // stacked triangle layers, moonlight from top-left
  const layers = [
    [11, 2, 2],
    [9, 5, 4],
    [7, 9, 6],
    [5, 14, 8],
    [3, 19, 10],
    [1, 24, 12],
  ];
  for (const [x0, y0, half] of layers) {
    for (let y = 0; y < 6; y++) {
      const spread = Math.floor((half * y) / 5);
      const xs = 12 - 1 - spread + (x0 > 6 ? 0 : 0);
      const xe = 12 + spread;
      for (let x = xs; x <= xe; x++) {
        if (x < 0 || x >= w) continue;
        let col = mid;
        if (x > 12 + spread - 2) col = dark;
        else if (x < xs + 2 && y < 4) col = lit;
        if (rnd() < 0.08) col = dark;
        ctx.fillStyle = col;
        ctx.fillRect(x, y0 + y, 1, 1);
      }
    }
  }
  return c;
}

function oakTree(seed) {
  const w = 36, h = 40;
  const [c, ctx] = canvas(w, h);
  const rnd = mulberry32(seed);
  // trunk
  ctx.fillStyle = "#41301f";
  ctx.fillRect(15, 28, 6, 12);
  ctx.fillStyle = "#2e2216";
  ctx.fillRect(18, 28, 3, 12);
  ctx.fillRect(13, 36, 2, 4);
  ctx.fillRect(21, 36, 2, 4);
  // canopy: layered blobs
  const blob = (cx, cy, r, col) => {
    ctx.fillStyle = col;
    for (let y = -r; y <= r; y++) {
      for (let x = -r; x <= r; x++) {
        if (x * x + y * y <= r * r + (rnd() < 0.4 ? 1 : -1)) {
          ctx.fillRect(cx + x, cy + y, 1, 1);
        }
      }
    }
  };
  blob(18, 15, 13, "#17331f");
  blob(12, 12, 9, "#204628");
  blob(24, 13, 9, "#1c3d24");
  blob(15, 9, 7, "#2a5533");
  blob(10, 8, 4, "#356841");
  // sparkle pixels
  for (let i = 0; i < 14; i++) {
    ctx.fillStyle = rnd() < 0.5 ? "#356841" : "#12281a";
    ctx.fillRect(5 + Math.floor(rnd() * 26), 3 + Math.floor(rnd() * 20), 1, 1);
  }
  return c;
}

function rock(seed) {
  const [c, ctx] = canvas(14, 10);
  const rnd = mulberry32(seed);
  ctx.fillStyle = "#4b5164";
  ctx.beginPath();
  ctx.fillRect(2, 3, 10, 6);
  ctx.fillRect(4, 1, 6, 2);
  ctx.fillRect(1, 5, 12, 3);
  ctx.fillStyle = "#5d647c";
  ctx.fillRect(4, 2, 4, 2);
  ctx.fillRect(2, 4, 3, 2);
  ctx.fillStyle = "#353a4a";
  ctx.fillRect(8, 6, 4, 3);
  ctx.fillRect(3, 8, 9, 1);
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = "#2c3140";
    ctx.fillRect(2 + Math.floor(rnd() * 10), 3 + Math.floor(rnd() * 5), 1, 1);
  }
  return c;
}

// ─── Characters (string art) ──────────────────────────────────────────────────

const HERO_PAL = {
  H: "#5d3f28", // hair dark
  h: "#7a5636", // hair light
  S: "#e6b78c", // skin
  s: "#c99a6e", // skin shade
  E: "#26263a", // eyes
  T: "#2f7a72", // tunic teal
  t: "#22615a", // tunic shade
  G: "#d9a441", // gold belt
  L: "#39394d", // pants
  B: "#23232f", // boots
  W: "#b9c3d6", // sword blade
  w: "#8b95ab", // sword shade
  P: "#6e4f30", // sword grip
};

const heroDown0 = [
  "................",
  ".....HHHHHH.....",
  "....HhhhhhhH....",
  "....Hhhhhhhh....",
  "....SSSSSSSS....",
  "....SEsSSsES....",
  "....SSSSSSSS....",
  ".....ssssss.....",
  "....TTTTTTTT....",
  "...TTTTTTTTTT...",
  "...tTTTTTTTTt...",
  "...sTGGGGGGTs...",
  "....LLLLLLLL....",
  "....LLL..LLL....",
  "....LLL..LLL....",
  "....BBB..BBB....",
  "...BBBB..BBBB...",
  "................",
];
const heroDown1 = [
  "................",
  ".....HHHHHH.....",
  "....HhhhhhhH....",
  "....Hhhhhhhh....",
  "....SSSSSSSS....",
  "....SEsSSsES....",
  "....SSSSSSSS....",
  ".....ssssss.....",
  "....TTTTTTTT....",
  "...TTTTTTTTTT...",
  "...tTTTTTTTTt...",
  "...sTGGGGGGTs...",
  "....LLLLLLLL....",
  "....LLL..LLL....",
  "...LLL....LLL...",
  "...BBB....BBB...",
  "..BBBB....BBBB..",
  "................",
];
const heroDown2 = [
  "................",
  ".....HHHHHH.....",
  "....HhhhhhhH....",
  "....Hhhhhhhh....",
  "....SSSSSSSS....",
  "....SEsSSsES....",
  "....SSSSSSSS....",
  ".....ssssss.....",
  "....TTTTTTTT....",
  "...TTTTTTTTTT...",
  "...tTTTTTTTTt...",
  "...sTGGGGGGTs...",
  "....LLLLLLLL....",
  "....LLLLLLL.....",
  "....LLL..LLL....",
  "....BBB...BBB...",
  "....BBBB..BBB...",
  "................",
];
const heroUp0 = [
  "................",
  ".....HHHHHH.....",
  "....HHHHHHHH....",
  "....HhhhhhhH....",
  "....hhhhhhhh....",
  "....hhhhhhhh....",
  "....Hhhhhhhh....",
  ".....HHHHHH.....",
  "....TTwWWTTT....",
  "...TTTwWWTTTT...",
  "...tTTwWWTTTt...",
  "...sTTwPPTTTs...",
  "....LLLLLLLL....",
  "....LLL..LLL....",
  "....LLL..LLL....",
  "....BBB..BBB....",
  "...BBBB..BBBB...",
  "................",
];
const heroUp1 = heroUp0.map((r, i) =>
  i >= 13 ? ["....LLL..LLL....", "...LLL....LLL...", "...BBB....BBB...", "..BBBB....BBBB..", "................"][i - 13] : r
);
const heroSide0 = [
  "................",
  ".....HHHHHH.....",
  "....HHhhhhhH....",
  "....HHhhhhhh....",
  ".....SSSSSS.....",
  ".....SsSSES.....",
  ".....SSSSSS.....",
  "......ssss......",
  ".....TTTTTT.....",
  "....TTTTTTTT....",
  "....tTTTTTTt....",
  "....sGGGGGGs....",
  ".....LLLLLL.....",
  ".....LLLLL......",
  ".....LL.LL......",
  ".....BB.BB......",
  "....BBB.BBB.....",
  "................",
];
const heroSide1 = [
  "................",
  ".....HHHHHH.....",
  "....HHhhhhhH....",
  "....HHhhhhhh....",
  ".....SSSSSS.....",
  ".....SsSSES.....",
  ".....SSSSSS.....",
  "......ssss......",
  ".....TTTTTT.....",
  "....TTTTTTTT....",
  "....tTTTTTTt....",
  "....sGGGGGGs....",
  ".....LLLLLL.....",
  "....LLL.LLL.....",
  "....LL...LL.....",
  "....BB...BB.....",
  "...BBB...BBB....",
  "................",
];

const GUIDE_PAL = {
  O: "#3f6d46", // hood
  o: "#2e5236", // hood shade
  S: "#e0b088",
  s: "#bf9268",
  E: "#26263a",
  C: "#33583b", // cloak
  c: "#264430", // cloak shade
  B: "#2a2a36",
  G: "#c8973f", // clasp
};
const guide0 = [
  "................",
  ".....OOOOOO.....",
  "....OOOOOOOO....",
  "...OOOoooOOOo...",
  "...OOoSSSSoOo...",
  "...OoSESSEsOo...",
  "...OoSSSSSsOo...",
  "....o.ssss.o....",
  "....CCCCCCCC....",
  "...CCCCGCCCCC...",
  "...cCCCCCCCCc...",
  "...cCCCCCCCCc...",
  "...cCCCCCCCCc...",
  "....CCCCCCCC....",
  "....CCC..CCC....",
  "....BBB..BBB....",
  "...BBBB..BBBB...",
  "................",
];
const guide1 = guide0.map((r, i) => (i === 1 ? "................" : i === 2 ? ".....OOOOOO....." : r));

const WIZARD_PAL = {
  R: "#6b4a9e", // robe
  r: "#54397e", // robe shade
  D: "#8a63c4", // robe light
  S: "#e6c5a5",
  E: "#26263a",
  W: "#e8e8f0", // beard
  w: "#c4c4d4",
  P: "#5b442c", // staff
  C: "#7ee0ff", // crystal
  c: "#b7f0ff",
};
const wizard0 = [
  "......RRRR......",
  ".....RRRRRR.....",
  "....RRDDDDRR....",
  "...RRRRRRRRRR...",
  "..DDDDDDDDDDDD..",
  "....SSSSSSSS..P.",
  "....SESSSSES..P.",
  "...WWSSSSSSWWcCc",
  "...WWWWWWWWWW.C.",
  "....WWWWWWWW..P.",
  "....RRRWWWRR..P.",
  "...RRRRWWRRRR.P.",
  "...rRRRRRRRRr.P.",
  "...rRRRRRRRRr.P.",
  "...rRRRRRRRRr.P.",
  "...RRRRRRRRRR.P.",
  "..RRRRRRRRRRR.P.",
  "................",
];
const wizard1 = wizard0.map((r, i) =>
  i === 7 ? "...WWSSSSSSWW.C." : i === 8 ? "...WWWWWWWWWWcCc" : r
);

// ─── Props (string art) ───────────────────────────────────────────────────────

const SIGN_PAL = { W: "#7a5c38", w: "#63482b", d: "#4a3620", P: "#54402a" };
const sign = [
  "................",
  ".WWWWWWWWWWWWW..",
  ".WwwwwwwwwwwwW..",
  ".Wwddddddddwww..",
  ".Wwwwwwwwwwwww..",
  ".Wwddddddwwwww..",
  ".WwwwwwwwwwwwW..",
  ".WWWWWWWWWWWWW..",
  "......PPP.......",
  "......PPP.......",
  "......PPP.......",
  "......PPP.......",
  ".....PPPPP......",
  "................",
];

const CHEST_PAL = {
  W: "#7a4e2a", w: "#5e3a1e", d: "#462b15",
  G: "#e8b94a", g: "#b8892e", L: "#f5e29a",
};
const chestClosed = [
  "................",
  "...WWWWWWWWWW...",
  "..WwwwwwwwwwwW..",
  "..WwwwwwwwwwwW..",
  "..GGGGGGGGGGGG..",
  "..WddddddddddW..",
  "..WddddGGddddW..",
  "..WddddGLddddW..",
  "..WddddGGddddW..",
  "..WddddddddddW..",
  "..GGGGGGGGGGGG..",
  "................",
];
const chestOpen = [
  "...WWWWWWWWWW...",
  "..WddddddddddW..",
  "..WdLLLLLLLLdW..",
  "..GGGGGGGGGGGG..",
  "..WLLLLLLLLLLW..",
  "..WwwwwwwwwwwW..",
  "..WwwwwGGwwwwW..",
  "..WwwwwGGwwwwW..",
  "..WwwwwwwwwwwW..",
  "..WwwwwwwwwwwW..",
  "..GGGGGGGGGGGG..",
  "................",
];

const FIRE_PAL = {
  Y: "#ffe37a", O: "#ff9d3c", R: "#e2571e", r: "#a83a16",
  W: "#6e4f30", w: "#54381f",
};
const campfire0 = [
  "................",
  "......YY........",
  ".....YYOO.......",
  "....YYOOOO......",
  "....YOOORR......",
  "...YYOORRRR.....",
  "...YOORRRRr.....",
  "...OORRRrrr.....",
  "....ORRrrr......",
  "..W..RRr...W....",
  "..wWWwwwWWWw....",
  ".WWwwWWWWwwWW...",
  "..w...ww...w....",
  "................",
];
const campfire1 = [
  "................",
  ".......YY.......",
  "......OOYY......",
  ".....OOOOYY.....",
  ".....RROOOO.....",
  "....RRRROOYY....",
  "....rRRRROO.....",
  "....rrrRRRO.....",
  ".....rrrRR......",
  "..W...rRr..W....",
  "..wWWwwwWWWw....",
  ".WWwwWWWWwwWW...",
  "..w...ww...w....",
  "................",
];

const TORCH_PAL = { Y: "#ffe37a", O: "#ff9d3c", R: "#d2521e", P: "#5b442c", p: "#41301f", M: "#6a6f84" };
const torch0 = [
  "...YY...",
  "..YOOY..",
  "..OORO..",
  "...RR...",
  "..MMMM..",
  "...PP...",
  "...Pp...",
  "...PP...",
  "...Pp...",
  "...PP...",
  "...Pp...",
  "...PP...",
  "..pPPp..",
];
const torch1 = [
  "...YY...",
  "..YYOO..",
  "..ORRO..",
  "...RR...",
  "..MMMM..",
  "...PP...",
  "...Pp...",
  "...PP...",
  "...Pp...",
  "...PP...",
  "...Pp...",
  "...PP...",
  "..pPPp..",
];

// Pedestal for project crystals
const PED_PAL = { S: "#565d74", s: "#434a5e", d: "#343a4a", h: "#6b7390" };
const pedestal = [
  "....SSSSSSSS....",
  "....ShhhhhhS....",
  "....SSSSSSSS....",
  ".....sssss......",
  ".....sdddss.....",
  ".....sdddss.....",
  ".....sdddss.....",
  ".....sdddss.....",
  "....SSSSSSSS....",
  "...SShhhhhSSS...",
  "...SSSSSSSSSS...",
];

// Crystal, tinted per project
function crystal(colA, colB, colC) {
  return art(
    [
      "...AA...",
      "..ABBA..",
      ".ABBCBA.",
      ".ABCCBA.",
      ".ABBCBA.",
      "..ABBA..",
      "...AA...",
      "....A...",
    ],
    { A: colA, B: colB, C: colC }
  );
}

// Quest board
const BOARD_PAL = {
  W: "#6e5231", w: "#54401f", d: "#41301a",
  P: "#e8ddc0", p: "#c9bd9c", i: "#8a7f66",
};
const questBoard = [
  "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW..",
  "WwwwwwwwwwwwwwwwwwwwwwwwwwwwwW..",
  "Ww.PPPPPP..PPPPPPP..PPPPPP.wwW..",
  "Ww.PiiiiP..PiiiiiP..PiiiiP.wwW..",
  "Ww.PiiiiP..PiiiiiP..PiiiiP.wwW..",
  "Ww.PPPPPP..PiiiiiP..PiiiiP.wwW..",
  "Ww.........PPPPPPP..PPPPPP.wwW..",
  "Ww.PPPPPPPPPP..............wwW..",
  "Ww.PiiiiiiiiP..PPPPPPPPPP..wwW..",
  "Ww.PiiiiiiiiP..PiiiiiiiiP..wwW..",
  "Ww.PPPPPPPPPP..PPPPPPPPPP..wwW..",
  "WwwwwwwwwwwwwwwwwwwwwwwwwwwwwW..",
  "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW..",
  "...dWWd..............dWWd.......",
  "...dWWd..............dWWd.......",
  "...dWWd..............dWWd.......",
  "...dWWd..............dWWd.......",
  "..ddWWdd............ddWWdd......",
];

// ─── Structures (procedural) ──────────────────────────────────────────────────

function brickFill(ctx, x, y, w, h, base, mortar, lit, seed) {
  const rnd = mulberry32(seed);
  ctx.fillStyle = base;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = mortar;
  for (let by = y; by < y + h; by += 5) {
    ctx.fillRect(x, by, w, 1);
    const off = ((by - y) / 5) % 2 === 0 ? 0 : 6;
    for (let bx = x + off; bx < x + w; bx += 12) {
      ctx.fillRect(bx, by, 1, 5);
    }
  }
  ctx.fillStyle = lit;
  for (let i = 0; i < (w * h) / 30; i++) {
    ctx.fillRect(
      x + Math.floor(rnd() * (w - 2)),
      y + 1 + Math.floor(rnd() * (h - 2)),
      2,
      1
    );
  }
}

function crenellation(ctx, x, y, w, col, dark) {
  ctx.fillStyle = col;
  ctx.fillRect(x, y + 3, w, 3);
  for (let bx = x; bx < x + w; bx += 8) {
    ctx.fillRect(bx, y, 5, 4);
  }
  ctx.fillStyle = dark;
  ctx.fillRect(x, y + 5, w, 1);
}

function windowGlow(ctx, x, y, w, h) {
  ctx.fillStyle = "#1c1c28";
  ctx.fillRect(x - 1, y - 1, w + 2, h + 2);
  ctx.fillStyle = "#ffbe5c";
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = "#ffdf9e";
  ctx.fillRect(x, y, w, 1);
}

// The Hall of Projects — a ruined keep facade with a gate
export function buildCastle() {
  const w = 19 * TILE; // 304
  const h = 7 * TILE; // 112
  const [c, ctx] = canvas(w, h);
  const stone = "#454b60";
  const mortar = "#363b4c";
  const lit = "#565d74";
  const dark = "#2b3040";

  // main wall
  brickFill(ctx, 24, 22, w - 48, 60, stone, mortar, lit, 42);
  crenellation(ctx, 24, 14, w - 48, stone, dark);

  // corner towers
  for (const tx of [0, w - 48]) {
    brickFill(ctx, tx, 30, 48, 74, stone, mortar, lit, tx + 7);
    crenellation(ctx, tx - 0, 6, 48, lit, dark);
    brickFill(ctx, tx + 4, 14, 40, 18, lit, mortar, "#646b84", tx + 13);
    windowGlow(ctx, tx + 20, 44, 6, 9);
    windowGlow(ctx, tx + 20, 70, 6, 9);
  }

  // gate arch
  const gx = Math.floor(w / 2) - 20;
  ctx.fillStyle = dark;
  ctx.fillRect(gx - 6, 40, 52, 42);
  ctx.fillStyle = "#14141e";
  ctx.fillRect(gx, 48, 40, 34);
  ctx.fillStyle = "#0c0c14";
  ctx.fillRect(gx + 4, 54, 32, 28);
  // arch top
  ctx.fillStyle = lit;
  ctx.fillRect(gx - 2, 44, 44, 4);
  ctx.fillRect(gx + 2, 40, 36, 4);
  // wall windows
  windowGlow(ctx, gx - 46, 46, 6, 9);
  windowGlow(ctx, gx + 80, 46, 6, 9);
  return c;
}

// Side wall segment for the keep courtyard (vertical run)
export function buildSideWall(tiles) {
  const w = TILE + 8;
  const h = tiles * TILE;
  const [c, ctx] = canvas(w, h);
  brickFill(ctx, 0, 6, w, h - 6, "#454b60", "#363b4c", "#565d74", tiles * 31);
  crenellation(ctx, 0, 0, w, "#565d74", "#2b3040");
  return c;
}

// The Mage Tower — tall round tower with a glowing crown
export function buildTower() {
  const w = 72, h = 128;
  const [c, ctx] = canvas(w, h);
  // body
  brickFill(ctx, 18, 40, 36, 84, "#474459", "#37344a", "#5b5772", 99);
  // rounded shading on body edges
  ctx.fillStyle = "rgba(8,8,18,0.4)";
  ctx.fillRect(18, 40, 4, 84);
  ctx.fillRect(50, 40, 4, 84);
  ctx.fillStyle = "rgba(255,255,255,0.05)";
  ctx.fillRect(26, 40, 6, 84);
  // upper ring (slightly wider ledge)
  brickFill(ctx, 14, 30, 44, 12, "#5b5772", "#37344a", "#6d6886", 55);
  ctx.fillStyle = "#2b2838";
  ctx.fillRect(14, 40, 44, 2);
  // roof cone with vertical shading bands
  for (let y = 0; y < 25; y++) {
    const half = 3 + Math.floor((y / 24) * 21);
    const x0 = 36 - half;
    const x1 = 36 + half;
    for (let x = x0; x < x1; x++) {
      const t = (x - x0) / (x1 - x0);
      ctx.fillStyle = t < 0.3 ? "#5a3f8e" : t < 0.72 ? "#4a3376" : "#37265c";
      ctx.fillRect(x, 6 + y, 1, 1);
    }
  }
  // roof rim
  ctx.fillStyle = "#31215222";
  ctx.fillStyle = "#312152";
  ctx.fillRect(11, 29, 50, 2);
  // crown crystal
  ctx.fillStyle = "#7ee0ff";
  ctx.fillRect(34, 0, 4, 7);
  ctx.fillStyle = "#d6f6ff";
  ctx.fillRect(35, 1, 2, 3);
  // windows
  windowGlow(ctx, 33, 54, 6, 11);
  windowGlow(ctx, 25, 84, 5, 9);
  windowGlow(ctx, 42, 84, 5, 9);
  // door
  ctx.fillStyle = "#1c1c28";
  ctx.fillRect(29, 102, 14, 22);
  ctx.fillStyle = "#0e0e16";
  ctx.fillRect(31, 106, 10, 18);
  ctx.fillStyle = "#6d6886";
  ctx.fillRect(28, 100, 16, 3);
  return c;
}

// Portal arch — contact gateway
export function buildPortalArch() {
  const w = 56, h = 64;
  const [c, ctx] = canvas(w, h);
  const stone = "#4e4663";
  const dark = "#37324a";
  const lit = "#645b7e";
  // pillars
  brickFill(ctx, 0, 16, 14, 48, stone, dark, lit, 3);
  brickFill(ctx, 42, 16, 14, 48, stone, dark, lit, 9);
  ctx.fillStyle = lit;
  ctx.fillRect(0, 12, 14, 4);
  ctx.fillRect(42, 12, 14, 4);
  // arch
  ctx.fillStyle = stone;
  ctx.fillRect(4, 4, 48, 10);
  ctx.fillStyle = lit;
  ctx.fillRect(4, 4, 48, 2);
  ctx.fillStyle = dark;
  ctx.fillRect(4, 12, 48, 2);
  // runes
  ctx.fillStyle = "#b06bff";
  ctx.fillRect(5, 24, 3, 3);
  ctx.fillRect(6, 36, 3, 3);
  ctx.fillRect(48, 28, 3, 3);
  ctx.fillRect(47, 42, 3, 3);
  ctx.fillRect(16, 7, 3, 3);
  ctx.fillRect(37, 7, 3, 3);
  return c;
}

// ─── Assembled export ─────────────────────────────────────────────────────────

let spriteCache = null;
export function getSprites() {
  if (!spriteCache) spriteCache = makeSprites();
  return spriteCache;
}

export function makeSprites() {
  const grass = [];
  for (let i = 0; i < 4; i++) {
    grass.push(grassTile(100 + i, "#26382c", ["#213127", "#2b4033", "#1e2d24", "#33513c"]));
  }
  const darkGrass = [];
  for (let i = 0; i < 3; i++) {
    darkGrass.push(grassTile(200 + i, "#1c2b21", ["#17241b", "#213227", "#101c14", "#28402f"]));
  }
  const dirt = [];
  for (let i = 0; i < 3; i++) dirt.push(dirtTile(300 + i));
  const stone = [];
  for (let i = 0; i < 3; i++) stone.push(stoneFloorTile(400 + i));
  const water = [waterTile(500, 0), waterTile(500, 1), waterTile(500, 2)];

  const heroSideL0 = flipH(art(heroSide0, HERO_PAL));
  const heroSideL1 = flipH(art(heroSide1, HERO_PAL));

  return {
    tiles: { grass, darkGrass, dirt, stone, water },
    hero: {
      down: [art(heroDown0, HERO_PAL), art(heroDown1, HERO_PAL), art(heroDown2, HERO_PAL)],
      up: [art(heroUp0, HERO_PAL), art(heroUp1, HERO_PAL), art(heroUp0, HERO_PAL)],
      right: [art(heroSide0, HERO_PAL), art(heroSide1, HERO_PAL), art(heroSide0, HERO_PAL)],
      left: [heroSideL0, heroSideL1, heroSideL0],
    },
    guide: [art(guide0, GUIDE_PAL), art(guide1, GUIDE_PAL)],
    wizard: [art(wizard0, WIZARD_PAL), art(wizard1, WIZARD_PAL)],
    sign: art(sign, SIGN_PAL),
    chestClosed: art(chestClosed, CHEST_PAL),
    chestOpen: art(chestOpen, CHEST_PAL),
    campfire: [art(campfire0, FIRE_PAL), art(campfire1, FIRE_PAL)],
    torch: [art(torch0, TORCH_PAL), art(torch1, TORCH_PAL)],
    pedestal: art(pedestal, PED_PAL),
    crystals: [
      crystal("#1e7c8c", "#3ec8dc", "#b8f4ff"), // cyan
      crystal("#9c5a1e", "#ffae4a", "#ffe4b0"), // amber
      crystal("#2e7c3a", "#5ad46e", "#c8ffd4"), // green
      crystal("#6a3aa0", "#a86ee8", "#e4ccff"), // purple
    ],
    questBoard: art(questBoard, BOARD_PAL),
    pine: [pineTree(11), pineTree(23), pineTree(37)],
    oak: [oakTree(51), oakTree(67)],
    rock: [rock(71), rock(83)],
    castle: buildCastle(),
    sideWall: buildSideWall(5),
    tower: buildTower(),
    portalArch: buildPortalArch(),
  };
}
