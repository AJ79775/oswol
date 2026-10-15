#!/usr/bin/env bash
# Download the Kokoro-82M ONNX voice model (Apache-2.0) used for the fixed narrator voice.
set -euo pipefail
DIR="${1:-/opt/oswol-video/models}"
BASE="https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0"
mkdir -p "$DIR"
for f in kokoro-v1.0.onnx voices-v1.0.bin; do
  if [ -s "$DIR/$f" ]; then echo "✔ $f already present"; continue; fi
  echo "↓ $f"
  curl -fL --retry 4 --retry-delay 3 -o "$DIR/$f.part" "$BASE/$f"
  mv "$DIR/$f.part" "$DIR/$f"
done
ls -la "$DIR"
