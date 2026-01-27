import React, { useState } from 'react';
import { Document, pdfjs } from 'react-pdf';
import { PDFPage } from './PDFPage';
import type { Modification, ToolType } from '../types';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
    file: File | null;
    activeTool: ToolType;
    modifications: Modification[];
    onAddModification: (mod: Modification) => void;
    onUpdateModification: (id: string, updates: Partial<Modification>) => void;
    onDeleteModification: (id: string) => void;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({
    file,
    activeTool,
    modifications,
    onAddModification,
    onUpdateModification,
    onDeleteModification
}) => {
    const [numPages, setNumPages] = useState<number>(0);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState<number | undefined>(undefined);

    React.useEffect(() => {
        if (!containerRef.current) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setContainerWidth(entry.contentRect.width);
            }
        });

        resizeObserver.observe(containerRef.current);

        return () => {
            resizeObserver.disconnect();
        };
    }, []);

    if (!file) return null;

    return (
        <div className="flex flex-col items-center gap-8 py-8 w-full" ref={containerRef}>
            <Document
                file={file}
                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                className="flex flex-col gap-8 w-full items-center"
            >
                {Array.from(new Array(numPages), (_el, index) => (
                    <PDFPage
                        key={`page_${index + 1}`}
                        pageNumber={index + 1}
                        activeTool={activeTool}
                        modifications={modifications}
                        onAddModification={onAddModification}
                        onUpdateModification={onUpdateModification}
                        onDeleteModification={onDeleteModification}
                        width={containerWidth ? Math.min(containerWidth, 1200) : undefined} // Cap width nicely but fairly large
                    />
                ))}
            </Document>
        </div>
    );
};
