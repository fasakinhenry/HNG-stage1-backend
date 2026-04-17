/**
 * UUID v7 generator — time-ordered, no external dependencies needed.
 * UUID v7 format: unix_ts_ms (48 bits) | ver (4) | rand_a (12) | var (2) | rand_b (62)
 */
function uuidv7() {
  const now = Date.now();

  // 48-bit timestamp in milliseconds
  const tsMsHigh = Math.floor(now / 0x100000000);
  const tsMsLow = now >>> 0;

  // 12 random bits (rand_a) + 62 random bits (rand_b)
  const randA = Math.floor(Math.random() * 0x1000); // 12 bits
  const randBHigh = Math.floor(Math.random() * 0x3fffffff); // 30 bits
  const randBLow = Math.floor(Math.random() * 0x100000000); // 32 bits

  const hex = [
    pad(tsMsHigh, 8),
    pad(tsMsLow, 8),
  ].join("").slice(0, 12); // 48-bit ts = 12 hex chars

  const part2 = "7" + pad(randA, 3); // version 7 + 12 rand bits
  const part3 = (0x8000 | (randBHigh >>> 14)).toString(16).padStart(4, "0"); // variant + rand
  const part4 = pad(((randBHigh & 0x3fff) >>> 0), 4) + pad(randBLow, 8);

  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${part2}-${part3}-${part4}`;
}

function pad(num, len) {
  return num.toString(16).padStart(len, "0");
}

module.exports = { uuidv7 };
