// Minimal streaming ZIP writer (store-only, no compression) so the
// submission bundle can include already-compressed files (PDF, DOCX,
// images) without adding a dependency, and so a large bundle can stream to
// the browser instead of being buffered whole - Vercel limits non-streamed
// function responses to ~4.5MB. Only one entry's bytes are held in memory
// at a time. No ZIP64: fine for the bundle's size caps (<4GB, <65k files).

export type ZipEntry = { name: string; data: Uint8Array };

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(data: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < data.length; i++) c = CRC_TABLE[(c ^ data[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function dosDateTime(d: Date): { time: number; date: number } {
  const year = Math.max(d.getFullYear(), 1980);
  return {
    time: (d.getHours() << 11) | (d.getMinutes() << 5) | Math.floor(d.getSeconds() / 2),
    date: ((year - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate(),
  };
}

export function zipStream(entries: AsyncIterable<ZipEntry>): ReadableStream<Uint8Array> {
  const iterator = entries[Symbol.asyncIterator]();
  const central: Uint8Array[] = [];
  const encoder = new TextEncoder();
  const { time, date } = dosDateTime(new Date());
  let offset = 0;
  let count = 0;
  let finished = false;

  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      if (finished) return;
      const next = await iterator.next();

      if (next.done) {
        const centralSize = central.reduce((s, c) => s + c.length, 0);
        for (const c of central) controller.enqueue(c);
        const end = new DataView(new ArrayBuffer(22));
        end.setUint32(0, 0x06054b50, true);
        end.setUint16(8, count, true);
        end.setUint16(10, count, true);
        end.setUint32(12, centralSize, true);
        end.setUint32(16, offset, true);
        controller.enqueue(new Uint8Array(end.buffer));
        finished = true;
        controller.close();
        return;
      }

      const { name, data } = next.value;
      const nameBytes = encoder.encode(name);
      const crc = crc32(data);

      const local = new DataView(new ArrayBuffer(30));
      local.setUint32(0, 0x04034b50, true);
      local.setUint16(4, 20, true);
      local.setUint16(6, 0x0800, true); // UTF-8 names
      local.setUint16(10, time, true);
      local.setUint16(12, date, true);
      local.setUint32(14, crc, true);
      local.setUint32(18, data.length, true);
      local.setUint32(22, data.length, true);
      local.setUint16(26, nameBytes.length, true);
      controller.enqueue(new Uint8Array(local.buffer));
      controller.enqueue(nameBytes);
      controller.enqueue(data);

      const cd = new DataView(new ArrayBuffer(46));
      cd.setUint32(0, 0x02014b50, true);
      cd.setUint16(4, 20, true);
      cd.setUint16(6, 20, true);
      cd.setUint16(8, 0x0800, true);
      cd.setUint16(12, time, true);
      cd.setUint16(14, date, true);
      cd.setUint32(16, crc, true);
      cd.setUint32(20, data.length, true);
      cd.setUint32(24, data.length, true);
      cd.setUint16(28, nameBytes.length, true);
      cd.setUint32(42, offset, true);
      const cdBytes = new Uint8Array(46 + nameBytes.length);
      cdBytes.set(new Uint8Array(cd.buffer), 0);
      cdBytes.set(nameBytes, 46);
      central.push(cdBytes);

      offset += 30 + nameBytes.length + data.length;
      count++;
    },
    async cancel() {
      await iterator.return?.();
    },
  });
}
