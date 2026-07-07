#!/usr/bin/env bash

set -e

# Configuration
SRC_DIR="./images"
DIST_DIR="./thumbnails"
THUMB_SIZE="150x150"

if ! command -v magick &> /dev/null; then
    echo "Error: ImageMagick is not installed." >&2
    exit 1
fi

if [ ! -d "$SRC_DIR" ]; then
    echo "Error: Source directory '$SRC_DIR' does not exist." >&2
    exit 1
fi

mkdir -p "$DIST_DIR"

echo "Source: $SRC_DIR"
echo "Destination: $DIST_DIR"

shopt -s nullglob nocaseglob
for img in "$SRC_DIR"/*.{jpg,jpeg,png,webp,tiff}; do
    filename=$(basename "$img")
    
    echo "Processing: $filename"
    magick "$img" -define jpeg:size=300x300 -thumbnail "$THUMB_SIZE" "$DIST_DIR/$filename"
done

echo "Thumbnails generated in '$DIST_DIR'."
