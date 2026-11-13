# Iron Room — Acoustic Drum Studio

A browser-based sampled acoustic drum instrument and song builder inspired by professional drum-production workflows. Independent software; not affiliated with GetGood Drums or Adam “Nolly” Getgood.

## Run

No build step or package installation is needed. Serve `dist` with any static HTTP server:

```sh
python3 -m http.server 8080 --directory dist
```

Open `http://localhost:8080`. ES modules and sample fetching require HTTP; opening `index.html` with `file://` is not supported. HTTPS or localhost is required for Web MIDI. Current Chrome/Edge offer the broadest MIDI support. Audio, arranging and exports use standard Web Audio and work without MIDI hardware. The application has no account, telemetry, paid dependency or server-side audio service.

## Included

- 201 real acoustic sample recordings, approximately 17.3 MB encoded, self-hosted.
- 17 articulation lanes on 11 kit-piece channels.
- Recorded velocity layers (up to four for snares), three alternate takes per layer, hi-hat choke groups, 128 live voices.
- Two recorded kick variants; two snares; snare cross-stick and wires-off; rack and floor tom; closed, foot, open and seven intermediate hat positions; three crash models; two ride models and bells; two chinas; splash; cowbell.
- Clickable overhead kit, computer-key performance and soft hits with Shift.
- 2,375 original pattern arrangements: 1,497 grooves, 802 fills, 18 intros and 58 endings. Fifty new style collections plus the original 36 starter patterns; 54 searchable style labels in 12 broader families. Detailed catalogue: [GROOVE_LIBRARY.md](GROOVE_LIBRARY.md).
- 1–64 bar step editor with 16th-note placement, 1–127 velocity, note probability and fractional-step offsets.
- Nine meters: 4/4, 3/4, 5/4, 5/8, 6/8, 7/8, 9/8, 11/8 and 12/8; meter-aware grid, transport and metronome; pattern duplication, clearing, undo/redo.
- Song clips, drag/reorder, repeats, pattern/song playback, loop, BPM, tap tempo, metronome, swing and timing/velocity variation.
- Per-channel level, stereo pan, mute, solo, polarity, tuning ±12 semitones, decay, high-pass filter, three-band EQ, compression and room send.
- Master low/high EQ, compression, parallel compression, convolution room return, output gain and safety compressor. Six factory mix presets.
- Web MIDI input, editable note mapping, MIDI learn, CC4 hi-hat openness, polyphonic/channel aftertouch cymbal choking and live overdubbing.
- Standard MIDI format 0/1 import (musical ticks); velocity/timing-preserving format 0 export.
- Offline 44.1 kHz / 16-bit stereo WAV rendering and aligned dry post-channel / pre-master stem ZIP export.
- WAV/FLAC/MP3 sample import, user velocity-layer/alternate-hit groups, IndexedDB persistence. Up to 80 custom files / 64 MB.
- Browser autosave and portable JSON projects with embedded custom samples.
- Responsive layout, accessible controls, reduced library/editor scroll regions and keyboard shortcuts.

## Quick start

1. Press Play. The first use downloads and decodes the selected samples.
2. Audition a groove in the left library. Click its name to load it into the editor. Auditioning does not add patterns to the project. ＋ adds it to the song.
3. Use the editor to add/remove steps. Right-click, Shift-click or long-press a hit to edit velocity, probability and microtiming.
4. Drag clips to reorder and change each repeat count. Select **Song** for arrangement playback.
5. Shape each piece in the right inspector; choose **Mixer** for channel balances and master effects.
6. Export audio, stems, MIDI or a portable project.

The metronome follows quarters in simple x/4 meters, dotted quarters in 6/8, 9/8 and 12/8, and eighths with grouping accents in odd x/8 meters. The swing setting delays alternate 16ths in straight-feel patterns. Shuffle/swing/triplet library arrangements contain explicit note offsets and bypass extra straight-grid swing. Probability is applied when humanized audio export is enabled; a straight export prints every programmed note. Stem rendering shares one generated performance across all channels, ensuring identical probability and timing decisions. Stems retain channel mute/solo decisions, exclude room and master processing, and include aligned tails.

## Performance keys

| Key | Instrument |
| --- | --- |
| B | Kick |
| F / D / G | Snare / cross-stick / wires off |
| H / J / K / L | Closed / intermediate / open / pedal hi-hat |
| R / T | Rack / floor tom |
| Q / W | Left / right crash |
| E / Y | Ride / ride bell |
| U / I / O | China / splash / cowbell |
| X | Choke active cymbals |
| Space | Play / stop |
| Shift + instrument key | Soft hit |
| Ctrl/⌘ Z | Undo |
| Ctrl/⌘ Shift Z | Redo |

## Custom samples

Select an articulation, choose **Load your own samples**, and choose one or more audio files. A single file becomes a one-shot. Name multiple files `snare_v40_rr1.wav`, `snare_v40_rr2.wav`, `snare_v90_rr1.wav`, `snare_v127_rr1.wav` to create layers. The `v` value is an upper velocity boundary. Files in the same layer cycle as round robins; the highest layer covers through velocity 127. Importing replaces custom recordings for that articulation. Custom imports remain local and are embedded in exported project JSON.

## Scope compared with GGD

This is a substantial working web instrument, not full feature parity with any GetGood Drums product. GGD's commercial libraries use different recordings, much larger instrument/groove collections and proprietary playback features. This edition does not provide:

- Authentic individually recorded close, bottom, overhead and room microphone stems, or adjustable recorded microphone bleed. Salamander assets here are stereo overhead recordings; the added room is a synthetic convolution impulse, not a recorded room mic.
- GGD's Fluid+ engine, its sample content, its grooves, its producer presets, or phase-matched microphone recordings.
- Native VST3/AU/AAX/Kontakt integration, DAW multi-output audio buses, host transport sync or tempo maps.
- Direct-from-disk streaming, microphone-specific envelope/EQ, articulations not present in the free source, or the complete original Salamander round-robin pool (the web edition selects up to three takes per layer).
- Mixed-signature MIDI tempo maps: MIDI export writes the current pattern's initial signature, though the internal song player can traverse clips with differing signatures.
- Export durations above four minutes in one render. Browsers hold decoded samples and offline rendering in RAM.

Live playback pauses when the tab is hidden because background timer throttling can disrupt timing. Hardware MIDI and cross-browser/device latency need testing on the target equipment. MP3 encoding is the web-delivery tradeoff; use lossless custom recordings when necessary. All playback is sample-based: there is no synthetic drum fallback disguised as recordings.

## Audio architecture

`data.js` defines instruments, sample groups and defaults. `grooves.js` defines the extensive original groove catalogue from deterministic style-specific recipes, and `groove-browser.js` implements searchable/sortable filters and pagination. `engine.js` handles fetching/decoding, velocity selection, round robins, per-voice envelopes, choke groups and Web Audio routing. `app.js` binds the kit, sequencer, scheduler, arrangement, persistence, MIDI hardware and offline render UI. `midi.js` implements SMF reading/writing, WAV encoding, downloads and a dependency-free store-only ZIP writer.

Each sample voice passes through channel high-pass filtering, three-band EQ, compression, pan and level. The channel fader feeds three paths: master EQ/bus compression, parallel compression, and a convolution room send/return. Those paths combine at master gain and pass through a safety compressor and output analyser.

The bundled samples load in six concurrent requests. Audio uses 25 ms scheduler wakeups and a 130 ms scheduling horizon; live pad/MIDI hits play immediately once the kit is loaded. Rendered stem decisions use a deterministic shared variation sequence.

## Sample provenance and licence

Source: [Salamander Drumkit, Alexander Holm](https://github.com/studiorack/salamander-drumkit), original author also known as Rytmenpinne. Sample licence: **Creative Commons Attribution-ShareAlike 3.0 Unported**. Full upstream licence and readme are included in `dist/SAMPLE-LICENSE` and `dist/SAMPLE-README.md`. The upstream author clarifies that share-alike applies to altered samples/sample libraries, while produced music may be licensed independently.

This web edition selects three takes per velocity group, trims leading silence to retain a short pre-transient pad, and encodes MP3 using FFmpeg/libmp3lame quality 2. One silent source file (`kick_OH_P_1`) was excluded and replaced by the fourth take. Modified samples remain CC BY-SA 3.0, with credit and source links in the application and this readme. No GGD samples or other commercial recordings are included. Application code and original groove patterns: MIT (see LICENSE). Google Fonts are optional visual resources with local font fallbacks; no runtime JS dependencies are fetched from a CDN.

## Validation

- JavaScript syntax checks on all modules.
- All 2,375 patterns round-tripped through MIDI export/import: 103,835 events retained with velocities, exact tick timing, tempo and signature. All newly generated rhythmic fingerprints are unique; the original 36 starter entries are retained for compatibility. Run `node tests/grooves.test.mjs` for event bounds, uniqueness, family coverage, meter coverage and browser-filter checks.
- ZIP headers, central directory, file bytes and CRC checked using Python's ZIP parser.
- Browser playback loaded the selected kit and produced a moving transport and non-zero master output.
- Browser-generated stereo WAV inspected: stereo, 44.1 kHz, valid PCM, non-silent and peak below full scale.
- Browser-generated stem ZIP inspected: valid archive, aligned durations, all active channel stems non-silent.
- Source sample decode/peak screening caught one silent upstream file; all 201 delivered MP3s checked for non-zero audio.

Real electronic-drum hardware and mobile audio latency have not been tested in this environment.

## Expanded groove browser

Filter by style/family, type, meter, feel and tempo range. Search combines words from names, styles and tags (for example `metal triplet`, `neo-soul ghost`, `songo ride`). Star favourites for browser-local recall. Results are paginated in groups of 40. Click ▶ to audition without changing your project, click the pattern name to load it into the editor, or use ＋/drag to add it to the arrangement. The optional suggested-BPM switch affects audition playback only. Download the current filtered result as a MIDI pack, or use the complete prebuilt `dist/iron-room-grooves.zip`.

These are original programmed arrangements generated from authored style-specific rhythmic recipes. They are not recordings of human performances or copied commercial MIDI grooves. Velocity-only variants do not increase the generated catalogue count. World styles are adapted for this acoustic drum kit; the kit does not contain authentic dedicated percussion for every tradition.

## DAW-style drum editor

The **Groove editor** now edits the same pattern events used by song clips, MIDI export, audio rendering and portable projects. Existing grooves remain editable.

- **Draw / Select / Erase:** click the grid to add a hit; drag existing hits to move them horizontally or between articulation lanes. Select mode supports dragging a selection box. Shift-click adds/removes selections. Alt-drag duplicates the selected hits.
- **Timing:** straight grids from quarter notes to 64ths, eighth/sixteenth/32nd triplets, and snapping off. Grid choice never quantizes existing notes automatically. Quantize applies only to selected hits. Arrow keys nudge horizontally by the grid; Shift-arrows use 1/24 of a sixteenth. Up/down moves hits between articulations.
- **Velocity:** click an articulation label to audition it and show its velocity bars. Selecting hits shows their velocities across lanes. Drag a velocity bar to set the selection's velocity, or use the numeric inspector. Chance applies to selected hits; Position moves the group while preserving spacing.
- **Ghost / Flam / Roll ×4:** Ghost sets velocity to 40. Flam inserts a softer hit 25 ms before each selected hit at session tempo (after it at beat zero). Roll adds three hits inside the selected snap interval, retaining the original hit. These are discrete sampled hits, not synthesized sustained rolls.
- **Clipboard:** Ctrl/Command A selects all; C copies, X cuts, V pastes at the ruler marker, D duplicates after the selection. Delete removes selected hits. Undo/redo includes grouped drags and velocity changes. The editor clipboard is internal to the page.
- **Navigation:** zoom or Fit to the phrase; scroll horizontally/vertically. Used lanes hides empty articulations while retaining the auditioned lane. Hit the ruler to set the playback/paste marker.
- **Loop region:** set inclusive start/end bars or Loop selection. Region looping applies to Groove playback when the transport loop button is enabled. Song playback and exports always use full patterns. Region settings are saved in projects; the marker and zoom are editor-only.
- **My Grooves:** save named snapshots, then load them into the project pattern selector. These snapshots persist in this browser across sessions (up to 100), independently of favourites. Project download includes current project patterns; load a saved groove into a project to include it. Local-only collections are not account-synced.

Drum hits are one-shots: moving or adding hits changes their triggers; sample decay remains a kit/channel control. This editor intentionally does not present melodic note-length resizing.

Validation: `node tests/editor.test.mjs` and `node tests/grooves.test.mjs`.
