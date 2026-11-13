# Iron Room groove library

**2,375 pattern arrangements**, built from 50 new style profiles and the original 36 starter patterns. There are 54 searchable style labels in 12 families.

| Type | Patterns |
| --- | ---: |
| Groove | 1,497 |
| Fill | 802 |
| Intro | 18 |
| Ending | 58 |

Patterns span 1–4 bars and nine meters: 4/4, 3/4, 5/4, 5/8, 6/8, 7/8, 9/8, 11/8, 12/8.

## New style collections

| Family | Style | Suggested BPM | Meter | Feel | Retained patterns |
| --- | --- | ---: | --- | --- | ---: |
| Rock | Studio Rock | 112 | 4/4 | Straight | 50 |
| Rock | Hard Rock | 124 | 4/4 | Straight | 47 |
| Rock | Alternative Rock | 108 | 4/4 | Straight | 47 |
| Rock | Indie Rock | 132 | 4/4 | Straight | 47 |
| Rock | Pop Punk | 174 | 4/4 | Straight | 47 |
| Rock | Punk | 186 | 4/4 | Straight | 47 |
| Metal | Heavy Metal | 148 | 4/4 | Straight | 47 |
| Metal | Thrash | 192 | 4/4 | Straight | 47 |
| Metal | Metalcore | 150 | 4/4 | Straight | 47 |
| Metal | Djent | 136 | 4/4 | Straight | 47 |
| Metal | Blast Beats | 210 | 4/4 | Straight | 37 |
| Metal | Doom | 66 | 4/4 | Straight | 47 |
| Pop | Pop | 116 | 4/4 | Straight | 35 |
| Pop | Ballad | 72 | 4/4 | Straight | 47 |
| Funk | Funk | 102 | 4/4 | Straight | 47 |
| Funk | Linear Funk | 108 | 4/4 | Straight | 47 |
| Funk | Afrobeat | 112 | 4/4 | Straight | 47 |
| Soul | Soul | 94 | 4/4 | Straight | 44 |
| Soul | Motown | 126 | 4/4 | Straight | 47 |
| Soul | R&B | 86 | 4/4 | Straight | 47 |
| Soul | Neo-Soul | 78 | 4/4 | Swing | 47 |
| Hip-Hop | Hip-Hop | 92 | 4/4 | Straight | 47 |
| Hip-Hop | Boom Bap | 88 | 4/4 | Swing | 47 |
| Hip-Hop | Trap Kit | 140 | 4/4 | Straight | 47 |
| Electronic | Disco | 120 | 4/4 | Straight | 47 |
| Electronic | House Kit | 124 | 4/4 | Straight | 47 |
| Electronic | Drum & Bass | 172 | 4/4 | Straight | 47 |
| Electronic | Breakbeat | 132 | 4/4 | Straight | 47 |
| Jazz | Jazz Swing | 148 | 4/4 | Swing | 47 |
| Jazz | Bebop | 188 | 4/4 | Swing | 47 |
| Jazz | Jazz Waltz | 154 | 3/4 | Swing | 50 |
| Blues | Blues Shuffle | 104 | 4/4 | Shuffle | 47 |
| Blues | Texas Shuffle | 128 | 4/4 | Shuffle | 47 |
| Blues | Slow Blues | 68 | 12/8 | Triplet | 50 |
| World | Reggae | 82 | 4/4 | Straight | 47 |
| World | One Drop | 76 | 4/4 | Straight | 47 |
| World | Ska | 148 | 4/4 | Straight | 44 |
| World | Bossa Nova | 132 | 4/4 | Straight | 47 |
| World | Samba | 104 | 4/4 | Straight | 47 |
| World | Baiao | 96 | 4/4 | Straight | 47 |
| World | Songo | 108 | 4/4 | Straight | 47 |
| World | Cascara | 116 | 4/4 | Straight | 47 |
| World | Afro-Cuban 6/8 | 114 | 6/8 | Triplet | 50 |
| Country | Country Train | 156 | 4/4 | Straight | 37 |
| Country | Country Rock | 118 | 4/4 | Straight | 47 |
| Odd meter | Progressive 5/4 | 122 | 5/4 | Straight | 50 |
| Odd meter | Progressive 7/8 | 132 | 7/8 | Straight | 50 |
| Odd meter | Odd 5/8 | 142 | 5/8 | Straight | 50 |
| Odd meter | Odd 9/8 | 126 | 9/8 | Triplet | 50 |
| Odd meter | Odd 11/8 | 136 | 11/8 | Straight | 50 |

## Content and timing

Each style profile defines its own kick vocabulary, backbeat/clave placement, pulse, ghost notes, instrumentation and feel. The builder creates verse, ghost-note and chorus phrases; hat and ride orchestrations; one/two beat, one/two bar fills; and intros/endings. Phrase responses and chorus entries vary over two/four bars. Triplets are stored as exact 480-PPQ MIDI ticks via fractional step offsets.

The generated expansion is filtered by rhythmic fingerprints that ignore velocity. Duplicate patterns are omitted across styles, so some intros and endings appear only under the first matching style. The original 36 starter entries remain unchanged, including 13 shared rhythms, to preserve existing project references. There are 2,362 distinct rhythmic fingerprints overall. New arrangements are deterministic and stable across reloads.

These are original programmed kit arrangements, not human-played MIDI recordings or copyrighted grooves from commercial products. World styles are drum-kit interpretations. Application and original patterns are MIT licensed.

## Use the library

- Filter by pattern type, style or broader family, meter, feel and tempo. Search combines words across metadata.
- Audition without adding patterns to your project; optionally follow each groove’s suggested tempo.
- Click a name to load/edit it, or use ＋/drag to add it to the song.
- Star favourites for browser-local recall.
- Download filtered MIDI packs from the browser, or use the complete `dist/iron-room-grooves.zip`.

## Validation

`node tests/grooves.test.mjs` checks all 2,375 patterns and 103,835 events, including valid instruments, timing/velocity bounds, stable unique names/IDs, generated rhythm uniqueness, all style/meter coverage, search/favourite/sort combinations, and MIDI note/velocity/timing/tempo/meter round trips.
