"use client";

import { Plus } from "lucide-react";
import ObjectSelection from "./object-selection";

interface ObjectListProps {
    objects: Array<{
        id: number;
        name: string;
        thumbnail: string;
        points: Array<{ x: number; y: number; frameNumber: number; isAddMode: boolean }>;
        boundingBoxes: Array<{ x: number; y: number; width: number; height: number; frameNumber: number; isAddMode: boolean }>;
        isAddMode?: boolean;
    }>;
    onRemoveObject: (id: number) => void;
    onAddObject: () => void;
    selectedObjectIndex: number | null;
    setSelectedObjectIndex: (index: number) => void;
    videoUrl: string | null;
}

export function ObjectList({
    objects,
    onRemoveObject,
    onAddObject,
    selectedObjectIndex,
    setSelectedObjectIndex,
    videoUrl
}: ObjectListProps) {
    return (
        <div className="pt-4 px-4 space-y-4">
            {objects.map((object, index) => (
                <ObjectSelection
                    key={object.id}
                    object={object}
                    onRemove={() => onRemoveObject(object.id)}
                    showDeleteButton={true}
                    onSelect={() => setSelectedObjectIndex(index)}
                    isSelected={selectedObjectIndex === index}
                />
            ))}

            {objects.length === 0 && (
                <div className="text-center p-4 text-muted-foreground">
                    No objects selected. Click the "Add another object" button below to get started.
                </div>
            )}

            <button
                onClick={onAddObject}
                disabled={!videoUrl}
                className={`w-full h-16 border border-border rounded-md flex items-center justify-center gap-2 transition-colors mb-16 ${videoUrl ? 'hover:bg-muted text-foreground' : 'opacity-50 cursor-not-allowed'
                    }`}
            >
                <Plus className="w-5 h-5" />
                <span>Add another object</span>
            </button>
        </div>
    );
}