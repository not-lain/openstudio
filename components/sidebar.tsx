"use client";

import { RotateCcw, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ObjectList } from "./object-list";
import { useState } from "react";

interface SidebarProps {
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
    onStartOver: () => void;
}

export function Sidebar({
    objects,
    onRemoveObject,
    onAddObject,
    selectedObjectIndex,
    setSelectedObjectIndex,
    videoUrl,
    onStartOver,
}: SidebarProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Desktop Sidebar */}
            <div className="hidden md:block w-[384px] bg-card border-r border-border relative">
                <div className="overflow-y-auto" style={{ height: "calc(100vh - 144px)" }}>
                    <div className="p-4 border-b border-border">
                        <p className="text-muted-foreground text-sm">
                            Adjust the selection of your object, or add additional objects.
                            Press "Track objects" to track your objects throughout the video.
                        </p>
                    </div>

                    <ObjectList
                        objects={objects}
                        onRemoveObject={onRemoveObject}
                        onAddObject={onAddObject}
                        selectedObjectIndex={selectedObjectIndex}
                        setSelectedObjectIndex={setSelectedObjectIndex}
                        videoUrl={videoUrl}
                    />
                </div>
                <div className="fixed bottom-0 w-[384px] p-4 border-t border-border bg-card flex justify-between items-center">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onStartOver}
                        className="flex items-center gap-2"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Start over
                    </Button>
                    <Button className="flex items-center gap-2">
                        Track objects
                    </Button>
                </div>
            </div>

            {/* Mobile Sidebar */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        className="fixed bottom-4 right-4 rounded-full md:hidden z-50"
                    >
                        {objects.length > 0 ? (
                            <span className="font-bold">{objects.length}</span>
                        ) : (
                            <Plus className="h-4 w-4" />
                        )}
                    </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[384px] p-0 bg-card">
                    <div className="overflow-y-auto" style={{ height: "calc(100vh - 144px)" }}>
                        <div className="p-4 border-b border-border">
                            <p className="text-muted-foreground text-sm">
                                Adjust the selection of your object, or add additional objects.
                                Press "Track objects" to track your objects throughout the video.
                            </p>
                        </div>

                        <ObjectList
                            objects={objects}
                            onRemoveObject={onRemoveObject}
                            onAddObject={onAddObject}
                            selectedObjectIndex={selectedObjectIndex}
                            setSelectedObjectIndex={setSelectedObjectIndex}
                            videoUrl={videoUrl}
                        />
                    </div>
                    <div className="fixed bottom-0 w-[384px] p-4 border-t border-border bg-card flex justify-between items-center">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onStartOver}
                            className="flex items-center gap-2"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Start over
                        </Button>
                        <Button className="flex items-center gap-2">
                            Track objects
                        </Button>
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}