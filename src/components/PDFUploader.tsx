import React, { useCallback } from 'react';
import { FileText } from 'lucide-react';
import { clsx } from 'clsx';

interface PDFUploaderProps {
    onUpload: (file: File) => void;
}

export const PDFUploader: React.FC<PDFUploaderProps> = ({ onUpload }) => {
    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file && file.type === 'application/pdf') {
                onUpload(file);
            }
        },
        [onUpload]
    );

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file && file.type === 'application/pdf') {
                onUpload(file);
            }
        },
        [onUpload]
    );

    return (
        <div
            className={clsx(
                "border-2 border-dashed border-gray-300 rounded-lg p-12",
                "flex flex-col items-center justify-center text-center",
                "hover:border-blue-500 hover:bg-blue-50 transition-colors cursor-pointer"
            )}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
        >
            <div className="bg-blue-100 p-4 rounded-full mb-4">
                <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Upload your PDF
            </h3>
            <p className="text-gray-500 mb-6">
                Drag and drop your PDF file here, or click to browse
            </p>
            <label className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg cursor-pointer transition-colors">
                Choose File
                <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={handleChange}
                />
            </label>
        </div>
    );
};
