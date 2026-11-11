/**
 * Pictures on the tube. A phosphor screen has one colour and no greys, so a
 * photograph or a screenshot is redrawn the way a handheld of the era showed
 * one: four shades of the work's colour, the steps between them broken up by
 * an ordered dither, in dots two pixels square so each row lands on a scan line.
 */

const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

/** Load `src` and dither it to fit `maxW` × `maxH` surface pixels, in the colour `hex`. */
export function loadPicture(src: string, maxW: number, maxH: number, hex: string): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onerror = () => reject(new Error(`picture not found: ${src}`));
    img.onload = () => {
      const k = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight, 1.5);
      const w = Math.max(2, Math.round((img.naturalWidth * k) / 2));
      const h = Math.max(2, Math.round((img.naturalHeight * k) / 2));
      const small = document.createElement("canvas");
      small.width = w;
      small.height = h;
      const ctx = small.getContext("2d", { willReadFrequently: true });
      if (!ctx) {
        reject(new Error("2d canvas unavailable"));
        return;
      }
      // on black, so a drawing with a clear ground keeps only its strokes
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      const image = ctx.getImageData(0, 0, w, h);
      const data = image.data;

      const light = new Float32Array(w * h);
      let lo = 1;
      let hi = 0;
      for (let i = 0; i < w * h; i += 1) {
        const l = (0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2]) / 255;
        light[i] = l;
        if (l < lo) lo = l;
        if (l > hi) hi = l;
      }
      // spread the picture's own range of light across the four shades
      const span = Math.max(0.05, hi - lo);
      const n = Number.parseInt(hex.slice(1), 16);
      const rgb = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
      const shade = [0, 0.34, 0.67, 1];
      for (let y = 0; y < h; y += 1) {
        for (let x = 0; x < w; x += 1) {
          const i = y * w + x;
          const v = ((light[i] - lo) / span) * 3;
          const base = Math.floor(v);
          const step = v - base > (BAYER[(y & 3) * 4 + (x & 3)] + 0.5) / 16 ? 1 : 0;
          const s = shade[Math.min(3, base + step)];
          data[i * 4] = rgb[0] * s;
          data[i * 4 + 1] = rgb[1] * s;
          data[i * 4 + 2] = rgb[2] * s;
          data[i * 4 + 3] = 255;
        }
      }
      ctx.putImageData(image, 0, 0);

      const out = document.createElement("canvas");
      out.width = w * 2;
      out.height = h * 2;
      const big = out.getContext("2d");
      if (!big) {
        reject(new Error("2d canvas unavailable"));
        return;
      }
      big.imageSmoothingEnabled = false;
      big.drawImage(small, 0, 0, w * 2, h * 2);
      resolve(out);
    };
    img.src = src;
  });
}
