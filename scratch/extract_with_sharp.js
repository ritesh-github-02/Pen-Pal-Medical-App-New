const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function processImage(inputPath, outputPath, bgThreshold = 238) {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height } = info;
  // data is Uint8Array of length width * height * 4 [r, g, b, a]

  const mask = new Uint8Array(width * height); // 0 = unvisited, 1 = background, 2 = foreground
  const queue = new Int32Array(width * height);
  let qHead = 0, qTail = 0;

  function isBg(idx) {
    const o = idx * 4;
    return data[o] >= bgThreshold && data[o + 1] >= bgThreshold && data[o + 2] >= bgThreshold;
  }

  // Seed 4 borders
  for (let x = 0; x < width; x++) {
    const topIdx = x;
    const btmIdx = (height - 1) * width + x;
    if (isBg(topIdx)) {
      mask[topIdx] = 1;
      queue[qTail++] = topIdx;
    }
    if (isBg(btmIdx)) {
      mask[btmIdx] = 1;
      queue[qTail++] = btmIdx;
    }
  }

  for (let y = 0; y < height; y++) {
    const leftIdx = y * width;
    const rightIdx = y * width + (width - 1);
    if (mask[leftIdx] === 0 && isBg(leftIdx)) {
      mask[leftIdx] = 1;
      queue[qTail++] = leftIdx;
    }
    if (mask[rightIdx] === 0 && isBg(rightIdx)) {
      mask[rightIdx] = 1;
      queue[qTail++] = rightIdx;
    }
  }

  // BFS outer background
  while (qHead < qTail) {
    const curr = queue[qHead++];
    const cx = curr % width;
    const cy = (curr / width) | 0;

    if (cy > 0) {
      const up = curr - width;
      if (mask[up] === 0 && isBg(up)) { mask[up] = 1; queue[qTail++] = up; }
    }
    if (cy < height - 1) {
      const dn = curr + width;
      if (mask[dn] === 0 && isBg(dn)) { mask[dn] = 1; queue[qTail++] = dn; }
    }
    if (cx > 0) {
      const lf = curr - 1;
      if (mask[lf] === 0 && isBg(lf)) { mask[lf] = 1; queue[qTail++] = lf; }
    }
    if (cx < width - 1) {
      const rt = curr + 1;
      if (mask[rt] === 0 && isBg(rt)) { mask[rt] = 1; queue[qTail++] = rt; }
    }
  }

  // Second pass: Find enclosed white components (holes under arms, etc.)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (mask[idx] === 0) {
        const o = idx * 4;
        if (data[o] >= 244 && data[o + 1] >= 244 && data[o + 2] >= 244) {
          // BFS this component
          const comp = [];
          const cQueue = [idx];
          mask[idx] = 3;

          let cqH = 0;
          while (cqH < cQueue.length) {
            const cCurr = cQueue[cqH++];
            comp.push(cCurr);
            const ccx = cCurr % width;
            const ccy = (cCurr / width) | 0;

            const nbrs = [];
            if (ccy > 0) nbrs.push(cCurr - width);
            if (ccy < height - 1) nbrs.push(cCurr + width);
            if (ccx > 0) nbrs.push(cCurr - 1);
            if (ccx < width - 1) nbrs.push(cCurr + 1);

            for (const nb of nbrs) {
              if (mask[nb] === 0) {
                const nbo = nb * 4;
                if (data[nbo] >= 238 && data[nbo + 1] >= 238 && data[nbo + 2] >= 238) {
                  mask[nb] = 3;
                  cQueue.push(nb);
                }
              }
            }
          }

          // If component is substantial (> 40 pixels), mark as background hole
          const targetMask = comp.length > 40 ? 1 : 2;
          for (const ci of comp) {
            mask[ci] = targetMask;
          }
        }
      }
    }
  }

  // Build output RGBA buffer
  const outBuf = Buffer.alloc(width * height * 4);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const o = idx * 4;

      if (mask[idx] === 1) {
        // Transparent
        outBuf[o] = 0;
        outBuf[o + 1] = 0;
        outBuf[o + 2] = 0;
        outBuf[o + 3] = 0;
      } else {
        const r = data[o];
        const g = data[o + 1];
        const b = data[o + 2];

        // Edge check for anti-aliasing
        let isEdge = false;
        if (
          (x > 0 && mask[idx - 1] === 1) ||
          (x < width - 1 && mask[idx + 1] === 1) ||
          (y > 0 && mask[idx - width] === 1) ||
          (y < height - 1 && mask[idx + width] === 1)
        ) {
          isEdge = true;
        }

        if (isEdge) {
          const lum = r * 0.299 + g * 0.587 + b * 0.114;
          if (lum > 230) {
            const alpha = Math.max(0, Math.min(255, Math.round((255 - lum) * 4)));
            outBuf[o] = r;
            outBuf[o + 1] = g;
            outBuf[o + 2] = b;
            outBuf[o + 3] = alpha;
          } else {
            outBuf[o] = r;
            outBuf[o + 1] = g;
            outBuf[o + 2] = b;
            outBuf[o + 3] = 255;
          }
        } else {
          outBuf[o] = r;
          outBuf[o + 1] = g;
          outBuf[o + 2] = b;
          outBuf[o + 3] = 255;
        }
      }
    }
  }

  // Trim transparent padding and save
  const result = await sharp(outBuf, { raw: { width, height, channels: 4 } })
    .trim({ threshold: 1 })
    .png({ compressionLevel: 9 })
    .toFile(outputPath);

  console.log(`Saved ${outputPath}: ${result.width}x${result.height} (${(result.size / 1024).toFixed(1)} KB)`);
}

async function main() {
  const uploadDir = 'C:/Users/User/.gemini/antigravity/brain/6e212e0f-323b-4262-bcea-572b97e6671b/.user_uploaded';

  const tasks = [
    // 1. Slide 1: Nurse Anna palms up
    {
      in: `${uploadDir}/media_1795183608097_44379aa1.jpg`,
      out: 'public/images/nurse-anna-s1.png'
    },
    // 2. Slide 5 & 7: Nurse Anna holding bottle
    {
      in: `${uploadDir}/media_1795183608080_6e33d7d3.jpg`,
      out: 'public/images/nurse-anna-s7.png'
    },
    {
      in: `${uploadDir}/media_1795183608080_6e33d7d3.jpg`,
      out: 'public/images/nurse-anna-holding-bottle-hd.png'
    },
    // 3. Slide 4: Upscaled Nurse Anna gesturing right
    {
      in: `${uploadDir}/media_1795182491431_539516d5.jpg`,
      out: 'public/images/nurse-anna-s4.png'
    },
    // 4. Slide 2 / Slide 8 / Slide 10: Hand on chest gesturing right
    {
      in: `${uploadDir}/media_1794940713907_dfb0c41d.jpg`,
      out: 'public/images/nurse-anna-s2.png'
    },
    // 5. Presenting pose (fe18db78)
    {
      in: `${uploadDir}/media_1795183608098_fe18db78.jpg`,
      out: 'public/images/nurse-anna-presenting.png'
    },
    // 6. Standing smile (5b7191ea)
    {
      in: `${uploadDir}/media_1795183608098_5b7191ea.jpg`,
      out: 'public/images/nurse-anna-standing-smile.png'
    },
    // 7. Standing calm (5ecf280c)
    {
      in: `${uploadDir}/media_1795183608098_5ecf280c.jpg`,
      out: 'public/images/nurse-anna-standing-calm.png'
    }
  ];

  for (const t of tasks) {
    await processImage(t.in, t.out);
  }
  console.log('All image extractions completed successfully.');
}

main().catch(console.error);
