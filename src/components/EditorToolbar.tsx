import React from 'react';
import { Type, PenTool, MousePointer2, Download } from 'lucide-react';
import type { ToolType } from '../types';
import { clsx } from 'clsx';

interface EditorToolbarProps {
    activeTool: ToolType;
    onToolSelect: (tool: ToolType) => void;
    onDownload: () => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
    activeTool,
    onToolSelect,
    onDownload
}) => {
    const tools = [
        { type: 'select', icon: MousePointer2, label: 'Select' },
        { type: 'text', icon: Type, label: 'Text' },
        { type: 'signature', icon: PenTool, label: 'Signature' },
    ] as const;

    return (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-white rounded-full shadow-xl px-6 py-3 flex items-center gap-4 z-50 border border-gray-100">
            {tools.map((tool) => (
                <button
                    key={tool.type}
                    onClick={() => onToolSelect(tool.type as ToolType)}
                    className={clsx(
                        "p-3 rounded-full transition-all duration-200 flex flex-col items-center gap-1 min-w-[4rem]",
                        activeTool === tool.type
                            ? "bg-blue-600 text-white shadow-md scale-105"
                            : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                    )}
                >
                    <tool.icon className="w-5 h-5" />
                    <span className="text-xs font-medium">{tool.label}</span>
                </button>
            ))}

            <div className="w-px h-8 bg-gray-200 mx-2" />

            <button
                onClick={onDownload}
                className="p-3 rounded-full bg-green-600 text-white hover:bg-green-700 transition-colors shadow-md flex flex-col items-center gap-1 min-w-[4rem]"
            >
                <Download className="w-5 h-5" />
                <span className="text-xs font-medium">Save</span>
            </button>
        </div>
    );
};
