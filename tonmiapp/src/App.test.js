import { PROJECTS, SKILLS, JOBS, LINKS } from "./game/content";

// The game itself needs a real <canvas>, which jsdom doesn't provide,
// so tests cover the portfolio content instead of rendering the app.
test("portfolio content is present", () => {
  expect(PROJECTS.length).toBeGreaterThanOrEqual(4);
  expect(SKILLS.length).toBeGreaterThan(0);
  expect(JOBS.map((j) => j.company)).toEqual(
    expect.arrayContaining(["Reaktor", "Evitec Oy"])
  );
  expect(LINKS.cv).toMatch(/\.pdf$/);
});
