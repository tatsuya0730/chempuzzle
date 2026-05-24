import { InfoPage } from "@/components/screens/InfoPage";

export default function HistoryPage() {
  return (
    <InfoPage
      title="プレイ履歴"
      description="個人プレイとマルチプレイの試合結果を一覧するためのページです。"
      cards={[
        { title: "Solo runs", body: "スコア、最大連鎖、作成分子数、平均 pH、支配属性を保存して時系列で表示します。" },
        { title: "Versus matches", body: "対戦相手、勝敗、ルーム ID、開始終了時刻、同期遅延の情報を記録できます。" },
        { title: "Reaction archive", body: "形成した分子の履歴から、よく使う反応パターンや未発見分子への導線を作れます。" },
        { title: "Replay seed", body: "乱数 seed と入力ログを保存すれば、軽量なリプレイ再生や不正検知にも使えます。" },
      ]}
    />
  );
}
