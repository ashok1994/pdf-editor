export type ToolType = 'select' | 'text' | 'signature';

export interface Modification {
    id: string;
    type: 'text' | 'signature';
    page: number; // 1-indexed
    x: number; // Relative coordinates (0-1)
    y: number; // Relative coordinates (0-1)
    content: string; // Text content or Image Data URL
    scale?: number;
}
