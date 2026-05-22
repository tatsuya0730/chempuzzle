import type { Match } from "@/types/game";
import { BOARD_HEIGHT, BOARD_WIDTH } from "@/lib/game/config";
import { getCellCenter } from "@/lib/game/board";
import { EFFECT_STYLES } from "@/lib/game/tokens";

export function BeakerBonds({ matches }: { matches: Match[] }) {
  return (
    <svg className="bond-layer" width={BOARD_WIDTH} height={BOARD_HEIGHT} viewBox={`0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}`} aria-hidden="true">
      {matches.flatMap((match, matchIndex) =>
        match.bonds.map((bond, bondIndex) => {
          const from = getCellCenter(bond.from);
          const to = getCellCenter(bond.to);
          const stroke = EFFECT_STYLES[match.molecule.effect].stroke;
          const dx = to.x - from.x;
          const dy = to.y - from.y;
          const length = Math.max(1, Math.hypot(dx, dy));
          const nx = (-dy / length) * 3.2;
          const ny = (dx / length) * 3.2;
          const offsets = bond.order === 1 ? [0] : bond.order === 2 ? [-1, 1] : [-1.6, 0, 1.6];

          return offsets.map((offset, offsetIndex) => (
            <line
              key={`${matchIndex}-${bondIndex}-${offsetIndex}`}
              x1={from.x + nx * offset}
              y1={from.y + ny * offset}
              x2={to.x + nx * offset}
              y2={to.y + ny * offset}
              stroke={stroke}
              strokeWidth="3"
              strokeLinecap="round"
              className="reaction-bond"
            />
          ));
        }),
      )}
    </svg>
  );
}
