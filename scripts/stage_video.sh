#!/bin/sh
# Puts the explainer cuts where the docs build can serve them.
#
# Prefers a local render so `make docs` shows what you just changed; otherwise
# pulls the published cut from the latest release. Neither is committed:
# docs/assets/video/ is gitignored, like docs/meta/ and docs/schemas/.
#
# A missing cut is not an error. The landing page simply omits that video.
set -eu

# The cuts live on one reusable, unversioned release: the video carries no
# version number, so there is nothing to pin a tag to.
RELEASE="explainer-latest"
dest="docs/assets/video"
mkdir -p "$dest"

for cut in oold-explainer.mp4 oold-explainer-dark.mp4; do
  if [ -f "media/explainer/out/$cut" ]; then
    cp "media/explainer/out/$cut" "$dest/"
    echo "staged $cut (local render)"
  elif [ -f "$dest/$cut" ]; then
    echo "staged $cut (already present)"
  elif gh release download "$RELEASE" --pattern "$cut" --dir "$dest" >/dev/null 2>&1; then
    echo "staged $cut (from the $RELEASE release)"
  else
    echo "no $cut; run 'cd media/explainer && npm run render' or the page omits it"
  fi
done
