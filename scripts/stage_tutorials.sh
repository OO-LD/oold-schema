#!/bin/sh
# Puts the tutorial videos and beat stills where the docs build can serve them,
# and writes the manifest the slideshow reads.
#
# Same contract as scripts/stage_video.sh: prefers a local render, falls back to
# the release, and nothing is committed. docs/assets/tutorials/ is gitignored.
#
# A missing episode is not an error. The page renders the episodes it has.
set -eu

RELEASE="tutorials-latest"
dest="docs/assets/tutorials"
src="media/tutorials"
mkdir -p "$dest"

episodes="ep1 ep2 ep3 ep4 ep5"
have=""

for ep in $episodes; do
  for theme in light dark; do
    mp4="$ep-$theme.mp4"
    if [ -f "$src/$ep/out/$mp4" ]; then
      cp "$src/$ep/out/$mp4" "$dest/"
    elif [ ! -f "$dest/$mp4" ]; then
      gh release download "$RELEASE" --pattern "$mp4" --dir "$dest" >/dev/null 2>&1 || true
    fi

    stills="$ep-$theme-stills.zip"
    if [ -d "$src/$ep/out/stills-$theme" ]; then
      mkdir -p "$dest/$ep/$theme"
      cp "$src/$ep/out/stills-$theme"/*.png "$dest/$ep/$theme/" 2>/dev/null || true
    elif [ ! -d "$dest/$ep/$theme" ]; then
      if gh release download "$RELEASE" --pattern "$stills" --dir "$dest" >/dev/null 2>&1; then
        mkdir -p "$dest/$ep/$theme"
        unzip -qo "$dest/$stills" -d "$dest/$ep/$theme"
        rm -f "$dest/$stills"
      fi
    fi
  done

  if [ -f "$dest/$ep-light.mp4" ]; then
    have="$have $ep"
  fi
done

# The slideshow needs the ordered beat list per episode. beats.json is the
# source of that order; it lives with the episode, not with the built assets.
python - "$dest" "$src" $have <<'PY'
import json, os, sys
dest, src, eps = sys.argv[1], sys.argv[2], sys.argv[3:]
out = {}
for ep in eps:
    beats_path = os.path.join(src, ep, "src", "beats.json")
    names = []
    if os.path.exists(beats_path):
        with open(beats_path, encoding="utf-8") as fh:
            names = [b["name"] for b in json.load(fh)]
    else:
        d = os.path.join(dest, ep, "light")
        if os.path.isdir(d):
            names = sorted(f[:-4] for f in os.listdir(d) if f.endswith(".png"))
    out[ep] = names
with open(os.path.join(dest, "manifest.json"), "w", encoding="utf-8") as fh:
    json.dump(out, fh, indent=2)
print("tutorial manifest:", ", ".join(f"{k} {len(v)} beats" for k, v in out.items()) or "empty")
PY

if [ -z "$have" ]; then
  echo "no tutorial videos; run 'cd media/tutorials && node scripts/render-series.mjs' or the page omits them"
else
  echo "staged tutorials:$have"
fi
