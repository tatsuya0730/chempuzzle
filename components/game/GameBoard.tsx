import type { Grid, Match, Position, Tile } from "@/types/game";
import { BOARD_HEIGHT, BOARD_WIDTH, CELL_H, CELL_W, ROW_OFFSET } from "@/lib/game/config";
import { tileKey } from "@/lib/game/board";
import { EFFECT_STYLES } from "@/lib/game/tokens";
import { BeakerBonds } from "./BeakerBonds";
import { TokenOrb } from "./TokenOrb";

export function GameBoard({
  displayGrid,
  current,
  predictedLanding,
  clearing,
  clearingMatches,
}: {
  displayGrid: Grid;
  current: Tile;
  predictedLanding: Position;
  clearing: Map<string, Match>;
  clearingMatches: Match[];
}) {
  const showPrediction = predictedLanding.row >= 0;
  const showCurrentToken = current.row >= 0;

  return (
    <div className="beaker-frame flex flex-1 items-center justify-center overflow-auto p-5">
      <div className="relative mx-auto py-2" style={{ width: `${BOARD_WIDTH}px`, height: `${BOARD_HEIGHT + 16}px` }}>
        <BeakerBonds matches={clearingMatches} />
        {displayGrid.map((row, rowIndex) => (
          <div key={`row-${rowIndex}`} className="hex-row flex h-10 gap-[7px]" style={{ marginLeft: rowIndex % 2 === 0 ? 0 : ROW_OFFSET }}>
            {row.map((cell, colIndex) => {
              const key = tileKey(rowIndex, colIndex);
              const match = clearing.get(key);
              const isPredicted = showPrediction && predictedLanding.row === rowIndex && predictedLanding.col === colIndex;
              return (
                <div
                  key={key}
                  className={`hex-cell relative flex h-10 w-9 items-center justify-center rounded-full border border-dashed border-sky-200/80 bg-white/55 ${match ? EFFECT_STYLES[match.molecule.effect].ring : ""} ${
                    match ? "ring-4" : ""
                  }`}
                >
                  {isPredicted ? <div className="absolute inset-[4px] rounded-full border border-cyan-300/70 bg-cyan-200/30" /> : null}
                  {cell ? <TokenOrb token={cell.token} hands={cell.hands} clearing={Boolean(match)} /> : null}
                  {match ? <span className={`effect-burst effect-${match.molecule.effect}`} /> : null}
                </div>
              );
            })}
          </div>
        ))}
        {showCurrentToken ? (
          <div
            className="pointer-events-none absolute z-20"
            style={{
              left: `${current.screenX - CELL_W / 2}px`,
              top: `${current.screenY - CELL_H / 2}px`,
            }}
          >
            <TokenOrb token={current.token} hands={current.hands} active={true} clearing={false} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
