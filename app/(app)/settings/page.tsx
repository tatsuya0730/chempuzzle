import { InfoPage } from "@/components/screens/InfoPage";

export default function SettingsPage() {
  return (
    <InfoPage
      title="設定"
      description="操作、表示、対戦同期に関する設定を置くためのページです。"
      cards={[
        { title: "Controls", body: "キーバインド、ソフトドロップ速度、ホールド/Next交換の有効化を設定できます。" },
        { title: "Display", body: "盤面サイズ、アニメーション軽減、色覚サポート、履歴表示密度を切り替えられます。" },
        { title: "Realtime", body: "対戦時の同期間隔、接続品質表示、切断時の自動復帰ポリシーを管理します。" },
        { title: "Privacy", body: "公開プロフィール、履歴公開範囲、フレンドからの招待許可を制御します。" },
      ]}
    />
  );
}
