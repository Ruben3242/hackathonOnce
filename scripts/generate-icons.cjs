const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const dir = path.join("public", "icons");
fs.mkdirSync(dir, { recursive: true });

function svg(size) {
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
      <rect fill="#0066a1" width="${size}" height="${size}" rx="${Math.round(size * 0.18)}"/>
      <text x="50%" y="58%" text-anchor="middle" fill="white" font-size="${Math.round(size * 0.38)}" font-family="Segoe UI, Arial" font-weight="700">B8</text>
    </svg>`,
  );
}

async function main() {
  await sharp(svg(192)).png().toFile(path.join(dir, "icon-192.png"));
  await sharp(svg(512)).png().toFile(path.join(dir, "icon-512.png"));
  await sharp(svg(180)).png().toFile(path.join(dir, "apple-touch-icon.png"));
  console.log("icons ok");
}

main();
