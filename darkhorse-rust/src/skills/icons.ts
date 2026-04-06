// ──────────────────────────────────────────────────────────────────
// Skill: generateDefaultIcons
// Generates minimal placeholder icon files required by Tauri build.
// Produces valid PNG (32x32, 128x128, 256x256) ICO, and ICNS files.
// ──────────────────────────────────────────────────────────────────

import path from 'node:path';
import fs from 'node:fs/promises';
import zlib from 'node:zlib';
import { ensureDir } from '../core/fs.js';

// ── Minimal PNG generation ─────────────────────────────────────

/** CRC32 lookup table for PNG chunk checksums. */
const crcTable: number[] = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type: string, data: Uint8Array): Uint8Array {
  const typeBytes = new TextEncoder().encode(type);
  const len = data.length;
  const buf = new Uint8Array(4 + 4 + len + 4);
  const view = new DataView(buf.buffer);
  view.setUint32(0, len);
  buf.set(typeBytes, 4);
  buf.set(data, 8);
  const crcData = new Uint8Array(4 + len);
  crcData.set(typeBytes, 0);
  crcData.set(data, 4);
  view.setUint32(8 + len, crc32(crcData));
  return buf;
}

/**
 * Generate a minimal valid PNG file with a solid dark grey fill.
 * RGBA format, color #333333FF — a neutral Dark Horse placeholder.
 */
function generatePng(width: number, height: number): Buffer {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = new Uint8Array(13);
  const ihdrView = new DataView(ihdr.buffer);
  ihdrView.setUint32(0, width);
  ihdrView.setUint32(4, height);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // color type: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  // Raw image data: filter byte + RGBA pixels per row
  const rowBytes = 1 + width * 4;
  const raw = new Uint8Array(rowBytes * height);
  for (let y = 0; y < height; y++) {
    raw[y * rowBytes] = 0; // no filter
    for (let x = 0; x < width; x++) {
      const offset = y * rowBytes + 1 + x * 4;
      raw[offset] = 0x33;     // R
      raw[offset + 1] = 0x33; // G
      raw[offset + 2] = 0x33; // B
      raw[offset + 3] = 0xff; // A
    }
  }

  // Deflate using Node.js built-in zlib
  const compressed = zlib.deflateSync(Buffer.from(raw), { level: 9 });

  const idatData = new Uint8Array(compressed.buffer, compressed.byteOffset, compressed.length);

  return Buffer.concat([
    signature,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', idatData),
    pngChunk('IEND', new Uint8Array(0)),
  ]);
}

// ── ICO generation ─────────────────────────────────────────────

/**
 * Generate a minimal valid ICO file containing a 32x32 PNG entry.
 */
function generateIco(pngData: Buffer): Buffer {
  // ICO header: reserved(2) + type(2) + count(2) = 6 bytes
  // ICO directory entry: 16 bytes
  // Then the PNG data
  const headerSize = 6;
  const dirEntrySize = 16;
  const dataOffset = headerSize + dirEntrySize;

  const buf = Buffer.alloc(dataOffset + pngData.length);
  // Header
  buf.writeUInt16LE(0, 0); // reserved
  buf.writeUInt16LE(1, 2); // type: ICO
  buf.writeUInt16LE(1, 4); // count: 1 image

  // Directory entry
  buf.writeUInt8(32, 6);   // width (0 means 256)
  buf.writeUInt8(32, 7);   // height
  buf.writeUInt8(0, 8);    // color palette
  buf.writeUInt8(0, 9);    // reserved
  buf.writeUInt16LE(1, 10); // color planes
  buf.writeUInt16LE(32, 12); // bits per pixel
  buf.writeUInt32LE(pngData.length, 14); // data size
  buf.writeUInt32LE(dataOffset, 18); // data offset

  pngData.copy(buf, dataOffset);
  return buf;
}

// ── ICNS generation ────────────────────────────────────────────

/**
 * Generate a minimal valid ICNS file containing a 128x128 PNG entry.
 * Uses 'ic07' type (128x128 PNG).
 */
function generateIcns(png128: Buffer): Buffer {
  const iconType = Buffer.from('ic07'); // 128x128 PNG
  const entrySize = 8 + png128.length; // type(4) + size(4) + data
  const fileSize = 8 + entrySize; // magic(4) + filesize(4) + entry

  const buf = Buffer.alloc(fileSize);
  // Header
  buf.write('icns', 0, 4, 'ascii');
  buf.writeUInt32BE(fileSize, 4);
  // Entry
  iconType.copy(buf, 8);
  buf.writeUInt32BE(entrySize, 12);
  png128.copy(buf, 16);

  return buf;
}

// ── Public API ─────────────────────────────────────────────────

/**
 * Generate all default icon files required by Tauri into the given directory.
 * Returns the list of generated file names.
 */
export async function generateDefaultIcons(iconsDir: string): Promise<string[]> {
  const png32 = generatePng(32, 32);
  const png128 = generatePng(128, 128);
  const png256 = generatePng(256, 256);
  const ico = generateIco(png32);
  const icns = generateIcns(png128);

  const files: [string, Buffer][] = [
    ['32x32.png', png32],
    ['128x128.png', png128],
    ['128x128@2x.png', png256],
    ['icon.ico', ico],
    ['icon.icns', icns],
  ];

  const created: string[] = [];
  for (const [name, data] of files) {
    const filePath = path.join(iconsDir, name);
    await ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, data);
    created.push(name);
  }
  return created;
}
