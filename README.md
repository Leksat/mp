# 7×8

Wordless multiplication table trainer, built as an installable PWA for phones.

Live: https://leksat.github.io/mp/

## How it works

A parent holds the phone, the kid says the answer aloud.

- The app opens on the table screen, so the kid sees the overall progress first.
- 100 facts, 1-10. `7 × 8` and `8 × 7` are tracked separately.
- A fact is learned after 3 consecutive ✓. One ✗ resets the streak to zero.
- The answer auto-reveals after 3 seconds, or immediately when the card is tapped. The ✓ / ✗
  buttons are live from the moment the card appears.
- Card selection is weighted: recently missed facts come back sooner, roughly every fifth card is
  a learned fact due for review, and no fact repeats within 5 cards.
- A session is a fixed number of cards, 20 by default. A bar on the far edge from the ✓ / ✗
  buttons fills with every answer, ✓ or ✗ alike. The last answer of a session switches to the
  table screen; going back to the cards tab starts a new one. The count lives in memory only.
- Finishing a session sets off a short emoji firework. One emoji is drawn at random per session
  and every spark in the burst is that same emoji, so the kid gets to wonder which one is next.
- The table screen shows one number: streak points earned as a percentage, floored. Every fact is
  worth 3 points, so the base is 300 and each ✓ moves the number, not just the third one.
- The table screen colours every cell grey (untouched), then amber → yellow → lime → green as the
  streak climbs to learned. Tap a cell to see its streak or reset it.
- The settings screen moves the ✓ / ✗ buttons above or below the card, sets the session length
  with a stepper (minimum 1, no maximum), and clears all progress after a confirmation.

Progress and settings live in `localStorage` and are written on every change.

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
