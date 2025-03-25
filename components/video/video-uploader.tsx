"use client";

import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoUploaderProps {
    onFileSelect: (file: File) => void;
    fileInputRef: React.RefObject<HTMLInputElement | null>;  // Updated type
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
    onFileInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function VideoUploader({
    onFileSelect,
    fileInputRef,
    onDragOver,
    onDrop,
    onFileInput,
}: VideoUploaderProps) {
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <div className="text-center max-w-md w-full px-4">
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-2">
                    Drag and drop a video file here
                </p>
                <p className="text-muted-foreground text-sm">or</p>
                <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2 w-full sm:w-auto"
                >
                    Select a video file
                </Button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={onFileInput}
                    className="hidden"
                />
            </div>
        </div>
    );
}