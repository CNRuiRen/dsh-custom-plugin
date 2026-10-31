"""Generate the original, license-clean preview used by README.md.

The image is procedural: a blue/teal gradient, two soft glows, a diagonal
light band, fine grain, and a vignette. It contains no third-party artwork.
Run with: python docs/generate-preview.py
"""

from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

WIDTH, HEIGHT = 1600, 900
OUT = Path(__file__).with_name("wallpaper-preview.jpg")


def main() -> None:
    y, x = np.mgrid[0:HEIGHT, 0:WIDTH].astype(np.float32)
    u = x / (WIDTH - 1)
    v = y / (HEIGHT - 1)

    # Deep navy at the bottom-left, cyan toward the top-right.
    base_top = np.array([10, 48, 92], dtype=np.float32)
    base_bottom = np.array([3, 16, 35], dtype=np.float32)
    base = base_top[None, None, :] * (1 - v[..., None]) + base_bottom[None, None, :] * v[..., None]
    teal = np.array([31, 177, 196], dtype=np.float32)
    base = base * (1 - 0.34 * u[..., None]) + teal[None, None, :] * (0.34 * u[..., None])

    # Soft radial glows.
    def glow(cx: float, cy: float, radius: float, color: tuple[float, float, float], strength: float) -> np.ndarray:
        d = np.sqrt((u - cx) ** 2 + (v - cy) ** 2)
        mask = np.clip(1 - d / radius, 0, 1) ** 2
        return mask[..., None] * np.array(color, dtype=np.float32) * strength

    base += glow(0.80, 0.20, 0.62, (56, 215, 225), 0.34)
    base += glow(0.13, 0.85, 0.56, (5, 20, 50), 0.30)

    # A soft diagonal light band.
    band_pos = 0.78 - u * 0.38
    band = np.clip(1 - np.abs(v - band_pos) / 0.085, 0, 1) ** 2
    base += band[..., None] * np.array([45, 160, 200], dtype=np.float32) * 0.11

    # Fine grain and a gentle vignette.
    rng = np.random.default_rng(20261031)
    grain = rng.normal(0, 2.1, (HEIGHT, WIDTH, 1))
    vignette = np.clip(1.08 - (((u - 0.5) ** 2 + (v - 0.5) ** 2) ** 0.5) * 0.72, 0.62, 1.0)
    image = np.clip((base + grain) * vignette[..., None], 0, 255).astype(np.uint8)

    preview = Image.fromarray(image, "RGB").filter(ImageFilter.GaussianBlur(0.35))
    preview.save(OUT, "JPEG", quality=90, optimize=True, progressive=True)
    print(f"wrote {OUT} ({OUT.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
