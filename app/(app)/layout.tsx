import { AppShell } from "@/components/layout/AppShell";

export default function GameAppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
