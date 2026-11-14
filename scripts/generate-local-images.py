#!/usr/bin/env python3
"""Generate on-brand local images to replace picsum.photos placeholders."""

from __future__ import annotations

import math
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "images"

PAPER = (245, 245, 240)
INK = (24, 24, 24)
CREAM = (252, 242, 225)
DARK = (27, 25, 23)
MUTED = (106, 106, 106)
WARM = (166, 157, 141)
BORDER = (224, 224, 220)
DARK_BORDER = (50, 44, 38)
SAND = (232, 222, 204)
TERRACOTTA = (176, 122, 98)
MOSS = (122, 138, 116)
SLATE = (90, 102, 108)
GOLD = (196, 166, 122)
LILAC = (156, 148, 176)

AVERIA = "/usr/share/fonts/truetype/sand-box/google/Averia Libre/AveriaLibre-Regular.ttf"
AVERIA_BOLD = "/usr/share/fonts/truetype/sand-box/google/Averia Libre/AveriaLibre-Bold.ttf"
PLEX = "/usr/share/fonts/truetype/sand-box/google/IBM Plex Sans/IBMPlexSans-VariableFont_wdth,wght.ttf"


def font(path: str, size: int, **kw) -> ImageFont.FreeTypeFont:
    try:
        return ImageFont.truetype(path, size=size, **kw)
    except OSError:
        return ImageFont.load_default()


def plex(size: int, weight: int = 450) -> ImageFont.FreeTypeFont:
    return font(PLEX, size)


def averia(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    return font(AVERIA_BOLD if bold else AVERIA, size)


def save(img: Image.Image, rel: str, quality: int = 88) -> Path:
    path = OUT / rel
    path.parent.mkdir(parents=True, exist_ok=True)
    rgb = img.convert("RGB")
    rgb.save(path, "WEBP", quality=quality, method=6)
    print(f"  wrote {path.relative_to(ROOT)} ({path.stat().st_size} bytes, {rgb.size[0]}x{rgb.size[1]})")
    return path


def new_canvas(size: tuple[int, int], color=PAPER, scale: int = 2) -> tuple[Image.Image, ImageDraw.ImageDraw, int]:
    W, H = size[0] * scale, size[1] * scale
    im = Image.new("RGB", (W, H), color)
    return im, ImageDraw.Draw(im, "RGBA"), scale


def down(im: Image.Image, size: tuple[int, int]) -> Image.Image:
    return im.resize(size, Image.Resampling.LANCZOS)


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(len(a)))


def vertical_gradient(size, top, bottom, scale=2) -> Image.Image:
    import numpy as np
    W, H = size[0] * scale, size[1] * scale
    t = np.linspace(0, 1, H, dtype=np.float32)[:, None]
    arr = (np.array(top, dtype=np.float32) * (1 - t) + np.array(bottom, dtype=np.float32) * t)
    arr = np.broadcast_to(arr[:, None, :], (H, W, 3)).copy().astype(np.uint8)
    return Image.fromarray(arr, "RGB")


def radial_wash(im: Image.Image, color, cx, cy, radius, strength=0.55) -> Image.Image:
    """Soft radial overlay."""
    import numpy as np
    w, h = im.size
    ys, xs = np.ogrid[:h, :w]
    dist = np.sqrt((xs - cx) ** 2 + (ys - cy) ** 2) / max(radius, 1)
    alpha = np.clip(1.0 - np.minimum(dist, 1.0), 0, 1) ** 1.4 * 255 * strength
    overlay = np.zeros((h, w, 4), dtype=np.uint8)
    overlay[..., 0] = color[0]
    overlay[..., 1] = color[1]
    overlay[..., 2] = color[2]
    overlay[..., 3] = alpha.astype(np.uint8)
    return Image.alpha_composite(im.convert("RGBA"), Image.fromarray(overlay, "RGBA")).convert("RGB")


def contain_shot(src: Path | str, size: tuple[int, int], bg=PAPER, pad: float = 0.08, shadow: bool = True) -> Image.Image:
    shot = Image.open(src).convert("RGBA")
    W, H = size
    inner_w, inner_h = int(W * (1 - 2 * pad)), int(H * (1 - 2 * pad))
    scale = min(inner_w / shot.width, inner_h / shot.height)
    nw, nh = max(1, int(shot.width * scale)), max(1, int(shot.height * scale))
    shot = shot.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", size, bg)
    x, y = (W - nw) // 2, (H - nh) // 2
    if shadow:
        sh = Image.new("RGBA", size, (0, 0, 0, 0))
        sd = ImageDraw.Draw(sh)
        sd.rounded_rectangle((x + 8, y + 12, x + nw + 8, y + nh + 14), 12, fill=(24, 24, 24, 28))
        sh = sh.filter(ImageFilter.GaussianBlur(10))
        canvas = Image.alpha_composite(canvas.convert("RGBA"), sh).convert("RGB")
    # rounded clip
    mask = Image.new("L", (nw, nh), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, nw - 1, nh - 1), 10, fill=255)
    rounded = Image.new("RGBA", (nw, nh), (0, 0, 0, 0))
    rounded.paste(shot, (0, 0))
    rounded.putalpha(mask)
    canvas = canvas.convert("RGBA")
    canvas.paste(rounded, (x, y), rounded)
    return canvas.convert("RGB")


def typographic(size, title: str, subtitle: str | None = None, dark: bool = False) -> Image.Image:
    bg, fg, sub, border = (DARK, CREAM, WARM, DARK_BORDER) if dark else (PAPER, INK, MUTED, BORDER)
    im, d, s = new_canvas(size, bg)
    W, H = im.size
    margin = int(min(W, H) * 0.08)
    d.rectangle((margin, margin, W - margin, H - margin), outline=border + (255,), width=max(2, s))
    # decorative rule
    title_size = max(42, int(min(W, H) * 0.085))
    f_title = averia(title_size)
    # wrap title
    words = title.split()
    lines: list[str] = []
    cur = ""
    max_w = W - margin * 2 - s * 20
    for w in words:
        trial = (cur + " " + w).strip()
        if d.textlength(trial, font=f_title) <= max_w:
            cur = trial
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    line_h = int(title_size * 1.15)
    block_h = line_h * len(lines) + (int(title_size * 0.8) if subtitle else 0)
    y = (H - block_h) // 2
    for line in lines:
        d.text((margin + s * 16, y), line, font=f_title, fill=fg)
        y += line_h
    if subtitle:
        f_sub = plex(max(22, int(title_size * 0.38)))
        d.text((margin + s * 16, y + int(title_size * 0.2)), subtitle, font=f_sub, fill=sub)
    return down(im, size)


def abstract(size, seed: str, palette: list[tuple[int, int, int]], dark: bool = False) -> Image.Image:
    rng = random.Random(seed)
    bg = palette[0]
    im = vertical_gradient(size, palette[0], palette[1] if len(palette) > 1 else palette[0])
    W, H = im.size
    # soft washes
    for _ in range(3):
        color = palette[rng.randint(0, len(palette) - 1)]
        cx, cy = rng.randint(0, W), rng.randint(0, H)
        radius = rng.randint(int(min(W, H) * 0.35), int(min(W, H) * 0.85))
        im = radial_wash(im, color, cx, cy, radius, strength=rng.uniform(0.18, 0.4))
    overlay = Image.new("RGBA", im.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    # large rounded blocks
    for i in range(rng.randint(4, 7)):
        color = palette[rng.randint(0, len(palette) - 1)]
        w = rng.randint(int(W * 0.18), int(W * 0.55))
        h = rng.randint(int(H * 0.12), int(H * 0.5))
        x = rng.randint(-w // 4, W - w // 2)
        y = rng.randint(-h // 4, H - h // 2)
        r = rng.randint(int(min(w, h) * 0.08), int(min(w, h) * 0.28))
        alpha = rng.randint(40, 110)
        d.rounded_rectangle((x, y, x + w, y + h), r, fill=color + (alpha,))
    # thin rings / arcs
    for _ in range(2):
        color = palette[-1]
        cx, cy = rng.randint(W // 6, 5 * W // 6), rng.randint(H // 6, 5 * H // 6)
        rad = rng.randint(int(min(W, H) * 0.15), int(min(W, H) * 0.45))
        width = rng.randint(6, 16)
        d.ellipse((cx - rad, cy - rad, cx + rad, cy + rad), outline=color + (70,), width=width)
    im = Image.alpha_composite(im.convert("RGBA"), overlay).convert("RGB")
    # faint grain
    grain = Image.effect_noise(im.size, 16).convert("L")
    g_rgba = Image.new("RGBA", im.size)
    g_rgba.putalpha(grain.point(lambda p: 8 if p > 128 else 0))
    im = Image.alpha_composite(im.convert("RGBA"), g_rgba).convert("RGB")
    return down(im, (size[0], size[1]) if im.size[0] != size[0] else size)


def abstract_sized(size, seed, palette, dark=False):
    # abstract() currently expects already-scaled? I'll generate at 2x inside.
    im = abstract((size[0], size[1]), seed, palette, dark)
    # wait, abstract uses vertical_gradient which already scales by 2, then
    # draws on the 2x image, then I called down() at the end with size.
    # But I passed size to abstract and vertical_gradient multiplies by 2.
    # Then down(im, size) - good if I don't down twice.
    # I already down() at end of abstract. Good.
    return im


def lego_abstract(size) -> Image.Image:
    im, d, s = new_canvas(size, PAPER)
    W, H = im.size
    # stacked rounded "bricks" in muted tones
    bricks = [
        (INK, 0.18, 0.42, 0.64, 0.18),
        (TERRACOTTA, 0.28, 0.55, 0.52, 0.16),
        (GOLD, 0.22, 0.66, 0.40, 0.14),
        (SLATE, 0.34, 0.76, 0.28, 0.12),
        (MOSS, 0.26, 0.22, 0.22, 0.14),
    ]
    for color, x_r, y_r, w_r, h_r in bricks:
        x, y, w, h = int(W * x_r), int(H * y_r), int(W * w_r), int(H * h_r)
        d.rounded_rectangle((x, y, x + w, y + h), int(h * 0.18), fill=color + (255,))
        # studs
        studs = 4 if w_r > 0.4 else 3 if w_r > 0.3 else 2
        r = int(h * 0.16)
        gap = w // (studs + 1)
        for i in range(studs):
            cx = x + gap * (i + 1)
            cy = y + int(h * 0.32)
            d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=lerp(color, (255, 255, 255), 0.18) + (255,))
    return down(im, size)


def window_abstract(size, seed: str) -> Image.Image:
    """A quiet framed-window motif on warm paper — for Mumbai / room slots."""
    rng = random.Random(seed)
    im, d, s = new_canvas(size, PAPER)
    W, H = im.size
    # outer wash
    base = vertical_gradient(size, PAPER, SAND)
    im = base
    d = ImageDraw.Draw(im, "RGBA")
    # window frame
    m_x, m_y = int(W * 0.16), int(H * 0.12)
    frame = (m_x, m_y, W - m_x, H - m_y)
    d.rounded_rectangle(frame, int(20 * s), fill=CREAM + (255,), outline=INK + (40,), width=s * 3)
    # mullion
    mid_x = (frame[0] + frame[2]) // 2
    mid_y = (frame[1] + frame[3]) // 2
    d.rectangle((mid_x - s * 3, frame[1], mid_x + s * 3, frame[3]), fill=PAPER + (255,))
    d.rectangle((frame[0], mid_y - s * 3, frame[2], mid_y + s * 3), fill=PAPER + (255,))
    # inner panes with soft light
    panes = [
        (frame[0] + s * 8, frame[1] + s * 8, mid_x - s * 8, mid_y - s * 8),
        (mid_x + s * 8, frame[1] + s * 8, frame[2] - s * 8, mid_y - s * 8),
        (frame[0] + s * 8, mid_y + s * 8, mid_x - s * 8, frame[3] - s * 8),
        (mid_x + s * 8, mid_y + s * 8, frame[2] - s * 8, frame[3] - s * 8),
    ]
    tones = [lerp(SAND, CREAM, 0.4), lerp(GOLD, CREAM, 0.6), lerp(SLATE, CREAM, 0.7), lerp(PAPER, CREAM, 0.2)]
    rng.shuffle(tones)
    for pane, tone in zip(panes, tones):
        d.rectangle(pane, fill=tone + (255,))
    return down(im, size)


def system_abstract(size, seed: str) -> Image.Image:
    """Token / swatch grid — for design-system slots."""
    rng = random.Random(seed)
    im, d, s = new_canvas(size, PAPER)
    W, H = im.size
    swatches = [INK, MUTED, SAND, GOLD, TERRACOTTA, MOSS, SLATE, CREAM, DARK, WARM]
    cols, rows = 5, 3
    gap = int(min(W, H) * 0.035)
    margin_x = int(W * 0.1)
    margin_y = int(H * 0.16)
    cell_w = (W - 2 * margin_x - gap * (cols - 1)) // cols
    cell_h = (H - 2 * margin_y - gap * (rows - 1)) // rows
    i = 0
    for r in range(rows):
        for c in range(cols):
            x = margin_x + c * (cell_w + gap)
            y = margin_y + r * (cell_h + gap)
            color = swatches[i % len(swatches)]
            i += 1
            d.rounded_rectangle((x, y, x + cell_w, y + cell_h), int(12 * s / 2 + 8), fill=color + (255,))
    return down(im, size)


def board_abstract(size, seed: str) -> Image.Image:
    """Soft card grid — for JobStax board."""
    rng = random.Random(seed)
    im, d, s = new_canvas(size, PAPER)
    W, H = im.size
    cols, rows = 3, 2
    gap = int(min(W, H) * 0.04)
    margin_x, margin_y = int(W * 0.08), int(H * 0.12)
    cell_w = (W - 2 * margin_x - gap * (cols - 1)) // cols
    cell_h = (H - 2 * margin_y - gap * (rows - 1)) // rows
    colors = [CREAM, SAND, (238, 238, 232), (252, 246, 236), (232, 228, 220), (244, 236, 220)]
    for r in range(rows):
        for c in range(cols):
            x = margin_x + c * (cell_w + gap)
            y = margin_y + r * (cell_h + gap)
            d.rounded_rectangle((x, y, x + cell_w, y + cell_h), int(18 * s / 2 + 10), fill=colors[(r * cols + c) % len(colors)] + (255,), outline=BORDER + (255,), width=s)
            # little title bar
            d.rounded_rectangle((x + s * 16, y + s * 18, x + cell_w - s * 16, y + s * 36), 6, fill=INK + (28,))
            d.rounded_rectangle((x + s * 16, y + s * 48, x + int(cell_w * 0.6), y + s * 58), 4, fill=INK + (16,))
    return down(im, size)


def map_abstract(size, seed: str) -> Image.Image:
    """Node-and-edge map — for posture canvas."""
    rng = random.Random(seed)
    im, d, s = new_canvas(size, PAPER)
    W, H = im.size
    nodes = []
    for _ in range(9):
        nodes.append((rng.randint(int(W * 0.15), int(W * 0.85)), rng.randint(int(H * 0.15), int(H * 0.85))))
    for i, a in enumerate(nodes):
        for b in nodes[i + 1 :]:
            if rng.random() < 0.28:
                d.line([a, b], fill=INK + (30,), width=s * 2)
    for i, (x, y) in enumerate(nodes):
        r = int((18 if i % 3 else 26) * s / 1.5 + 10)
        fill = INK if i == 0 else (DARK if i % 2 == 0 else SLATE)
        d.ellipse((x - r, y - r, x + r, y + r), fill=fill + (255,))
    return down(im, size)


def main() -> None:
    fold = ROOT / "public" / "foldhealth-preview.png"
    banyan = ROOT / "public" / "banyan-cloud-preview.png"
    og = ROOT / "public" / "og.png"
    writr_home = Path("/workspace/repos/WriterPro/public/writrpro-home@2x.png")
    writr_og = Path("/workspace/repos/WriterPro/public/og-image.png")
    writr_publish = Path("/workspace/repos/WriterPro/public/marketing/features/publish.png")
    writr_focus = Path("/workspace/repos/WriterPro/public/marketing/features/focus.png")

    print("Compositing existing screenshots…")
    save(contain_shot(fold, (1600, 900), pad=0.07), "work/fold-hero.webp", 90)
    save(contain_shot(fold, (1200, 800), pad=0.06), "work/fold-rule.webp", 90)
    save(contain_shot(fold, (1400, 900), pad=0.06), "projects/rule-builder-canvas.webp", 90)
    save(contain_shot(fold, (1200, 800), pad=0.07), "blog/clinicians.webp", 90)

    save(contain_shot(banyan, (1600, 900), pad=0.08), "work/banyan-hero.webp", 90)
    save(contain_shot(banyan, (1400, 900), pad=0.08), "work/banyan-screen.webp", 90)

    save(contain_shot(og, (1200, 800), pad=0.0, shadow=False), "blog/welcome.webp", 90)

    save(contain_shot(writr_home, (1600, 900), pad=0.05), "work/writrpro-hero.webp", 90)
    # editor: prefer the higher-res marketing OG (shows the writing surface);
    # fall back to the focus feature crop if needed.
    editor_src = writr_og if writr_og.exists() else writr_focus
    save(contain_shot(editor_src, (1400, 900), pad=0.06), "work/writrpro-editor.webp", 90)
    save(contain_shot(writr_publish, (1400, 900), pad=0.1), "work/writrpro-publish.webp", 90)

    print("Generating abstract placeholders…")
    save(lego_abstract((900, 1100)), "about/legos.webp")

    # Photography — abstract color fields, not fake travel photos
    save(abstract_sized((1200, 800), "pune", [PAPER, CREAM, GOLD, SAND]), "photos/pune.webp")
    save(abstract_sized((900, 1100), "goa", [SAND, CREAM, GOLD, TERRACOTTA, PAPER]), "photos/goa.webp")
    save(abstract_sized((1000, 1000), "kerala", [PAPER, MOSS, SAND, CREAM]), "photos/kerala.webp")
    save(abstract_sized((1000, 1000), "street", [DARK, INK, GOLD, SLATE], dark=True), "photos/street.webp")
    save(window_abstract((1200, 800), "mumbai"), "photos/mumbai.webp")
    save(abstract_sized((900, 1100), "delhi", [SAND, TERRACOTTA, GOLD, PAPER]), "photos/delhi.webp")

    save(typographic((1200, 800), "Why I still write CSS", "Even as a designer"), "blog/css-designer.webp")
    save(system_abstract((1200, 800), "blog-roots"), "blog/design-system.webp")

    # Fold gallery extras
    save(abstract_sized((1200, 800), "fold-team", [PAPER, CREAM, SAND, MOSS]), "work/fold-team.webp")
    save(window_abstract((1000, 1200), "fold-room"), "work/fold-room.webp")
    save(system_abstract((1400, 900), "fold-system"), "work/fold-system.webp")

    save(abstract_sized((1200, 800), "banyan-team", [PAPER, SLATE, CREAM, SAND]), "work/banyan-team.webp")
    save(system_abstract((1200, 1200), "banyan-roots"), "work/banyan-roots.webp")

    save(board_abstract((1600, 900), "stax-hero"), "work/jobstax-hero.webp")
    save(board_abstract((1400, 900), "stax-board"), "work/jobstax-board.webp")
    save(typographic((1400, 900), "Resume versions", "One board, many drafts"), "work/jobstax-resume.webp")

    save(abstract_sized((1600, 900), "sentient-hero", [DARK, INK, SLATE, CREAM], dark=True), "work/sentient-hero.webp")
    save(abstract_sized((1200, 800), "sentient-1", [DARK, SLATE, GOLD, CREAM], dark=True), "work/sentient-work-1.webp")
    save(abstract_sized((1200, 1500), "sentient-2", [INK, DARK, LILAC, CREAM], dark=True), "work/sentient-work-2.webp")

    save(abstract_sized((1600, 900), "rule-trigger", [PAPER, CREAM, MOSS, SAND]), "projects/rule-builder-trigger.webp")

    save(map_abstract((1600, 900), "posture-hero"), "projects/posture-hero.webp")
    save(map_abstract((1400, 900), "posture-map"), "projects/posture-map.webp")
    save(abstract_sized((1400, 900), "posture-detail", [PAPER, SLATE, SAND, CREAM]), "projects/posture-detail.webp")

    save(system_abstract((1600, 900), "roots-hero"), "projects/roots-hero.webp")
    save(system_abstract((1400, 900), "roots-tokens"), "projects/roots-tokens.webp")
    save(typographic((1400, 900), "Components", "Figma library + React"), "projects/roots-components.webp")

    print("Done.")


if __name__ == "__main__":
    main()
