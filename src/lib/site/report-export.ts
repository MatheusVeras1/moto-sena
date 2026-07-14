import type { ManagementReportData, StockMovementType } from "./types";

type ExportFormat = "pdf" | "xlsx";
type ReportIcon = "summary" | "inventory" | "movements" | "orders" | "performance" | "acquisition";
type CellValue = string | number | Date;

const STATUS_LABEL = {
  novo: "Novo",
  atendimento: "Em atendimento",
  vendido: "Vendido",
  perdido: "Perdido",
} as const;

const MOVEMENT_LABEL = {
  entrada: "Entrada",
  saida: "Saída",
  ajuste: "Ajuste",
  venda: "Venda automática",
  estorno_venda: "Estorno de venda",
} as const;

const PALETTE = {
  gold: { hex: "#C69736", rgb: [198, 151, 54] as [number, number, number], argb: "FFC69736" },
  dark: { hex: "#171717", rgb: [23, 23, 23] as [number, number, number], argb: "FF171717" },
  ink: { hex: "#27272A", rgb: [39, 39, 42] as [number, number, number], argb: "FF27272A" },
  muted: { hex: "#71717A", rgb: [113, 113, 122] as [number, number, number], argb: "FF71717A" },
  line: { hex: "#E4E4E7", rgb: [228, 228, 231] as [number, number, number], argb: "FFE4E4E7" },
  soft: { hex: "#F4F4F5", rgb: [244, 244, 245] as [number, number, number], argb: "FFF4F4F5" },
  green: { hex: "#059669", rgb: [5, 150, 105] as [number, number, number], argb: "FF059669", soft: "FFD1FAE5" },
  red: { hex: "#DC2626", rgb: [220, 38, 38] as [number, number, number], argb: "FFDC2626", soft: "FFFEE2E2" },
  blue: { hex: "#0284C7", rgb: [2, 132, 199] as [number, number, number], argb: "FF0284C7", soft: "FFE0F2FE" },
  gray: { hex: "#52525B", rgb: [82, 82, 91] as [number, number, number], argb: "FF52525B", soft: "FFE4E4E7" },
};

const ICON_PATHS: Record<ReportIcon, string> = {
  summary: '<path d="M4 19V9m6 10V5m6 14v-7m4 7H2"/>',
  inventory: '<path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/>',
  movements: '<path d="M4 8h13m-4-4 4 4-4 4M20 16H7m4 4-4-4 4-4"/>',
  orders: '<path d="M6 8h12l-1 12H7zM9 8a3 3 0 0 1 6 0"/>',
  performance: '<path d="M4 19V5m0 14h16M7 15l4-4 3 2 5-6"/>',
  acquisition: '<path d="M12 21s6-5.2 6-11a6 6 0 1 0-12 0c0 5.8 6 11 6 11Z"/><circle cx="12" cy="10" r="2"/>',
};

const SECTION_META: Record<ReportIcon, { color: typeof PALETTE.gold; tab: string }> = {
  summary: { color: PALETTE.gold, tab: PALETTE.gold.argb },
  inventory: { color: PALETTE.green, tab: PALETTE.green.argb },
  movements: { color: PALETTE.blue, tab: PALETTE.blue.argb },
  orders: { color: PALETTE.red, tab: PALETTE.red.argb },
  performance: { color: PALETTE.gold, tab: PALETTE.gold.argb },
  acquisition: { color: PALETTE.blue, tab: PALETTE.blue.argb },
};

export async function exportManagementReport(data: ManagementReportData, format: ExportFormat) {
  if (format === "pdf") return exportPdf(data);
  return exportExcel(data);
}

function reportSuffix(data: ManagementReportData) {
  return data.overview.periodo.month ?? `${data.overview.periodo.range ?? 30}d`;
}

function reportFileName(data: ManagementReportData, extension: "pdf" | "xlsx") {
  const storeSlug = data.store.name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "loja";
  return `${storeSlug}-relatorio-${reportSuffix(data)}.${extension}`;
}

async function logoDataUrl(path: string) {
  const response = await fetch(path);
  if (!response.ok) throw new Error("Não foi possível carregar a logo do relatório.");
  const blob = await response.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Não foi possível processar a logo."));
    reader.readAsDataURL(blob);
  });
}

async function renderReportIcon(icon: ReportIcon) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24"><rect width="24" height="24" rx="5" fill="${SECTION_META[icon].color.hex}"/><g fill="none" stroke="#111111" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICON_PATHS[icon]}</g></svg>`;
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error("Não foi possível preparar os ícones do relatório."));
      element.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    canvas.getContext("2d")?.drawImage(image, 0, 0, 64, 64);
    return canvas.toDataURL("image/png");
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function reportAssets(logoPath: string) {
  const [logo, ...icons] = await Promise.all([
    logoDataUrl(logoPath),
    ...(["summary", "inventory", "movements", "orders", "performance", "acquisition"] as ReportIcon[]).map(renderReportIcon),
  ]);
  return {
    logo,
    icons: Object.fromEntries(
      (["summary", "inventory", "movements", "orders", "performance", "acquisition"] as ReportIcon[]).map((key, index) => [key, icons[index]])
    ) as Record<ReportIcon, string>,
  };
}

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function dateTime(value: string) {
  return new Date(value).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

function movementColor(type: StockMovementType) {
  if (type === "entrada" || type === "estorno_venda") return PALETTE.green;
  if (type === "ajuste") return PALETTE.blue;
  return PALETTE.red;
}

async function exportPdf(data: ManagementReportData) {
  const [{ jsPDF }, { autoTable }, assets] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
    reportAssets(data.store.logoPath),
  ]);
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  const header = () => {
    doc.setFillColor(...PALETTE.gold.rgb);
    doc.rect(0, 0, pageWidth, 34, "F");
    doc.addImage(assets.logo, "JPEG", 14, 7, 20, 20);
    doc.setTextColor(...PALETTE.dark.rgb);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text(data.store.name, 40, 15);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Relatório gerencial · ${data.overview.periodo.label}`, 40, 21);
    doc.text(`Gerado em ${dateTime(data.generatedAt)}`, pageWidth - 14, 15, { align: "right" });
    doc.setTextColor(...PALETTE.ink.rgb);
  };

  const section = (options: {
    title: string;
    icon: ReportIcon;
    body: Array<Array<string | number>>;
    head: string[];
    semantic?: "inventory" | "movement" | "order";
  }) => {
    let titleY = ((doc as typeof doc & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 35) + 11;
    if (titleY > 268) {
      doc.addPage();
      header();
      titleY = 43;
    }
    const meta = SECTION_META[options.icon];
    doc.setFillColor(...meta.color.rgb);
    doc.roundedRect(14, titleY - 5, 7, 7, 1.3, 1.3, "F");
    doc.addImage(assets.icons[options.icon], "PNG", 14.6, titleY - 4.4, 5.8, 5.8);
    doc.setTextColor(...PALETTE.ink.rgb);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(options.title, 24, titleY);
    autoTable(doc, {
      startY: titleY + 4,
      head: [options.head],
      body: options.body,
      theme: "grid",
      headStyles: { fillColor: PALETTE.dark.rgb, textColor: [255, 255, 255], fontStyle: "bold" },
      alternateRowStyles: { fillColor: PALETTE.soft.rgb },
      styles: { fontSize: 8, cellPadding: 2, lineColor: PALETTE.line.rgb, lineWidth: 0.15, textColor: PALETTE.ink.rgb },
      didParseCell: (cell) => {
        if (cell.section !== "body") return;
        if (options.semantic === "inventory" && cell.column.index === 1) {
          const stock = data.inventory[cell.row.index]?.stockQuantity ?? 0;
          cell.cell.styles.fillColor = stock > 0 ? [209, 250, 229] : [254, 226, 226];
          cell.cell.styles.textColor = stock > 0 ? PALETTE.green.rgb : PALETTE.red.rgb;
          cell.cell.styles.fontStyle = "bold";
        }
        if (options.semantic === "movement" && (cell.column.index === 2 || cell.column.index === 3)) {
          const color = movementColor(data.movements[cell.row.index]?.type ?? "ajuste");
          cell.cell.styles.textColor = color.rgb;
          cell.cell.styles.fontStyle = "bold";
        }
        if (options.semantic === "order" && cell.column.index === 2) {
          const status = data.orders[cell.row.index]?.status;
          const color = status === "vendido" ? PALETTE.green : status === "atendimento" ? PALETTE.blue : status === "novo" ? PALETTE.gold : PALETTE.gray;
          cell.cell.styles.textColor = color.rgb;
          cell.cell.styles.fontStyle = "bold";
        }
      },
      didDrawPage: () => header(),
      margin: { top: 40, left: 14, right: 14 },
    });
  };

  header();
  const kpis = [
    { label: "Visitantes únicos", value: data.overview.visitantesUnicos, color: PALETTE.gold, icon: "acquisition" as ReportIcon },
    { label: "Contatos WhatsApp", value: data.overview.contatosWhatsAppUnicos, color: PALETTE.green, icon: "movements" as ReportIcon },
    { label: "Pedidos gerados", value: data.overview.pedidosEnviados, color: PALETTE.blue, icon: "orders" as ReportIcon },
    { label: "Conversão", value: `${data.overview.conversaoPedido.toLocaleString("pt-BR")}%`, color: PALETTE.gold, icon: "performance" as ReportIcon },
    { label: "Unidades em estoque", value: data.inventory.reduce((sum, moto) => sum + moto.stockQuantity, 0), color: PALETTE.green, icon: "inventory" as ReportIcon },
    { label: "Modelos sem estoque", value: data.inventory.filter((moto) => moto.stockQuantity === 0).length, color: PALETTE.red, icon: "inventory" as ReportIcon },
  ];
  kpis.forEach((kpi, index) => {
    const column = index % 3;
    const row = Math.floor(index / 3);
    const x = 14 + column * 61;
    const y = 42 + row * 22;
    doc.setFillColor(...PALETTE.soft.rgb);
    doc.setDrawColor(...PALETTE.line.rgb);
    doc.roundedRect(x, y, 57, 18, 2, 2, "FD");
    doc.setFillColor(...kpi.color.rgb);
    doc.rect(x, y, 2, 18, "F");
    doc.addImage(assets.icons[kpi.icon], "PNG", x + 48, y + 3, 6, 6);
    doc.setTextColor(...PALETTE.muted.rgb);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.text(kpi.label, x + 6, y + 6);
    doc.setTextColor(...PALETTE.ink.rgb);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(String(kpi.value), x + 6, y + 14);
  });
  (doc as typeof doc & { lastAutoTable?: { finalY: number } }).lastAutoTable = { finalY: 84 };

  section({ title: "Funil comercial", icon: "summary", body: data.overview.funil.map((item) => [item.etapa, item.sessoes ?? item.valor ?? 0, item.conversaoTotal ?? 0]), head: ["Etapa", "Sessões", "Conversão total (%)"] });
  section({ title: "Estoque atual", icon: "inventory", semantic: "inventory", body: data.inventory.map((moto) => [moto.name, moto.stockQuantity, moto.active ? "Na vitrine" : "Oculta", moto.price]), head: ["Modelo", "Saldo", "Visibilidade", "Preço"] });
  section({ title: "Movimentações do período", icon: "movements", semantic: "movement", body: data.movements.map((item) => [dateTime(item.createdAt), item.motoName, MOVEMENT_LABEL[item.type], item.delta > 0 ? `+${item.delta}` : item.delta, item.newQuantity, item.note]), head: ["Data", "Modelo", "Tipo", "Variação", "Saldo", "Observação"] });
  section({ title: "Pedidos do período", icon: "orders", semantic: "order", body: data.orders.map((item) => [dateTime(item.createdAt), item.motoName, STATUS_LABEL[item.status], item.payment, item.delivery, item.city || "Não informada"]), head: ["Data", "Modelo", "Status", "Pagamento", "Entrega", "Cidade"] });
  section({ title: "Desempenho por modelo", icon: "performance", body: data.overview.modelosDesempenho.map((item) => [item.nome, item.interessados, item.pedidos, `${item.conversao.toLocaleString("pt-BR")}%`]), head: ["Modelo", "Interessados", "Pedidos", "Conversão"] });
  section({ title: "Origem das visitas", icon: "acquisition", body: data.overview.origens.map((item) => [item.origem, item.visitas]), head: ["Origem", "Visitas"] });
  section({ title: "Cidades", icon: "acquisition", body: data.overview.cidades.map((item) => [item.cidade, item.visitas]), head: ["Cidade", "Visitas"] });

  doc.save(reportFileName(data, "pdf"));
}

async function exportExcel(data: ManagementReportData) {
  const [{ default: ExcelJS }, assets] = await Promise.all([
    import("exceljs"),
    reportAssets(data.store.logoPath),
  ]);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = data.store.name;
  workbook.created = new Date(data.generatedAt);
  const logoId = workbook.addImage({ base64: assets.logo, extension: "jpeg" });
  const iconIds = Object.fromEntries(
    (Object.keys(assets.icons) as ReportIcon[]).map((key) => [key, workbook.addImage({ base64: assets.icons[key], extension: "png" })])
  ) as Record<ReportIcon, number>;

  const styleHeader = (sheet: InstanceType<typeof ExcelJS.Workbook>["worksheets"][number], icon: ReportIcon, columnCount: number) => {
    const endColumn = Math.max(columnCount, 6);
    sheet.mergeCells(1, 3, 1, endColumn);
    sheet.mergeCells(2, 3, 2, endColumn);
    for (let row = 1; row <= 3; row += 1) {
      for (let column = 1; column <= endColumn; column += 1) {
        sheet.getCell(row, column).fill = { type: "pattern", pattern: "solid", fgColor: { argb: PALETTE.dark.argb } };
      }
    }
    sheet.addImage(logoId, { tl: { col: 0.15, row: 0.1 }, ext: { width: 54, height: 54 } });
    sheet.addImage(iconIds[icon], { tl: { col: 1.35, row: 0.35 }, ext: { width: 34, height: 34 } });
    sheet.getCell("C1").value = data.store.name;
    sheet.getCell("C1").font = { bold: true, size: 16, color: { argb: "FFFFFFFF" } };
    sheet.getCell("C1").alignment = { vertical: "middle" };
    sheet.getCell("C2").value = `${data.overview.periodo.label} · gerado em ${dateTime(data.generatedAt)}`;
    sheet.getCell("C2").font = { size: 10, color: { argb: "FFD4D4D8" } };
    sheet.getRow(1).height = 25;
    sheet.getRow(2).height = 22;
    sheet.getRow(3).height = 10;
  };

  const addSheet = (options: {
    name: string;
    icon: ReportIcon;
    headers: string[];
    rows: CellValue[][];
    semantic?: "inventory" | "movement" | "order" | "performance" | "acquisition";
  }) => {
    const sheet = workbook.addWorksheet(options.name, {
      views: [{ state: "frozen", ySplit: 5 }],
      properties: { tabColor: { argb: SECTION_META[options.icon].tab } },
    });
    styleHeader(sheet, options.icon, options.headers.length);
    const headerRow = sheet.getRow(5);
    headerRow.values = options.headers;
    headerRow.height = 24;
    headerRow.eachCell((cell) => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: PALETTE.gold.argb } };
      cell.font = { bold: true, color: { argb: PALETTE.dark.argb } };
      cell.alignment = { vertical: "middle" };
      cell.border = { bottom: { style: "thin", color: { argb: PALETTE.dark.argb } } };
    });
    options.rows.forEach((row, rowIndex) => {
      const excelRow = sheet.addRow(row);
      if (rowIndex % 2 === 1) {
        excelRow.eachCell((cell) => {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: PALETTE.soft.argb } };
        });
      }
      excelRow.eachCell((cell) => {
        cell.border = { bottom: { style: "hair", color: { argb: PALETTE.line.argb } } };
        cell.alignment = { vertical: "middle" };
      });
      if (options.semantic === "inventory") {
        const quantity = Number(row[1]);
        const quantityCell = excelRow.getCell(2);
        quantityCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: quantity > 0 ? PALETTE.green.soft : PALETTE.red.soft } };
        quantityCell.font = { bold: true, color: { argb: quantity > 0 ? PALETTE.green.argb : PALETTE.red.argb } };
        const visibilityCell = excelRow.getCell(3);
        const visible = row[2] === "Na vitrine";
        visibilityCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: visible ? "FFFFF3CD" : PALETTE.gray.soft } };
        visibilityCell.font = { bold: true, color: { argb: visible ? PALETTE.gold.argb : PALETTE.gray.argb } };
        excelRow.getCell(4).numFmt = 'R$ #,##0.00;[Red]-R$ #,##0.00';
      }
      if (options.semantic === "movement") {
        excelRow.getCell(1).numFmt = "dd/mm/yyyy hh:mm";
        const color = movementColor(data.movements[rowIndex]?.type ?? "ajuste");
        for (const index of [3, 4]) {
          excelRow.getCell(index).fill = { type: "pattern", pattern: "solid", fgColor: { argb: color === PALETTE.green ? PALETTE.green.soft : color === PALETTE.red ? PALETTE.red.soft : PALETTE.blue.soft } };
          excelRow.getCell(index).font = { bold: true, color: { argb: color.argb } };
        }
      }
      if (options.semantic === "order") {
        excelRow.getCell(1).numFmt = "dd/mm/yyyy hh:mm";
        const status = data.orders[rowIndex]?.status;
        const color = status === "vendido" ? PALETTE.green : status === "atendimento" ? PALETTE.blue : status === "novo" ? PALETTE.gold : PALETTE.gray;
        excelRow.getCell(3).font = { bold: true, color: { argb: color.argb } };
        excelRow.getCell(3).fill = { type: "pattern", pattern: "solid", fgColor: { argb: color === PALETTE.green ? PALETTE.green.soft : color === PALETTE.blue ? PALETTE.blue.soft : color === PALETTE.gold ? "FFFFF3CD" : PALETTE.gray.soft } };
      }
      if (options.semantic === "performance") excelRow.getCell(4).numFmt = '0.0"%"';
    });
    sheet.columns.forEach((column) => {
      let width = 12;
      column.eachCell?.({ includeEmpty: true }, (cell) => {
        width = Math.min(45, Math.max(width, String(cell.value ?? "").length + 2));
      });
      column.width = width;
    });
    sheet.autoFilter = { from: { row: 5, column: 1 }, to: { row: 5, column: options.headers.length } };
    return sheet;
  };

  const summary = workbook.addWorksheet("Resumo", { properties: { tabColor: { argb: SECTION_META.summary.tab } } });
  styleHeader(summary, "summary", 9);
  summary.columns = Array.from({ length: 9 }, () => ({ width: 14 }));
  const cards = [
    ["Visitantes únicos", data.overview.visitantesUnicos, PALETTE.gold, "acquisition"],
    ["Contatos WhatsApp", data.overview.contatosWhatsAppUnicos, PALETTE.green, "movements"],
    ["Pedidos gerados", data.overview.pedidosEnviados, PALETTE.blue, "orders"],
    ["Conversão", `${data.overview.conversaoPedido.toLocaleString("pt-BR")}%`, PALETTE.gold, "performance"],
    ["Unidades em estoque", data.inventory.reduce((sum, moto) => sum + moto.stockQuantity, 0), PALETTE.green, "inventory"],
    ["Modelos sem estoque", data.inventory.filter((moto) => moto.stockQuantity === 0).length, PALETTE.red, "inventory"],
  ] as Array<[string, string | number, typeof PALETTE.gold, ReportIcon]>;
  cards.forEach(([label, value, color, icon], index) => {
    const startColumn = (index % 3) * 3 + 1;
    const startRow = Math.floor(index / 3) * 4 + 5;
    summary.mergeCells(startRow, startColumn, startRow, startColumn + 2);
    summary.mergeCells(startRow + 1, startColumn, startRow + 2, startColumn + 2);
    const labelCell = summary.getCell(startRow, startColumn);
    const valueCell = summary.getCell(startRow + 1, startColumn);
    labelCell.value = label;
    labelCell.font = { bold: true, color: { argb: color.argb } };
    valueCell.value = value;
    valueCell.font = { bold: true, size: 20, color: { argb: PALETTE.dark.argb } };
    summary.addImage(iconIds[icon], { tl: { col: startColumn + 1.9, row: startRow - 0.85 }, ext: { width: 25, height: 25 } });
    for (let row = startRow; row <= startRow + 2; row += 1) {
      for (let column = startColumn; column <= startColumn + 2; column += 1) {
        summary.getCell(row, column).fill = { type: "pattern", pattern: "solid", fgColor: { argb: color === PALETTE.red ? PALETTE.red.soft : color === PALETTE.green ? PALETTE.green.soft : color === PALETTE.blue ? PALETTE.blue.soft : "FFFFF3CD" } };
        summary.getCell(row, column).border = { left: { style: column === startColumn ? "medium" : undefined, color: { argb: color.argb } } };
      }
    }
  });

  const funnelStart = 14;
  summary.getCell(funnelStart, 1).value = "Funil comercial";
  summary.getCell(funnelStart, 1).font = { bold: true, size: 13, color: { argb: PALETTE.dark.argb } };
  const funnelHeader = summary.getRow(funnelStart + 1);
  funnelHeader.values = ["Etapa", "Sessões", "Conversão total (%)"];
  funnelHeader.eachCell((cell) => { cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: PALETTE.gold.argb } }; cell.font = { bold: true }; });
  data.overview.funil.forEach((item) => summary.addRow([item.etapa, item.sessoes ?? item.valor ?? 0, item.conversaoTotal ?? 0]));

  addSheet({ name: "Estoque", icon: "inventory", semantic: "inventory", headers: ["Modelo", "Saldo", "Visibilidade", "Preço"], rows: data.inventory.map((moto) => [moto.name, moto.stockQuantity, moto.active ? "Na vitrine" : "Oculta", moto.promoPrice ?? moto.numericPrice ?? "Sob consulta"]) });
  addSheet({ name: "Movimentações", icon: "movements", semantic: "movement", headers: ["Data", "Modelo", "Tipo", "Variação", "Saldo anterior", "Saldo novo", "Observação", "Responsável"], rows: data.movements.map((item) => [new Date(item.createdAt), item.motoName, MOVEMENT_LABEL[item.type], item.delta, item.previousQuantity, item.newQuantity, item.note, item.actorEmail]) });
  addSheet({ name: "Pedidos", icon: "orders", semantic: "order", headers: ["Data", "Modelo", "Status", "Pagamento", "Entrega", "Cidade"], rows: data.orders.map((item) => [new Date(item.createdAt), item.motoName, STATUS_LABEL[item.status], item.payment, item.delivery, item.city || "Não informada"]) });
  addSheet({ name: "Desempenho", icon: "performance", semantic: "performance", headers: ["Modelo", "Interessados", "Pedidos", "Conversão (%)"], rows: data.overview.modelosDesempenho.map((item) => [item.nome, item.interessados, item.pedidos, item.conversao]) });
  addSheet({ name: "Aquisição", icon: "acquisition", semantic: "acquisition", headers: ["Categoria", "Nome", "Visitas"], rows: [
    ...data.overview.origens.map((item) => ["Origem", item.origem, item.visitas] as CellValue[]),
    ...data.overview.cidades.map((item) => ["Cidade", item.cidade, item.visitas] as CellValue[]),
    ...data.overview.horarios.map((value, hour) => ["Horário", `${hour}h`, value] as CellValue[]),
  ] });

  for (const sheet of workbook.worksheets) {
    sheet.pageSetup = { orientation: "landscape", fitToPage: true, fitToWidth: 1, fitToHeight: 0, margins: { left: 0.25, right: 0.25, top: 0.5, bottom: 0.5, header: 0.2, footer: 0.2 } };
    sheet.headerFooter.oddFooter = `&L${data.store.name}&RPágina &P de &N`;
  }

  const buffer = await workbook.xlsx.writeBuffer();
  download(
    new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
    reportFileName(data, "xlsx")
  );
}
