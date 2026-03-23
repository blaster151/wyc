const fs = require("fs");

function makeSvg(size) {
  const r = size * 0.42;
  const sw = size * 0.02;
  const fs2 = size * 0.22;
  const ls = size * 0.03;
  const half = size / 2;
  return [
    "<svg xmlns='http://www.w3.org/2000/svg' width='" + size + "' height='" + size + "' viewBox='0 0 " + size + " " + size + "'>",
    "  <rect width='" + size + "' height='" + size + "' fill='#1a1a2e'/>",
    "  <circle cx='" + half + "' cy='" + half + "' r='" + r + "' fill='none' stroke='rgba(255,255,255,0.3)' stroke-width='" + sw + "'/>",
    "  <text x='" + half + "' y='" + half + "' text-anchor='middle' dominant-baseline='central' fill='rgba(255,255,255,0.85)' font-family='sans-serif' font-size='" + fs2 + "' font-weight='300' letter-spacing='" + ls + "'>WYC</text>",
    "</svg>"
  ].join("\n");
}

fs.mkdirSync("public/icons", { recursive: true });
fs.writeFileSync("public/icons/icon-192.svg", makeSvg(192));
fs.writeFileSync("public/icons/icon-512.svg", makeSvg(512));
console.log("SVG icons created");
