import assert from "node:assert/strict";
import test from "node:test";
import { Marked } from "marked";
import { cleanHtml, renderMarkdown, safeUrl } from "../src/lib/markdown";

test("plain markdown renders exactly as marked's defaults", () => {
  const source = "# Title\n\nSome *text* with [a link](https://example.com \"t\") and ![alt](/media/a.jpg).\n\n- one\n- two\n\n| a | b |\n|---|---|\n| 1 | 2 |\n\n```js\nconst x = 1 < 2;\n```\n\n<https://autolink.example>";
  assert.equal(renderMarkdown(source), new Marked().parse(source));
});

test("dangerous links and images lose their URL", () => {
  for (const href of ["javascript:alert(1)", "JaVaScRiPt:alert(1)", "java\tscript:alert(1)", "jav&#x61;script:alert(1)", "jav&#97;script&colon;alert(1)", "vbscript:x", "data:text/html,<script>alert(1)</script>"]) {
    assert.equal(safeUrl(href), false, href);
  }
  for (const href of ["https://x.test", "mailto:a@b.c", "/blog/post", "#top", "../up", "page", "//cdn.test/a.png"]) {
    assert.equal(safeUrl(href), true, href);
  }
  assert.equal(safeUrl("data:image/png;base64,AAAA", "image"), true);
  assert.equal(safeUrl("data:image/svg+xml;base64,AAAA", "image"), false);

  const html = renderMarkdown("[click](javascript:alert(1)) ![x](javascript:alert(1)) <javascript:alert(1)>");
  assert.doesNotMatch(html, /<a |<img |href=|src=/i);
  assert.match(html, /click/);
});

test("raw HTML keeps what Mantel's editor writes and drops the rest", () => {
  const html = renderMarkdown([
    '<p style="text-align:center">Centered</p>',
    "",
    'Some <u>underlined</u>, <mark>marked</mark>, <span style="color:#ff0000; background:url(x)">red</span>, H<sub>2</sub>O.',
    "",
    "<details>\n<summary>More</summary>\n\nHidden part\n</details>",
    "",
    '<audio controls src="/media/s/a/song.mp3"></audio>',
    "",
    '<div data-type="wp-canvas" data-canvas-id="c1" data-doc="eyJ4IjoxfQ"></div>',
  ].join("\n"));
  assert.match(html, /<p style="text-align:center">Centered<\/p>/);
  assert.match(html, /<u>underlined<\/u>/);
  assert.match(html, /<mark>marked<\/mark>/);
  assert.match(html, /<span style="color:#ff0000">red<\/span>/);
  assert.match(html, /<sub>2<\/sub>/);
  assert.match(html, /<details>\s*<summary>More<\/summary>/);
  assert.match(html, /<audio controls src="\/media\/s\/a\/song.mp3"><\/audio>/);
  assert.doesNotMatch(html, /data-doc|data-canvas-id|background/);
});

test("scripts, handlers, frames, and styles never survive", () => {
  const attacks = [
    "<script>alert(1)</script>",
    "<SCRIPT SRC=//evil.test/x.js></SCRIPT>",
    '<img src="x" onerror="alert(1)">',
    '<img src=x onerror=alert(1)//>',
    '<a href="javascript:alert(1)">x</a>',
    '<a href=" jav&#x09;ascript:alert(1)">x</a>',
    '<iframe src="https://evil.test"></iframe>',
    "<style>body{display:none}</style>",
    '<svg onload="alert(1)"><circle/></svg>',
    '<div style="background:url(javascript:alert(1))">x</div>',
    '<p onclick="alert(1)">x</p>',
    '<object data="x"></object><embed src="x">',
    '<form action="https://evil.test"><input name="p"></form>',
    "<!-- <script>alert(1)</script> -->",
    '<math><mi xlink:href="javascript:alert(1)">x</mi></math>',
    '<a href="https://ok.test" target="_blank" onmouseover="alert(1)">ok</a>',
  ];
  for (const attack of attacks) {
    const out = renderMarkdown(attack) + cleanHtml(attack);
    assert.doesNotMatch(out, /<script|<iframe|<style|<svg|<object|<embed|<form|<input|<math|\son\w+=|javascript:/i, attack);
  }
  assert.equal(cleanHtml('<a href="https://ok.test" target="_blank" onmouseover="alert(1)">ok</a>'), '<a href="https://ok.test">ok</a>');
  assert.equal(cleanHtml('<img src="/a.jpg" alt="A &quot;q&quot;" width="40" height="x">'), '<img src="/a.jpg" alt="A &quot;q&quot;" width="40">');
  assert.equal(cleanHtml("a < b && c > d &amp; e"), "a &lt; b &amp;&amp; c &gt; d &amp; e");
});
