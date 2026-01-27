import React, { useRef } from 'react';
import { Page } from 'react-pdf';
import type { ToolType, Modification } from '../types';
import { X, GripVertical } from 'lucide-react';

interface PDFPageProps {
    pageNumber: number;
    activeTool: ToolType;
    modifications: Modification[];
    onAddModification: (mod: Modification) => void;
    onUpdateModification: (id: string, updates: Partial<Modification>) => void;
    onDeleteModification: (id: string) => void;
    width?: number; // New prop for responsive width
}

export const PDFPage: React.FC<PDFPageProps> = ({
    pageNumber,
    activeTool,
    modifications,
    onAddModification,
    onUpdateModification,
    onDeleteModification,
    width,
}) => {
    const pageRef = useRef<HTMLDivElement>(null);
    const [draggingId, setDraggingId] = React.useState<string | null>(null);

    const handlePageClick = (e: React.MouseEvent) => {
        if (activeTool === 'select' || activeTool === 'signature') return;

        if (!pageRef.current) return;
        const rect = pageRef.current.getBoundingClientRect();

        // Calculate relative coordinates (0-1)
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;

        if (activeTool === 'text') {
            onAddModification({
                id: crypto.randomUUID(),
                type: 'text',
                page: pageNumber,
                x,
                y,
                content: 'New Text',
            });
        } else if (activeTool === 'signature') {
            const signatureDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH5gIeEw4zQD0/kQAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAABJ0lEQVR42u3dQW7DQAwEwMz/f10vCtqTbFkUCTz2BWIAs6v+x1x778/+/X79jK/Xz/h6/Yyv18/4ev2Mr9fP+Hr9jK/Xz/h6/Yyv18/4ev2Mr9fP+Hr9jK/Xz/h6/Yyv18/4ev2Mr9fP+Hr9jK/Xz/h6/Yyv18/4ev2Mr9fP+Hr9jK/Xz/h6/Yyv18/4ev2Mr9fP+Hr9jK/Xz/h6/Yyv18/4ev2Mr9fP+Hr9jK/Xz/h6/Yyv18/4ev2Mr9fP+Hr9jK/Xz/h6/Yyv18/4ev2Mr9fP+Hr9jK/Xz/h6/Yyv18/4ev2Mr9fP+Hr9jK/Xz/h6/Yyv18/4ev2Mr9fP+Hr9jK/Xz/h6/Yyv18/4ev2Mr9fP+Hr9jK/Xz/h6/Yyv18/4ev2Mr9fP+Hr9jK/Xz/h6/Yyv18/4ev2Mr9fP+Pr9/gE/w0R1tQ+lOQAAAABJRU5ErkJggg==';
            onAddModification({
                id: crypto.randomUUID(),
                type: 'signature',
                page: pageNumber,
                x,
                y,
                content: signatureDataUrl,
            });
        }
    };

    const handleMouseDown = (e: React.MouseEvent, modId: string) => {
        if (activeTool !== 'select') return;
        e.stopPropagation();
        setDraggingId(modId);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!draggingId || !pageRef.current) return;

        const rect = pageRef.current.getBoundingClientRect();

        // Calculate relative coordinates (0-1)
        // Clamp to 0-1 to keep inside page
        const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

        onUpdateModification(draggingId, { x, y });
    };

    const handleMouseUp = () => {
        setDraggingId(null);
    };

    const pageMods = modifications.filter(m => m.page === pageNumber);

    return (
        <div
            ref={pageRef}
            className="relative mb-4 shadow-md inline-block"
            onClick={handlePageClick}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            <Page
                pageNumber={pageNumber}
                className="bg-white"
                renderTextLayer={false}
                renderAnnotationLayer={false}
                width={width} // Pass width to react-pdf for scaling
            />

            {/* Overlay Layer */}
            {pageMods.map((mod) => (
                <div
                    key={mod.id}
                    style={{
                        position: 'absolute',
                        left: `${mod.x * 100}%`, // Convert relative to percentage
                        top: `${mod.y * 100}%`,
                        transform: 'translate(0, -50%)',
                    }}
                    className="group"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Drag Handle */}
                    {activeTool === 'select' && (
                        <div
                            className="absolute -left-6 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing p-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-100 rounded shadow-sm hover:bg-gray-200"
                            onMouseDown={(e) => handleMouseDown(e, mod.id)}
                        >
                            <GripVertical size={16} className="text-gray-500" />
                        </div>
                    )}

                    {mod.type === 'text' ? (
                        <input
                            type="text"
                            value={mod.content}
                            onChange={(e) => onUpdateModification(mod.id, { content: e.target.value })}
                            className="bg-transparent border border-transparent hover:border-blue-300 focus:border-blue-500 outline-none p-1 text-lg font-sans text-gray-800"
                            autoFocus
                        />
                    ) : (
                        <div
                            className="relative border border-transparent hover:border-blue-300 cursor-move"
                            onMouseDown={(e) => activeTool === 'select' && handleMouseDown(e, mod.id)}
                        >
                            <img
                                src={mod.content}
                                alt="Signature"
                                className="h-12 pointer-events-none"
                            />
                        </div>
                    )}

                    {activeTool === 'select' && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDeleteModification(mod.id);
                            }}
                            className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X size={12} />
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
};
