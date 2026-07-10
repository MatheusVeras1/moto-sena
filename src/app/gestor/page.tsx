import { redirect } from "next/navigation";
import GestorShell from "@/components/gestor/GestorShell";
import OverviewPanel from "@/components/gestor/OverviewPanel";
import OverviewPanelDemo from "@/components/gestor/demo/OverviewPanelDemo";
import { getGestorAccess } from "@/lib/site/db";

export const dynamic = "force-dynamic";

export default async function GestorPage() {
  const access = await getGestorAccess();
  if (!access) redirect("/gestor/login");

  return (
    <GestorShell>
      {access.isDemo ? <OverviewPanelDemo /> : <OverviewPanel />}
    </GestorShell>
  );
}
