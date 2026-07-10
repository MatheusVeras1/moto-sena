import Image from "next/image";
import { AtSign } from "lucide-react";
import { loja } from "@/config/loja";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/35">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 text-sm text-zinc-400 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div className="flex items-center gap-3">
          <Image
            src={loja.logoPath}
            alt={loja.nome}
            width={42}
            height={42}
            className="h-10 w-10 rounded border border-white/10 object-cover"
          />
          <div>
            <p className="font-semibold text-white">{loja.nome}</p>
            <p>Motos el�tricas em {loja.cidadesResumo}.</p>
          </div>
        </div>
        <div className="flex flex-col gap-3 md:items-end">
          <a
            href={loja.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-semibold text-white transition hover:text-[#ff9556]"
          >
            <AtSign className="h-4 w-4" />
            @motosenaoficial
          </a>
          <p>Valores, simula��es e disponibilidade devem ser confirmados com a loja.</p>
        </div>
      </div>
    </footer>
  );
}
