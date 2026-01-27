import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import type { Modification } from '../types';

export const savePDF = async (file: File, modifications: Modification[]) => {
    const existingPdfBytes = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    const pages = pdfDoc.getPages();
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    for (const mod of modifications) {
        const pageIndex = mod.page - 1;
        if (pageIndex < 0 || pageIndex >= pages.length) continue;

        const page = pages[pageIndex];
        const { height } = page.getSize();

        if (mod.type === 'text') {
            // Coordinate conversion: DOM (top-left) to PDF (bottom-left)
            // DOM: x, y is top-left of the input
            // PDF: x, y is bottom-left of the text baseline
            // Approx: y_pdf = height - y_dom - fontSize

            const fontSize = 18; // Matching the UI
            const x = mod.x * page.getWidth();
            const y = mod.y * page.getHeight();

            page.drawText(mod.content, {
                x: x,
                y: height - y - (fontSize * 0.75), // Adjust for baseline roughly
                size: fontSize,
                font: helveticaFont,
                color: rgb(0, 0, 0),
            });
        } else if (mod.type === 'signature') {
            // mod.content is Data URL
            if (!mod.content.startsWith('data:image')) continue;

            try {
                const pngImage = await pdfDoc.embedPng(mod.content);
                const { width, height: imgHeight } = pngImage.scale(0.5); // align with visual scale

                // DOM: x, y is top-left
                // PDF: x, y is bottom-left
                const x = mod.x * page.getWidth();
                const y = mod.y * page.getHeight();

                page.drawImage(pngImage, {
                    x: x,
                    y: height - y - imgHeight,
                    width,
                    height: imgHeight,
                });
            } catch (e) {
                // If PNG fails, try JPEG? Or it might be SVG data URL?
                // Our placeholder was SVG. pdf-lib DOES NOT SUPPORT SVG embedding directly.
                // We need to convert SVG to PNG or use PNG for signature.
                // For now, I will switch the placeholder to a PNG data URL in the next step or handle SVG conversion.
                // Let's assume for this step we will fix the placeholder to be PNG or handle it.
                console.error("Error embedding signature", e);
            }
        }
    }

    const pdfBytes = await pdfDoc.save();
    // Fix for strict TS: use buffer or cast
    const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `edited_${file.name}`;
    link.click();
};
