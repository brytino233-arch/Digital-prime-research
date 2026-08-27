import { jsPDF } from "jspdf";
import "jspdf-autotable";
import type { ProofPackPage } from "./generators";

export function exportToPDF(pages: ProofPackPage[], prospectName: string) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const primaryColor = [212, 175, 55]; // Digital Prime Gold
  const secondaryColor = [0, 0, 0]; // Black

  pages.forEach((page, index) => {
    if (index > 0) doc.addPage();

    // Branding/Header
    doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.rect(0, 0, 210, 20, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text("Digital Prime Research", 10, 12);
    doc.text(`Page ${page.page}`, 190, 12);

    // Title/Heading
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text(page.title, 10, 40);
    doc.setFontSize(18);
    doc.setFont("helvetica", "normal");
    doc.text(page.heading, 10, 50);

    // Copy
    doc.setFontSize(12);
    const splitCopy = doc.splitTextToSize(page.copy, 190);
    doc.text(splitCopy, 10, 70);

    // Evidence Table
    if (page.evidence && page.evidence.length > 0) {
      (doc as any).autoTable({
        startY: 120,
        head: [['Claim', 'Source', 'Date']],
        body: page.evidence.map(e => [e.claim, e.source, e.date]),
        theme: 'striped',
        headStyles: { fillColor: primaryColor as any },
      });
    }

    // Footer
    doc.setFontSize(8);
    doc.text("© 2026 Digital Prime Research. Internal document.", 10, 285);
  });

  doc.save(`${prospectName.replace(" (demo)", "")}_ProofPack.pdf`);
}
