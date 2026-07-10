"use client";

import { motion } from "motion/react";
import { CreditCard, MessageCircle, Store, Truck } from "lucide-react";
import { fadeUp } from "@/lib/motion";

const steps = [
  { icon: Store, title: "Escolha o modelo", text: "Compare vídeos, preço e atributos." },
  { icon: MessageCircle, title: "Fale com a loja", text: "Tire dúvidas e confirme disponibilidade." },
  { icon: CreditCard, title: "Pague como preferir", text: "Pix, crédito ou débito, sem complicação." },
  { icon: Truck, title: "Retire ou combine entrega", text: "Loja física ou entrega sob consulta." },
];

export default function HowToBuy() {
  return (
    <section id="comprar" className="scroll-mt-24 bg-[#151515]">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <motion.div {...fadeUp}>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#ff6a1a]">
            Como comprar
          </p>
          <h2 className="mt-3 max-w-2xl text-balance text-3xl font-semibold text-white sm:text-5xl">
            Da escolha do modelo à rua, em quatro passos.
          </h2>
        </motion.div>
        <div className="mt-10 grid gap-4 md:grid-cols-4">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.42, delay: index * 0.05 }}
              className="rounded-lg border border-white/10 bg-[#1b1b1b] p-5"
            >
              <step.icon className="h-6 w-6 text-[#ff6a1a]" />
              <h3 className="mt-5 text-lg font-semibold text-white">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-400">{step.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
