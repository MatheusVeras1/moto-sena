import { redirect } from "next/navigation";
import GestorShell from "@/components/gestor/GestorShell";
import SitePanel from "@/components/gestor/SitePanel";
import SitePanelDemo from "@/components/gestor/demo/SitePanelDemo";
import { getGestorAccess } from "@/lib/site/db";

export const dynamic = "force-dynamic";

export default async function GestorSitePage() {
  const access = await getGestorAccess();
  if (!access) redirect("/gestor/login");

  return (
    <GestorShell>
      {access.isDemo ? <SitePanelDemo /> : <SitePanel />}
    </GestorShell>
  );
}
