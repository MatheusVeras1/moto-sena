"use client";

import { motion } from "motion/react";
import { CreditCard, MessageCircle, ShieldCheck, Truck, WalletCards, X, Zap } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import LazyVideo from "@/components/LazyVideo/LazyVideo";
import Metric from "@/components/ui/Metric";
import type { Moto } from "@/data/motos";
import { trackSiteEvent } from "@/lib/site/analytics";
import { cn } from "@/lib/utils";
import { whatsappHref } from "@/lib/whatsapp";

type PaymentMethod = "Pix" | "Crédito" | "Débito";
type DeliveryMethod = "Retirada na loja" | "Entrega sob consulta";

type CheckoutProps = {
  moto: Moto;
  motos: Moto[];
  onChangeMoto: (id: string) => void;
  onClose: () => void;
};

export default function Checkout({ moto, motos, onChangeMoto, onClose }: CheckoutProps) {
  const [payment, setPayment] = useState<PaymentMethod>("Pix");
  const [delivery, setDelivery] = useState<DeliveryMethod>("Retirada na loja");
  const [buyer, setBuyer] = useState({ name: "", phone: "", city: "" });
  const [empresa, setEmpresa] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const phoneDigits = buyer.phone.replace(/\D/g, "");
  const isValid = buyer.name.trim().length >= 2 && buyer.city.trim().length >= 2 && phoneDigits.length >= 10 && phoneDigits.length <= 15;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  const whatsappCheckoutHref = useMemo(() => whatsappHref(
    `Olá, tenho interesse na ${moto.name}.\n` +
    `Forma de pagamento: ${payment}.\n` +
    `Entrega/retirada: ${delivery}.\n` +
    `Nome: ${buyer.name.trim()}.\n` +
    `Telefone: ${buyer.phone.trim()}.\n` +
    `Cidade: ${buyer.city.trim()}.`
  ), [buyer.city, buyer.name, buyer.phone, delivery, moto.name, payment]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isValid || submitting) {
      setError("Preencha nome, WhatsApp válido e cidade para continuar.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motoId: moto.id, motoName: moto.name, payment, delivery, name: buyer.name, phone: buyer.phone, city: buyer.city, empresa }),
      });
      if (!response.ok) throw new Error("Não foi possível preparar o pedido.");
      trackSiteEvent("whatsapp_click", { motoId: moto.id, metadata: { source: "checkout" } });
      window.location.assign(whatsappCheckoutHref);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Tente novamente em instantes.");
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/72 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.25 }} className="mx-auto flex h-full max-w-5xl flex-col overflow-hidden rounded-lg border border-white/10 bg-[#151515] shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="checkout-title">
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          <div><p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#ff6a1a]">Seu pedido</p><h2 id="checkout-title" className="text-xl font-semibold text-white">{moto.name}</h2></div>
          <button ref={closeButtonRef} type="button" onClick={onClose} className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-white transition hover:bg-white/10" aria-label="Fechar pedido"><X className="h-5 w-5" /></button>
        </div>
        <div className="grid flex-1 overflow-y-auto overscroll-contain lg:grid-cols-[0.95fr_1.05fr]">
          <div className="border-b border-white/10 p-5 lg:border-b-0 lg:border-r">
            <LazyVideo className="aspect-video w-full rounded-lg object-cover" src={moto.video} poster={moto.poster} eager />
            <div className="mt-5 grid gap-3"><Metric label="Modelo" value={moto.shortName} /><Metric label="Preço" value={moto.price} emphasis /></div>
          </div>
          <form className="p-5" onSubmit={handleSubmit} noValidate>
            <CheckoutBlock icon={WalletCards} title="1. Escolha o modelo">
              <label className="block"><span className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">Modelo</span><select value={moto.id} onChange={(event) => onChangeMoto(event.target.value)} className="mt-2 h-11 w-full rounded-md border border-white/10 bg-black/35 px-3 text-base text-white outline-none transition focus:border-[#ff6a1a] sm:text-sm">{motos.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
            </CheckoutBlock>
            <CheckoutBlock icon={WalletCards} title="2. Forma de pagamento"><ChoiceGroup options={["Pix", "Crédito", "Débito"]} value={payment} onChange={(value) => setPayment(value as PaymentMethod)} /></CheckoutBlock>
            <CheckoutBlock icon={Truck} title="3. Retirada ou entrega"><ChoiceGroup options={["Retirada na loja", "Entrega sob consulta"]} value={delivery} onChange={(value) => setDelivery(value as DeliveryMethod)} /></CheckoutBlock>
            <CheckoutBlock icon={ShieldCheck} title="4. Seus dados para atendimento">
              <input type="text" name="empresa" value={empresa} onChange={(event) => setEmpresa(event.target.value)} autoComplete="off" tabIndex={-1} aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
              <div className="grid gap-3 sm:grid-cols-3">
                <TextInput label="Nome" value={buyer.name} onChange={(value) => setBuyer({ ...buyer, name: value })} autoComplete="name" required />
                <TextInput label="WhatsApp" value={buyer.phone} onChange={(value) => setBuyer({ ...buyer, phone: value })} type="tel" inputMode="tel" autoComplete="tel" required />
                <TextInput label="Cidade" value={buyer.city} onChange={(value) => setBuyer({ ...buyer, city: value })} autoComplete="address-level2" required />
              </div>
            </CheckoutBlock>
            <div className="mt-6 rounded-lg border border-white/10 bg-black/25 p-5">
              <div className="flex items-center gap-3 text-white"><Zap className="h-5 w-5 text-[#ff6a1a]" /><p className="font-semibold">Pedido pronto para enviar</p></div>
              <p className="mt-2 text-sm leading-6 text-zinc-400">Seus dados são necessários para a Moto Sena retornar sobre este interesse.</p>
              {error ? <p className="mt-3 text-sm text-red-300" role="alert">{error}</p> : null}
              <button type="submit" disabled={!isValid || submitting} className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[#e85d04] px-5 text-sm font-semibold text-white transition hover:bg-[#ff6a1a] disabled:cursor-not-allowed disabled:opacity-50">{submitting ? "Abrindo WhatsApp..." : "Enviar pedido no WhatsApp"}<MessageCircle className="h-4 w-4" /></button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

function CheckoutBlock({ icon: Icon, title, children }: { icon: typeof CreditCard; title: string; children: React.ReactNode }) {
  return <section className="border-b border-white/10 py-5 first:pt-0"><div className="mb-4 flex items-center gap-3"><Icon className="h-5 w-5 text-[#ff6a1a]" /><h3 className="font-semibold text-white">{title}</h3></div>{children}</section>;
}

function ChoiceGroup({ options, value, onChange }: { options: string[]; value: string; onChange: (value: string) => void }) {
  return <div className="grid gap-2 sm:grid-cols-3">{options.map((option) => <button key={option} type="button" onClick={() => onChange(option)} className={cn("h-11 rounded-md border px-3 text-sm font-semibold transition", value === option ? "border-[#ff6a1a] bg-[#ff6a1a]/15 text-[#ff9556]" : "border-white/10 bg-white/[0.04] text-zinc-300 hover:bg-white/10")}>{option}</button>)}</div>;
}

function TextInput({ label, value, onChange, type = "text", inputMode, autoComplete, required = false }: { label: string; value: string; onChange: (value: string) => void; type?: string; inputMode?: "tel" | "numeric" | "text"; autoComplete?: string; required?: boolean }) {
  return <label className="block"><span className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">{label}{required ? " *" : ""}</span><input type={type} inputMode={inputMode} autoComplete={autoComplete} value={value} onChange={(event) => onChange(event.target.value)} required={required} className="mt-2 h-11 w-full rounded-md border border-white/10 bg-black/35 px-3 text-base text-white outline-none transition focus:border-[#ff6a1a] sm:text-sm" /></label>;
}
