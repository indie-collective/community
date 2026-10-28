// A ZIP file of text files, stored without compression (#304): enough for
// the open data exports, and no dependency. Workers have no zip of their own.

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

/** The CRC-32 of bytes, as ZIP files check it. */
export function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

// DOS date and time, as ZIP headers hold them.
const dosTime = (date) => (date.getUTCHours() << 11) | (date.getUTCMinutes() << 5) | (date.getUTCSeconds() >> 1);
const dosDate = (date) => ((date.getUTCFullYear() - 1980) << 9) | ((date.getUTCMonth() + 1) << 5) | date.getUTCDate();

/**
 * A ZIP archive of `files` (`{ name: text }`), stored, names in UTF-8.
 * @returns {Uint8Array}
 */
export function zip(files, date = new Date()) {
  const encoder = new TextEncoder();
  const entries = Object.entries(files).map(([name, text]) => {
    const data = typeof text === 'string' ? encoder.encode(text) : text;
    return { name: encoder.encode(name), data, crc: crc32(data) };
  });
  const parts = [];
  const central = [];
  let offset = 0;
  const header = (size) => new DataView(new ArrayBuffer(size));
  for (const entry of entries) {
    const local = header(30);
    local.setUint32(0, 0x04034b50, true);
    local.setUint16(4, 20, true); // version needed
    local.setUint16(6, 0x0800, true); // UTF-8 names
    local.setUint16(8, 0, true); // stored
    local.setUint16(10, dosTime(date), true);
    local.setUint16(12, dosDate(date), true);
    local.setUint32(14, entry.crc, true);
    local.setUint32(18, entry.data.length, true);
    local.setUint32(22, entry.data.length, true);
    local.setUint16(26, entry.name.length, true);
    local.setUint16(28, 0, true);
    parts.push(new Uint8Array(local.buffer), entry.name, entry.data);

    const dir = header(46);
    dir.setUint32(0, 0x02014b50, true);
    dir.setUint16(4, 20, true); // made by
    dir.setUint16(6, 20, true);
    dir.setUint16(8, 0x0800, true);
    dir.setUint16(10, 0, true);
    dir.setUint16(12, dosTime(date), true);
    dir.setUint16(14, dosDate(date), true);
    dir.setUint32(16, entry.crc, true);
    dir.setUint32(20, entry.data.length, true);
    dir.setUint32(24, entry.data.length, true);
    dir.setUint16(28, entry.name.length, true);
    dir.setUint32(42, offset, true);
    central.push(new Uint8Array(dir.buffer), entry.name);
    offset += 30 + entry.name.length + entry.data.length;
  }
  const centralSize = central.reduce((sum, part) => sum + part.length, 0);
  const end = header(22);
  end.setUint32(0, 0x06054b50, true);
  end.setUint16(8, entries.length, true);
  end.setUint16(10, entries.length, true);
  end.setUint32(12, centralSize, true);
  end.setUint32(16, offset, true);
  const all = [...parts, ...central, new Uint8Array(end.buffer)];
  const out = new Uint8Array(all.reduce((sum, part) => sum + part.length, 0));
  let at = 0;
  for (const part of all) {
    out.set(part, at);
    at += part.length;
  }
  return out;
}
