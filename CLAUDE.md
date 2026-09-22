# 7×8

Wordless multiplication table trainer, built as an installable PWA for phones.

Live: https://leksat.github.io/mp/

@README.md

## How it works

A parent holds the phone, the kid says the answer aloud.

- The app opens on the table screen, so the kid sees the overall progress first.
- 100 facts, 1-10. `7 × 8` and `8 × 7` are tracked separately.
- The answer auto-reveals after 3 seconds, or immediately when the card is tapped. The ✓ / ✗
  buttons are live from the moment the card appears.

### Learning algorithm

The number of ✓ a fact needs is not the same for every fact.

- Every ✓ is worth one step. When the button is tapped never matters — the parent holds the phone,
  and their timing says nothing about the kid.
- Reps to learned depend on the fact: 1 for `×1` and `×10` (rules, not memories), 2 for ties,
  `×2`, `×5` and `×9` (pattern-supported), 5 for the hard core (`3×7 3×8 4×6 4×7 4×8 6×7 6×8 7×8`
  and their twins), 3 for the rest.
- The requirement adapts: every 3 misses on a fact permanently add a third of its base requirement,
  up to 8. The hardcoded tiers are only a cold start; the kid's own errors decide the rest.
- A ✗ drops the streak by a third of the requirement, at least 1, rather than to zero. Penalties
  stay proportional to the fact: one slip on `1 × 6` costs its single rep and is won back with the
  next ✓, while `7 × 8` goes from 5/5 to 3/6.
- A ✓ gives the twin fact half a step, but only once the twin is already in progress.
- Learned facts come back on a Leitner schedule of 1, 3, 7, 16 and 35 days, one box up per correct
  review, one box down on a ✗ — a right answer always buys distance from the fact.
- A learned fact is served only on or after its due date. When there is nothing left to drill and
  nothing due, the card comes from the quarter of the table due soonest, least recently seen
  first, so an idle day still varies.
- At most 7 facts are in progress at a time; the rest stay untouched until a slot frees up. New
  facts are introduced easiest first.
- Card selection is weighted: recently missed facts come back sooner, roughly every fifth card is
  a learned fact that is due, no fact repeats within 5 cards, and confusable facts (sharing a
  factor, or with products within 2) stay apart within 2 cards.
- A session is a fixed number of cards, 20 by default. A bar on the far edge from the ✓ / ✗
  buttons fills with every answer, ✓ or ✗ alike. The last answer of a session switches to the
  table screen; going back to the cards tab starts a new one. The count lives in memory only.
- Finishing a session sets off a short emoji firework. One emoji is drawn at random per session
  and every spark in the burst is that same emoji, so the kid gets to wonder which one is next.
- The table screen shows one number: streak points earned as a percentage, floored. A fact is
  worth its cold-start requirement, so the denominator never moves and each ✓ moves the number,
  not just the last one.
- The table screen colours every cell grey (untouched), then amber → yellow → lime → green as the
  streak climbs towards that fact's own requirement. Tap a cell to see its streak or reset it.
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
npm test        # vitest, covers the whole learning algorithm
npm run build
npm run icons   # regenerates public/*.png from scripts/generate-icons.mjs
```

Pushing to `main` deploys to GitHub Pages.
