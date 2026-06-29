#!/usr/bin/env python3
"""
collect_fastq.py

Recursively searches every subfolder (except the output folder) for files
matching the pattern *raw_<number>.fastq.gz, then copies them into a single
'FASTQ_Renamed/' folder — renaming each file by replacing raw_<N> with _R<N>.

Example:
    S5.P1.COI1.raw_2.fastq.gz  →  S5.P1.COI1_R2.fastq.gz

No decompression or recompression — pure byte-for-byte copy.

CREATION: Rafael Torres, 2026 (updated)
"""

import os
import re
import shutil

# ── Configuration ─────────────────────────────────────────────────────────────
OUTPUT_FOLDER = "FASTQ_Renamed"   # Destination folder
SKIP_FOLDERS  = {OUTPUT_FOLDER}   # Never recurse into these (case-sensitive)
# ─────────────────────────────────────────────────────────────────────────────

# Matches any filename containing raw_<digits>.fastq.gz
RAW_PATTERN = re.compile(r"^(.+?)\.raw_(\d+)(\.fastq\.gz)$", re.IGNORECASE)


def fmt_size(path: str) -> str:
    """Return a human-readable file size string."""
    size = os.path.getsize(path)
    for unit in ("B", "KB", "MB", "GB"):
        if size < 1024:
            return f"{size:.1f} {unit}"
        size /= 1024
    return f"{size:.1f} TB"


def collect(base_dir: str = ".") -> None:
    base_dir    = os.path.abspath(base_dir)
    output_dir  = os.path.join(base_dir, OUTPUT_FOLDER)
    os.makedirs(output_dir, exist_ok=True)
    print(f"Base directory : {base_dir}")
    print(f"Output folder  : {output_dir}\n")

    copied  = 0
    skipped = 0
    clashes = 0

    # Walk the entire directory tree
    for dirpath, dirnames, filenames in os.walk(base_dir):
        # ── Prune skip-list folders in-place so os.walk doesn't enter them ──
        dirnames[:] = [
            d for d in dirnames
            if d not in SKIP_FOLDERS
        ]

        for filename in sorted(filenames):
            m = RAW_PATTERN.match(filename)
            if not m:
                continue  # Not a raw_N.fastq.gz file

            prefix, number, ext = m.group(1), m.group(2), m.group(3)
            new_name = f"{prefix}_R{number}{ext}"

            src = os.path.join(dirpath, filename)
            dst = os.path.join(output_dir, new_name)

            # Relative path shown in output for readability
            rel_src = os.path.relpath(src, base_dir)

            # Handle name clashes: prefix with the immediate parent folder name
            if os.path.exists(dst):
                parent = os.path.basename(dirpath)
                new_name = f"{parent}__{new_name}"
                dst = os.path.join(output_dir, new_name)
                print(f"  ⚠  Name clash — renaming to: {new_name}")
                clashes += 1

            shutil.copy2(src, dst)  # byte-for-byte copy, preserves metadata

            src_size = fmt_size(src)
            dst_size = fmt_size(dst)
            size_ok  = os.path.getsize(src) == os.path.getsize(dst)
            mark     = "✓" if size_ok else "✗ SIZE MISMATCH"

            print(f"  {mark}  {rel_src}")
            print(f"       →  {new_name}  ({src_size})")
            if not size_ok:
                print(f"       !! Source {src_size} vs destination {dst_size}")
            copied += 1

    print(f"\n{'─'*60}")
    if copied == 0:
        print("No matching files found (pattern: *raw_<N>.fastq.gz).")
    else:
        clash_note = f", {clashes} clash(es) renamed" if clashes else ""
        print(f"Done — {copied} file(s) copied{clash_note}, {skipped} skipped.")
        print(f"All renamed files are in: {output_dir}")


if __name__ == "__main__":
    # Place this script in the parent folder that contains your subfolders, or
    # pass an absolute path, e.g.: collect(r"/home/user/sequencing_run")
    collect(".")