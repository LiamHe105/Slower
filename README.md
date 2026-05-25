# Slower

Slow your world,not your goals.

Slower is a minimalist focus assistant for macOS. It combines a focus timer, task list, discipline calendar, daily summaries, and lightweight focus statistics into a calm native app.

## Current Features

- Focus timer with adjustable focus and break duration
- Focus modes for study, work, reading, creation, light focus, and custom modes
- Task list with today's goal and target focus duration
- Discipline calendar with daily focus intensity
- Date detail panel with focus history and editable daily notes
- Completion bookmark with motivational feedback
- Local-first data storage, no login or sync required
- Theme switching from the macOS menu

## Native App

The macOS app source lives in `native/`.

Build:

```bash
cd native
swift build --disable-sandbox --scratch-path .build
```

Package:

```bash
./script/build_and_run.sh --verify
```

The packaged app will be generated at:

```text
dist/Slower.app
```

## Project Notes

This project started as a vibe coding prototype and is being iterated toward a native, open-source focus assistant.

Author: [@LiamHe](https://github.com/LiamHe105)

Support: [爱发电](https://ifdian.net/a/liamhe)
