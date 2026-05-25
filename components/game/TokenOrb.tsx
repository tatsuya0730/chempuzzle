import type { TokenSymbol } from "@/types/game";
import { TOKENS } from "@/lib/game/tokens";
import { BenzeneIcon } from "./BenzeneIcon";
import { FlameIcon } from "./FlameIcon";

export function TokenOrb({ token, active = false, clearing = false }: { token: TokenSymbol; active?: boolean; clearing?: boolean }) {
  const styles = TOKENS[token];
  const isGroup = styles.category === "group";
  const isFire = token === "Fire";

  return (
    <div
      className={`atom-orb relative flex h-9 w-9 items-center justify-center border-2 text-[0.7rem] font-black shadow-lg transition ${isGroup ? "benzene-token" : "rounded-full"} ${styles.shell} ${styles.text} ${styles.glow} ${
        active ? "scale-110 ring-4 ring-cyan-200" : ""
      } ${clearing ? "molecule-pop" : ""}`}
      title={`${token}: ${styles.label}`}
    >
      {isGroup ? <BenzeneIcon /> : null}
      {isFire ? <FlameIcon /> : null}
      {isGroup || isFire ? null : <span className="relative z-10">{token}</span>}
    </div>
  );
}
