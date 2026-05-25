import type { TokenSymbol } from "@/types/game";
import { TOKENS } from "@/lib/game/tokens";
import { BenzeneIcon } from "./BenzeneIcon";

export function MiniToken({ token }: { token: TokenSymbol }) {
  const styles = TOKENS[token];
  const isGroup = styles.category === "group";
  const isFire = token === "Fire";
  return (
    <span className={`relative inline-flex h-8 w-8 items-center justify-center border text-[0.65rem] font-black ${isGroup ? "benzene-token mini" : "rounded-full"} ${styles.shell} ${styles.text}`}>
      {isGroup ? <BenzeneIcon compact /> : <span className="relative z-10">{isFire ? "火" : token}</span>}
    </span>
  );
}
