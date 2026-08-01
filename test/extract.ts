const SPEC_URL = "https://raw.githubusercontent.com/commonmark/commonmark-spec/refs/heads/master/spec.txt";
const BLOCK = /^`{10,} example\n([\s\S]*?)^\.\n([\s\S]*?)^`{10,}$|^#{1,6} +(.*?)\s*#*$/gm;

export function extract(spec: string) {
  const text = spec.replace(/\r\n?/g, "\n").replace(/^<!-- END TESTS -->[\s\S]*/m, "");
  const tests = [];
  let section = "";

  for (const [, markdown = "", html = "", heading] of text.matchAll(BLOCK)) {
    if (heading !== undefined) section = heading;
    else tests.push({
      example: tests.length + 1,
      section,
      markdown: markdown.replaceAll("\u2192", "\t"),
      html: html.replaceAll("\u2192", "\t"),
    });
  }
  return tests;
}

if (import.meta.main) {
  const txt = `${import.meta.dir}/../test/spec.txt`;
  if (process.argv.includes("--fetch")) await Bun.write(txt, await (await fetch(SPEC_URL)).text());
  const tests = extract(await Bun.file(txt).text());
  await Bun.write(`${import.meta.dir}/../test/spec.json`, JSON.stringify(tests, null, 2) + "\n");
  console.log(`${tests.length} exemples`);
}
