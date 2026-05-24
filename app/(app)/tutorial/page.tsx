import { InfoPage } from "@/components/screens/InfoPage";

export default function TutorialPage() {
  return (
    <InfoPage
      title="チュートリアル"
      description="基本操作から分子形成、マルチプレイの流れまで段階的に学ぶページです。"
      cards={[
        { title: "1. Drop", body: "左右移動、ソフトドロップ、ハードドロップで原子を盤面へ配置します。" },
        { title: "2. React", body: "隣接した原子の並びが分子グラフと一致すると反応が成立して消去されます。" },
        { title: "3. Chain", body: "消去後に落下した原子がさらに分子を作ると連鎖になり、コンボ表示に反映されます。" },
        { title: "4. Versus", body: "対戦では自分の盤面、反応履歴、相手盤面を見ながらスコアと妨害要素で競います。" },
      ]}
    />
  );
}
