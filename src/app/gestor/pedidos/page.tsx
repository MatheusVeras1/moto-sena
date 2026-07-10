import { redirect } from "next/navigation";
import GestorShell from "@/components/gestor/GestorShell";
import PedidosPanel from "@/components/gestor/PedidosPanel";
import PedidosPanelDemo from "@/components/gestor/demo/PedidosPanelDemo";
import { getGestorAccess } from "@/lib/site/db";

export const dynamic = "force-dynamic";

export default async function GestorPedidosPage() {
  const access = await getGestorAccess();
  if (!access) redirect("/gestor/login");

  return (
    <GestorShell>
      {access.isDemo ? <PedidosPanelDemo /> : <PedidosPanel />}
    </GestorShell>
  );
}
