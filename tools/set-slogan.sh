#!/bin/sh
# Swap the slogan everywhere on the site, in one shot.
#
#   Usage:  tools/set-slogan.sh "The new slogan here."
#
# Updates the constant in js/site.js AND every static occurrence baked
# into the HTML (hero, footer, meta/OG tags, schema markup).
set -e
cd "$(dirname "$0")/.."

NEW="$1"
[ -n "$NEW" ] || { echo 'Usage: tools/set-slogan.sh "The new slogan here."'; exit 1; }

OLD=$(sed -n 's/^var SLOGAN = "\(.*\)";/\1/p' js/site.js)
[ -n "$OLD" ] || { echo "Could not read current slogan from js/site.js"; exit 1; }
OLD_NOPERIOD=$(echo "$OLD" | sed 's/\.$//')
NEW_NOPERIOD=$(echo "$NEW" | sed 's/\.$//')

for f in *.html js/site.js; do
  sed -i '' -e "s/$OLD/$NEW/g" -e "s/$OLD_NOPERIOD/$NEW_NOPERIOD/g" "$f"
done
echo "Slogan changed: $OLD -> $NEW"
