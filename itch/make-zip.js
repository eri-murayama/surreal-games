const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const gameName = process.argv[2] || 'puzzle-2048';
const srcDir = path.join(__dirname, gameName);

function crc32(buf) {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    table[i] = c;
  }
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

const entries = [];
function addFile(fp, zn) { entries.push({name: zn, data: fs.readFileSync(path.join(srcDir, fp))}); }
function addDir(dir, prefix) {
  for (const f of fs.readdirSync(path.join(srcDir, dir))) {
    const full = path.join(srcDir, dir, f);
    if (fs.statSync(full).isFile()) {
      addFile(path.join(dir, f), prefix + f);
    }
  }
}

// Add game files (skip .md files)
for (const f of fs.readdirSync(srcDir)) {
  const full = path.join(srcDir, f);
  if (fs.statSync(full).isFile() && !f.endsWith('.md')) {
    addFile(f, f);
  }
}
// Add subdirectories (images/, audio/, etc.)
for (const sub of ['images', 'audio']) {
  if (fs.existsSync(path.join(srcDir, sub))) {
    addDir(sub, sub + '/');
  }
}

console.log('Files:', entries.map(e => e.name).join(', '));

const localParts = [];
const centralParts = [];
let offset = 0;

for (const e of entries) {
  const nameB = Buffer.from(e.name, 'utf8');
  const comp = zlib.deflateRawSync(e.data);
  const crc = crc32(e.data);

  const lh = Buffer.alloc(30);
  lh.writeUInt32LE(0x04034b50, 0);
  lh.writeUInt16LE(20, 4);
  lh.writeUInt16LE(0, 6);
  lh.writeUInt16LE(8, 8);
  lh.writeUInt16LE(0, 10);
  lh.writeUInt16LE(0, 12);
  lh.writeUInt32LE(crc, 14);
  lh.writeUInt32LE(comp.length, 18);
  lh.writeUInt32LE(e.data.length, 22);
  lh.writeUInt16LE(nameB.length, 26);
  lh.writeUInt16LE(0, 28);
  localParts.push(lh, nameB, comp);

  const ch = Buffer.alloc(46);
  ch.writeUInt32LE(0x02014b50, 0);
  ch.writeUInt16LE(20, 4);
  ch.writeUInt16LE(20, 6);
  ch.writeUInt16LE(0, 8);
  ch.writeUInt16LE(8, 10);
  ch.writeUInt16LE(0, 12);
  ch.writeUInt16LE(0, 14);
  ch.writeUInt32LE(crc, 16);
  ch.writeUInt32LE(comp.length, 20);
  ch.writeUInt32LE(e.data.length, 24);
  ch.writeUInt16LE(nameB.length, 28);
  ch.writeUInt16LE(0, 30);
  ch.writeUInt16LE(0, 32);
  ch.writeUInt16LE(0, 34);
  ch.writeUInt16LE(0, 36);
  ch.writeUInt32LE(0, 38);
  ch.writeUInt32LE(offset, 42);
  centralParts.push(ch, nameB);

  offset += 30 + nameB.length + comp.length;
}

const cdSize = centralParts.reduce((s,b) => s + b.length, 0);
const eocd = Buffer.alloc(22);
eocd.writeUInt32LE(0x06054b50, 0);
eocd.writeUInt16LE(0, 4);
eocd.writeUInt16LE(0, 6);
eocd.writeUInt16LE(entries.length, 8);
eocd.writeUInt16LE(entries.length, 10);
eocd.writeUInt32LE(cdSize, 12);
eocd.writeUInt32LE(offset, 16);
eocd.writeUInt16LE(0, 20);

const out = Buffer.concat([...localParts, ...centralParts, eocd]);
const outPath = path.join(__dirname, gameName + '.zip');
fs.writeFileSync(outPath, out);
console.log('Created:', outPath, '(' + out.length + ' bytes)');
