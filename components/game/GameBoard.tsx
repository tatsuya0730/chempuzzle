import type { Grid, Match, Tile } from "@/types/game";
import { BOARD_HEIGHT, BOARD_WIDTH, ROW_OFFSET } from "@/lib/game/config";
import { tileKey } from "@/lib/game/board";
import { EFFECT_STYLES } from "@/lib/game/tokens";
import { BeakerBonds } from "./BeakerBonds";
import { TokenOrb } from "./TokenOrb";

export function GameBoard({ displayGrid, current, clearing, clearingMatches }: { displayGrid: Grid; current: Tile; clearing: Map<string, Match>; clearingMatches: Match[] }) {
  return (
    <div className="beaker-frame flex flex-1 items-center justify-center overflow-auto p-5">
      <div className="relative mx-auto py-2" style={{ width: `${BOARD_WIDTH}px`, height: `${BOARD_HEIGHT + 16}px` }}>
        <BeakerBonds matches={clearingMatches} />
        {displayGrid.map((row, rowIndex) => (
          <div key={`row-${rowIndex}`} className="hex-row flex h-10 gap-[7px]" style={{ marginLeft: rowIndex % 2 === 0 ? 0 : ROW_OFFSET }}>
            {row.map((cell, colIndex) => {
              const key = tileKey(rowIndex, colIndex);
              const match = clearing.get(key);
              return (
                <div
                  key={key}
                  className={`hex-cell relative flex h-10 w-9 items-center justify-center rounded-full border border-dashed border-sky-200/80 bg-white/55 ${match ? EFFECT_STYLES[match.molecule.effect].ring : ""} ${
                    match ? "ring-4" : ""
                  }`}
                >
                  {cell ? <TokenOrb token={cell.token} hands={cell.hands} active={current.row === rowIndex && current.col === colIndex} clearing={Boolean(match)} /> : null}
                  {match ? <span className={`effect-burst effect-${match.molecule.effect}`} /> : null}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
