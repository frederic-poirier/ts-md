// bun run spec
// bun run spec Lists
// bun run Lists -v

import { render } from "../src/index.ts";

export type SpecTest = {
  example: number;
  section: string;
  startLine: number;
  markdown: string;
  html: string;
}

const tests: SpecTest[] = await Bun.file(new URL("../test/spec.json", import.meta.url).pathname).json();
const filter = process.argv[2]?.toLowerCase();
const verbose = process.argv.includes("-v");
const scores = new Map<string, { ok: number; total: number; }>();

for (const test of tests) {
  if (filter && !test.section.toLowerCase().includes(filter)) continue

  let obtain: string;
  try {
    obtain = render(test.markdown)
  } catch (error) {
    obtain = `ERROR: ${error}`;
  }

  const score = scores.get(test.section) ?? { ok: 0, total: 0 };
  score.total++

  if (obtain === test.html) score.ok++
  scores.set(test.section, score)

  if (verbose && obtain !== test.html) {
    console.log(`\nExample ${test.example} (spec.txt:${test.startLine})`);
    console.log("  input  ", JSON.stringify(test.markdown))
    console.log("  wanted ", JSON.stringify(test.html))
    console.log("  obtain ", JSON.stringify(obtain))
  }
}

console.log();
for (const [section, { ok, total }] of scores) {
  console.log(`  ${ok === total ? "✓" : " "} ${section.padEnd(36)} ${ok}/${total}`);
}
