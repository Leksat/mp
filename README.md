# 7×8

Wordless multiplication table trainer, built as an installable PWA for phones.

Live: https://leksat.github.io/mp/

## How it works

A parent holds the phone, the kid says the answer aloud.

- 100 facts, 1-10. `7 × 8` and `8 × 7` are tracked separately.
- A fact is learned after 3 consecutive ✓. One ✗ resets the streak to zero.
- The answer auto-reveals after 3 seconds, or immediately when the card is tapped. The ✓ / ✗
  buttons are live from the moment the card appears.
- Card selection is weighted: recently missed facts come back sooner, roughly every fifth card is
  a learned fact due for review, and no fact repeats within 5 cards.
- The table screen colours every cell grey (untouched), amber (learning) or green (learned). Tap a
  cell to see its streak or reset it.

Progress lives in `localStorage` and is written on every press.

## iOS

Add it to the home screen. Safari wipes storage for sites not visited for 7 days; installed web
apps are exempt.

## Development

```sh
npm install
npm run dev
npm run build
npm run icons   # regenerates public/*.png from scripts/generate-icons.mjs
```

Pushing to `main` deploys to GitHub Pages.
