import { redirect } from "next/navigation";
import GestorShell from "@/components/gestor/GestorShell";
import MotosPanel from "@/components/gestor/MotosPanel";
import MotosPanelDemo from "@/components/gestor/demo/MotosPanelDemo";
import { getGestorAccess } from "@/lib/site/db";

export const dynamic = "force-dynamic";

export default async function GestorMotosPage() {
  const access = await getGestorAccess();
  if (!access) redirect("/gestor/login");

  return (
    <GestorShell>
      {access.isDemo ? <MotosPanelDemo /> : <MotosPanel />}
    </GestorShell>
  );
}
