/**
 * PDF writer for printables. jsPDF is imported dynamically here, so it is
 * fetched only when a grown-up taps "Make PDF" — never on first load.
 * Vector output, built-in Helvetica (no font downloads, no network).
 */
import { PAPERS, type Page, type PaperId } from "./printables";

export async function renderPdf(pages: Page[], paper: PaperId, compress = true): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const size = PAPERS[paper];
  const doc = new jsPDF({ unit: "pt", format: [size.w, size.h], orientation: "portrait", compress });
  doc.setDrawColor(0);
  doc.setFillColor(0);
  doc.setTextColor(0);
  doc.setLineCap("round");
  doc.setLineJoin("round");
  pages.forEach((page, i) => {
    if (i > 0) doc.addPage([size.w, size.h], "portrait");
    for (const op of page.ops) {
      if (op.t === "path") {
        doc.setLineWidth(op.width);
        doc.setLineDashPattern(op.dash ?? [], 0);
        const [first, ...rest] = op.pts;
        if (!first) continue;
        let prev = first;
        const deltas = rest.map((p) => {
          const d: [number, number] = [p.x - prev.x, p.y - prev.y];
          prev = p;
          return d;
        });
        doc.lines(deltas, first.x, first.y, [1, 1], "S", !!op.closed);
        doc.setLineDashPattern([], 0);
      } else if (op.t === "dot") {
        doc.setLineDashPattern([], 0);
        if (op.fill) doc.circle(op.x, op.y, op.r, "F");
        else {
          doc.setLineWidth(op.width ?? 2);
          doc.circle(op.x, op.y, op.r, "S");
        }
      } else if (op.t === "rrect") {
        doc.setLineDashPattern([], 0);
        doc.setLineWidth(op.width);
        doc.roundedRect(op.x, op.y, op.w, op.h, op.r, op.r, "S");
      } else {
        doc.setFont("helvetica", op.bold ? "bold" : "normal");
        doc.setFontSize(op.size);
        doc.text(op.text, op.x, op.y, { align: op.align ?? "left" });
      }
    }
  });
  return doc.output("blob");
}
