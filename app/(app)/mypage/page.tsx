import { InfoPage } from "@/components/screens/InfoPage";

export default function MyPage() {
  return (
    <InfoPage
      title="マイページ"
      description="プレイヤープロフィール、直近の成績、対戦ステータスを置くためのページです。"
      cards={[
        { title: "Player", body: "表示名、称号、最高スコア、発見済み分子数をここに集約します。" },
        { title: "Match summary", body: "勝敗、平均 pH、よく使う属性、連鎖回数などをプロフィール指標として表示できます。" },
        { title: "Loadout", body: "今後、背景や原子スキン、チュートリアル進捗などのカスタマイズ枠にできます。" },
        { title: "Account", body: "Supabase Auth と接続すると、ユーザー ID ごとの履歴や設定を同期できます。" },
      ]}
    />
  );
}
