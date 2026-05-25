# ChemPuzzle Game Specification

Last reviewed: 2026-05-25

## Overview

ChemPuzzle is a falling-token puzzle game where atom tokens settle into a hex-grid beaker. Molecules form when adjacent tokens match a registered molecular structure graph. Formed molecules clear from the board, grant score, and can trigger chain reactions through gravity compression.

## Routes and Layout

- `/` redirects to `/play`.
- `(app)` route group contains the playable application shell and sidebar navigation.
- `/tutorial` explains reactions, controls, water, fire, and common molecules.
- `/play` is the single-player game.
- `/multiplayer` is the 1v1 layout with a room-code gate.
- `/ranking` shows the online ranking UI.
- `/login` handles login and signup.
- `/mypage` manages profile, settings, and play-history entry points.
- `/history` and `/settings` remain standalone utility pages.

The `(app)` route group is used because the grouped routes share an authenticated/app-like shell rather than a public marketing shell. A `(site)` group is also common in Next.js projects, but it usually indicates public content pages. If ChemPuzzle later adds a public landing site outside the game shell, using both `(site)` and `(app)` would be natural.

## Board

- Grid size: 13 rows x 9 columns.
- Layout: staggered hex-style grid.
- Board dimensions are derived from `ROWS`, `COLS`, `STEP_X`, `STEP_Y`, `ROW_OFFSET`, `CELL_W`, and `CELL_H`.
- The current token falls from the center column.
- A landing prediction marker is shown when the current token is inside the board.
- After clears, the board compresses downward and diagonally toward the center.

## Tokens

Available token symbols:

- Nonmetals: `H`, `O`, `C`, `N`, `P`, `B`, `S`
- Halogens: `F`, `Cl`
- Metals: `Na`, `Mg`, `Ca`, `Fe`, `Cu`, `Zn`
- Noble gases: `He`, `Ne`, `Ar`, `Xe`
- Group token: `Ph`
- Gimmick token: `Fire`

`Ph` renders as a benzene ring icon. `Fire` renders as a flame icon and has no valence.

## Controls

- `ArrowLeft` / `A`: move left
- `ArrowRight` / `D`: move right
- `ArrowDown` / `S`: soft drop
- `Space`: hard drop
- `Enter`: start / stop / restart
- `C`: hold current token
- `X`: swap current token with the next token

Hold and next-swap can be used once per falling token.

## Queue and HUD

- The top HUD shows only direct gameplay state: Hold, Next, and pH.
- Hold displays the held token or empty state.
- Next displays the upcoming queue with opacity and scale decreasing for later tokens.
- pH is calculated from the average pH of recent reaction history and shown on a 0-14 bar.
- Score, level, combo, attribute summary, and formed molecule history are shown in the right pane.

## Falling and Progression

- Initial current token: `H`
- Initial queue: `O`, `C`, `N`
- New tokens are drawn by weighted random selection.
- Higher levels increase the chance of advanced atoms such as metals, noble gases, `Ph`, and `Fire`.
- Fall interval starts at `BASE_FALL_INTERVAL` and decreases with level, capped at 180 ms minimum.
- Level increases by the number of matches resolved.
- Game over occurs when a token settles above the visible board.

## Molecule Formation

Molecule detection uses registered molecule definitions from `lib/game/molecules.ts`.

A match is valid only when:

- The board contains the required token symbols.
- Each molecule bond connects two adjacent board positions.
- The full molecule graph is satisfied, including hub structures.
- The match passes a final structure validation step before scoring.

This means structure matters:

- `CO2` requires `O-C-O`, where carbon is adjacent to both oxygens.
- `C-O-O` does not satisfy `CO2`.
- `CH4` requires carbon with four adjacent hydrogens.
- A straight `C-H-H-H-H` chain does not satisfy `CH4`.

The old visual bond arms are not used for reaction decisions.

## Scoring

Base molecule points come from each molecule definition, then receive:

- node count bonus
- difficulty bonus
- multi-match combo bonus
- water dissolve bonus
- fire burst bonus
- oxygen-boost bonus for fire

Combo and chain notices show gained points, match count, chain depth, and bonus points.

## Water Gimmick

When `H2O` forms:

- The water molecule clears.
- Adjacent soluble tokens are also cleared.
- Soluble tokens: `Na`, `Mg`, `Ca`, `Zn`, `F`, `Cl`
- Each dissolved token adds bonus points.

This is intentionally game-like rather than a full solubility simulation.

## Fire Gimmick

`Fire` is a falling token. When it is on the board:

- If no fuel or oxygen is adjacent, it clears by itself.
- Adjacent combustible tokens trigger a burst.
- Combustibility levels:
  - `H`: 1
  - `C`: 2
  - `S`: 2
  - `P`: 2
  - `Ph`: 3
- Higher combustibility increases the burst range.
- Adjacent `O` acts as an oxygen boost:
  - oxygen increases fire power
  - adjacent oxygen is consumed by the burst
  - oxygen adds bonus points
  - enough oxygen can expand the burst range
- Strong bursts can also clear nearby non-noble-gas tokens.

Noble gases `He`, `Ne`, and `Ar` resist strong fire burst spillover.

## Reaction History and Attributes

Reaction history records:

- formula
- Japanese molecule name
- property text
- effect type
- acidity category
- pH
- cleared tile count
- points

Effect types:

- `clean`
- `toxic`
- `sleep`
- `energy`
- `reactive`
- `salt`
- `inert`

The right pane summarizes dominant attributes from recent reactions.

## Single Player

Single player is the current complete game mode. It includes:

- gameplay board
- compact HUD
- controls below the board
- score and level
- combo and chain visualization
- attribute meter
- formed molecule history
- result modal on game over

## Multiplayer

The multiplayer screen is a 1v1 layout:

- left: player board
- center: formed molecule history and status
- right: opponent board preview

A room-code gate appears before the room. The current local acceptance code remains `mock` for development access, but the user-facing UI does not present mock-only wording.

The opponent board is currently a local preview. Production real-time play should synchronize board snapshots, player status, and match events through Supabase Realtime or a dedicated low-latency game server.

## Account and Profile

Signup requires:

- email
- password
- display name, 2-32 characters
- username, 3-20 lowercase alphanumeric or underscore characters

Username must be unique.

My Page supports:

- display name editing
- username editing
- avatar image selection
- avatar crop modal
- settings toggles
- empty play-history state

Profile reads and writes use `/api/profile`.

## Ranking

The ranking UI shows:

- rank
- display name
- `@username`
- score
- highlight molecule

Current ranking entries are local seed data in `lib/game/config.ts`. Production ranking should read from `scores` joined to `profiles`.
