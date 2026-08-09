#!/usr/bin/env python3
"""Prepare site photos and rebuild the gallery manifest.

Run from the repo root any time you add photos:

    python3 tools/prep_photos.py

What it does, for every image under images/ (except images/logo/ and images/extras/):
  1. Converts HEIC to JPEG (uses macOS `sips`).
  2. Resizes so the long edge is at most 1600px.
  3. Re-saves as JPEG quality 80 with ALL metadata stripped -- EXIF, GPS,
     everything. No customer addresses leak through photo metadata.
  4. Rebuilds images.json, which the site reads to build the galleries.

Before/after pairs: name two files with the same base plus -before / -after
(e.g. farmhouse-before.jpg + farmhouse-after.jpg) and the gallery renders
them as a draggable slider automatically.

Alt text comes from the filename (dashes become spaces) plus the folder,
unless there is an entry in tools/alt_text.json -- edit that file to write
better descriptions.
"""

import json
import os
import re
import subprocess
import sys
import tempfile

from PIL import Image, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMAGES = os.path.join(ROOT, "images")
MANIFEST = os.path.join(ROOT, "images.json")
ALT_FILE = os.path.join(ROOT, "tools", "alt_text.json")

SKIP_DIRS = {"logo", "extras"}
MAX_EDGE = 1600
QUALITY = 80

FOLDER_LABELS = {
    "exterior-residential": "Exterior house painting",
    "exterior-commercial": "Commercial exterior painting",
    "interior-residential": "Interior painting",
    "interior-commercial": "Commercial interior painting",
    "furniture": "Furniture refinishing",
}


def load_image(path):
    """Open an image, going through sips for HEIC."""
    if path.lower().endswith((".heic", ".heif")):
        tmp = tempfile.NamedTemporaryFile(suffix=".png", delete=False)
        tmp.close()
        subprocess.run(
            ["sips", "-s", "format", "png", path, "--out", tmp.name],
            check=True, capture_output=True,
        )
        im = Image.open(tmp.name)
        im.load()
        os.unlink(tmp.name)
        return im
    return Image.open(path)


def needs_work(path):
    if not path.lower().endswith((".jpg", ".jpeg")):
        return True
    im = Image.open(path)
    oversized = max(im.size) > MAX_EDGE
    has_meta = bool(im.getexif())
    return oversized or has_meta


def process(path):
    im = load_image(path)
    im = ImageOps.exif_transpose(im)  # bake in orientation before metadata is dropped
    if im.mode != "RGB":
        im = im.convert("RGB")
    im.thumbnail((MAX_EDGE, MAX_EDGE), Image.LANCZOS)
    out = re.sub(r"\.(heic|heif|jpeg|jpg|png)$", "", path, flags=re.I) + ".jpg"
    im.save(out, "JPEG", quality=QUALITY, optimize=True, progressive=True)
    # careful on macOS: the filesystem is case-insensitive, so photo.JPG and
    # photo.jpg are the same file -- only delete a genuinely different original
    if out != path and os.path.exists(path) and not os.path.samefile(path, out):
        os.unlink(path)
    elif out != path:
        # same file, name differs only by case (.JPG vs .jpg): rename in two hops
        tmp = out + ".casefix"
        os.rename(path, tmp)
        os.rename(tmp, out)
    return out


def auto_alt(folder, base):
    words = base.replace("-", " ").replace("_", " ")
    words = re.sub(r"\b(before|after)$", "", words).strip()
    label = FOLDER_LABELS.get(folder)
    if label:
        return f"{label} — {words}"
    return words


def build_thumbs():
    """640px thumbnails for gallery grids and cards -> images/thumbs/<folder>/."""
    made = 0
    for folder in sorted(os.listdir(IMAGES)):
        d = os.path.join(IMAGES, folder)
        if not os.path.isdir(d) or folder in SKIP_DIRS or folder == "thumbs":
            continue
        out_dir = os.path.join(IMAGES, "thumbs", folder)
        os.makedirs(out_dir, exist_ok=True)
        for f in sorted(os.listdir(d)):
            if not f.lower().endswith((".jpg", ".jpeg", ".png")):
                continue
            src = os.path.join(d, f)
            dst = os.path.join(out_dir, f)
            if os.path.exists(dst) and os.path.getmtime(dst) >= os.path.getmtime(src):
                continue
            im = Image.open(src)
            if im.mode != "RGB":
                im = im.convert("RGB")
            im.thumbnail((640, 640), Image.LANCZOS)
            im.save(dst, "JPEG", quality=75, optimize=True, progressive=True)
            made += 1
    return made


def build_manifest():
    overrides = {}
    if os.path.exists(ALT_FILE):
        with open(ALT_FILE) as f:
            overrides = json.load(f)

    entries = []
    for folder in sorted(os.listdir(IMAGES)):
        d = os.path.join(IMAGES, folder)
        if not os.path.isdir(d) or folder in SKIP_DIRS:
            continue
        files = sorted(
            f for f in os.listdir(d)
            if f.lower().endswith((".jpg", ".jpeg", ".png"))
        )
        bases = {re.sub(r"\.(jpe?g|png)$", "", f, flags=re.I) for f in files}
        for f in files:
            base = re.sub(r"\.(jpe?g|png)$", "", f, flags=re.I)
            role, pair = "standalone", None
            if base.endswith("-before") and base[:-7] + "-after" in bases:
                role, pair = "before", base[:-7]
            elif base.endswith("-after") and base[:-6] + "-before" in bases:
                role, pair = "after", base[:-6]
            key = f"{folder}/{f}"
            entries.append({
                "folder": folder,
                "file": f,
                "role": role,
                "pair": pair,
                "alt": overrides.get(key) or auto_alt(folder, base),
            })

    with open(MANIFEST, "w") as f:
        json.dump({"images": entries}, f, indent=1)
    return entries


def main():
    converted = 0
    for folder in sorted(os.listdir(IMAGES)):
        d = os.path.join(IMAGES, folder)
        if not os.path.isdir(d) or folder == "logo":
            continue
        for name in sorted(os.listdir(d)):
            path = os.path.join(d, name)
            if not name.lower().endswith((".jpg", ".jpeg", ".png", ".heic", ".heif")):
                continue
            if needs_work(path):
                out = process(path)
                converted += 1
                print(f"  processed {os.path.relpath(out, ROOT)}")
    thumbs = build_thumbs()
    entries = build_manifest()
    pairs = sum(1 for e in entries if e["role"] == "before")
    print(f"{converted} image(s) processed, {thumbs} thumb(s) made, "
          f"{len(entries)} in manifest, {pairs} before/after pair(s).")


if __name__ == "__main__":
    main()
