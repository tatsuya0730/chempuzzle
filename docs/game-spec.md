# ChemPuzzle Game Specification

Last reviewed: 2026-05-26

## Overview

ChemPuzzle is a falling-token physics puzzle game where atom tokens fall into a gridless beaker powered by Phaser and Matter Physics. Atoms have different physical sizes by element, collide freely, and can merge into reactive molecule or fragment tokens. A formed molecule clears only after it reaches a non-expandable, generally stable composition; expandable intermediates such as `CO` remain as one token and can later react with another atom, for example `CO` + `O` -> `CO2`.

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

- Layout: gridless beaker with Matter Physics gravity, walls, collision, and rolling bodies.
- The current atom spawns near the top center and can be nudged left or right while active.
- Atom sizes are intentionally varied by element using a game-scaled approximation of real atomic/covalent radius differences.
- Molecule and fragment tokens use larger compound bodies derived from their component atom sizes.
- Game over occurs when settled bodies stack into the top spawn area.

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
- `Space`: lock/drop the current token faster
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
- Matter Physics controls falling, bounce, friction, and settling.
- Level increases when terminal molecules clear.
- Game over occurs when settled bodies block the top of the beaker.

## Molecule Formation

Molecule detection uses registered molecule definitions from `lib/game/molecules.ts` and the physics merge rules in `lib/game/physicsChemistry.ts`.

- If two colliding bodies form a known molecule that can still expand into another registered molecule, they merge into one molecule token instead of clearing.
- If two colliding bodies form a partial composition that is a subset of a registered molecule, they merge into a reactive fragment token.
- If the composition matches a registered molecule and cannot expand further in the current rule set, it clears, scores, and is added to reaction history.
- `CO` is treated as a playable intermediate token; `CO2` clears only when `CO` later combines with `O`.
- Ionic molecule definitions have been removed for now.

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

When `H2O` reaches its terminal composition, it clears and scores as a stable molecule. The old grid-adjacent dissolve rule is not used in the physics version.

## Fire Gimmick

`Fire` is a falling token. When it is on the board:

- Collision with fuel-like atoms or oxygen triggers a burst.
- Bursts clear nearby non-noble-gas bodies and grant bonus points.

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
