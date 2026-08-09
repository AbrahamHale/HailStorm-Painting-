#!/bin/sh
# Swap the phone number everywhere on the site, in one shot.
#
#   Usage:  tools/set-phone.sh "(218) 555-0123"
#
# Updates the constants in js/site.js AND every static fallback baked
# into the HTML (tel: links, schema markup, visible text).
set -e
cd "$(dirname "$0")/.."

NEW_DISPLAY="$1"
[ -n "$NEW_DISPLAY" ] || { echo 'Usage: tools/set-phone.sh "(218) 555-0123"'; exit 1; }
NEW_TEL="+1$(echo "$NEW_DISPLAY" | tr -cd '0-9')"

OLD_DISPLAY=$(sed -n 's/^var PHONE_DISPLAY = "\(.*\)";/\1/p' js/site.js)
OLD_TEL=$(sed -n 's/^var PHONE_TEL = "\(.*\)";/\1/p' js/site.js)
[ -n "$OLD_DISPLAY" ] || { echo "Could not read current number from js/site.js"; exit 1; }

for f in *.html js/site.js; do
  sed -i '' -e "s/$OLD_DISPLAY/$NEW_DISPLAY/g" -e "s/$OLD_TEL/$NEW_TEL/g" "$f"
done
echo "Phone number changed: $OLD_DISPLAY -> $NEW_DISPLAY ($NEW_TEL)"
