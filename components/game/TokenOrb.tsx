import type { Direction, TokenSymbol } from "@/types/game";
import { TOKENS } from "@/lib/game/tokens";
import { BenzeneIcon } from "./BenzeneIcon";

export function TokenOrb({ token, hands, active = false, clearing = false }: { token: TokenSymbol; hands: Direction[]; active?: boolean; clearing?: boolean }) {
  const styles = TOKENS[token];
  const isGroup = styles.category === "group";

  return (
    <div
      className={`atom-orb relative flex h-9 w-9 items-center justify-center border-2 text-[0.7rem] font-black shadow-lg transition ${isGroup ? "benzene-token" : "rounded-full"} ${styles.shell} ${styles.text} ${styles.glow} ${
        active ? "scale-110 ring-4 ring-cyan-200" : ""
      } ${clearing ? "molecule-pop" : ""}`}
      title={`${token}: ${styles.label} / 手${styles.valence}`}
    >
      {isGroup ? <BenzeneIcon /> : null}
      <span className="valence-hands" aria-hidden="true">
        {hands.map((direction) => (
          <span key={direction} className={`valence-hand hand-dir-${direction}`} />
        ))}
      </span>
      {isGroup ? null : <span className="relative z-10">{token}</span>}
    </div>
  );
}
