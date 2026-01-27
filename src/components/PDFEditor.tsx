import React, { useState } from 'react';
import { PDFUploader } from './PDFUploader';
import { PDFViewer } from './PDFViewer';
import { EditorToolbar } from './EditorToolbar';
import type { ToolType, Modification } from '../types';
import { savePDF } from '../utils/pdfUtils';

export const PDFEditor: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [activeTool, setActiveTool] = useState<ToolType>('select');
    const [modifications, setModifications] = useState<Modification[]>([]);

    const handleUpload = (uploadedFile: File) => {
        setFile(uploadedFile);
        setModifications([]); // Reset mods on new file
    };

    const handleDownload = async () => {
        if (!file) return;
        try {
            await savePDF(file, modifications);
        } catch (error) {
            console.error("Failed to save PDF", error);
            alert("Failed to save PDF. See console for details.");
        }
    };

    const addModification = (mod: Modification) => {
        setModifications(prev => [...prev, mod]);
        setActiveTool('select'); // Switch back to select after adding
    };

    const updateModification = (id: string, updates: Partial<Modification>) => {
        setModifications(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
    };

    const deleteModification = (id: string) => {
        setModifications(prev => prev.filter(m => m.id !== id));
    };

    return (
        <div className="min-h-screen bg-gray-100 pb-24">
            <div className="w-full max-w-[1920px] mx-auto px-4 py-8">
                <header className="mb-4 flex justify-between items-center sticky top-0 z-10 bg-gray-100/90 backdrop-blur-sm py-4">
                    <h1 className="text-3xl font-bold text-gray-900">PDF Editor</h1>
                    {file && (
                        <button
                            onClick={() => setFile(null)}
                            className="text-sm text-red-600 hover:text-red-800 font-medium px-4 py-2 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            Reset
                        </button>
                    )}
                </header>

                {!file ? (
                    <div className="mt-12">
                        <PDFUploader onUpload={handleUpload} />
                    </div>
                ) : (
                    <>
                        <PDFViewer
                            file={file}
                            activeTool={activeTool}
                            modifications={modifications}
                            onAddModification={addModification}
                            onUpdateModification={updateModification}
                            onDeleteModification={deleteModification}
                        />

                        <EditorToolbar
                            activeTool={activeTool}
                            onToolSelect={setActiveTool}
                            onDownload={handleDownload}
                        />
                    </>
                )}
            </div>
        </div>
    );
};
