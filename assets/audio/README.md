# Background music

The site plays **one** file:

```
assets/audio/music.mp3
```

A `music.mp3` is already included: an original, soft piano piece (about 1 min 50 s, loops) that was generated specifically for this site. It contains no samples or third-party music, so it's safe to publish.

You can keep it, or replace it with your own track using the steps below. If the file is ever missing, everything still works — the music button just shows a small friendly message.

## What to choose

Soft instrumental piano with a little ambient texture works best. Avoid lyrics, drums, or dramatic orchestral swells — the music should sit quietly behind the words.

## Where to get music you're allowed to use

Do **not** upload a commercial song (Spotify, YouTube music videos, etc.) unless you own the rights. Good places for free, legally usable tracks:

- **Pixabay Music** (pixabay.com/music) — search "soft piano" or "romantic piano". Free under the Pixabay Content License, no attribution required.
- **Free Music Archive** (freemusicarchive.org) — filter for Creative Commons licences such as CC BY. If the licence says "BY", add the artist's name to the main README as credit.
- **YouTube Audio Library** (studio.youtube.com → Audio library) — check each track's licence notes.

Always read the licence on the track's page before using it.

## How to replace it

1. Download the track as an **.mp3** (MP3 plays on every phone, including iPhones).
2. Rename it to exactly `music.mp3` — all lowercase.
3. On GitHub, open the `assets/audio` folder → **Add file → Upload files** → drop your `music.mp3` in (it replaces the old one) → **Commit changes**.

Tips:
- Keep it under ~5 MB so it loads quickly on mobile data (a 2–3 minute track at 128 kbps is perfect). It loops automatically.
- Want a different name or folder? Change `musicFile` in `content.js` (section 1, SETTINGS).
- Music never starts on its own: it only begins after she taps "Open my little surprise", and she can turn it off with the ♪ button. Her choice is remembered.
