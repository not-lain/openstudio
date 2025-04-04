"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
    videoUrl: string;
    videoRef: React.RefObject<HTMLVideoElement | null>;  // Updated type
    onTimeUpdate: () => void;
    onLoadedMetadata: () => void;
    onClick: (e: React.MouseEvent<HTMLVideoElement>) => void;
    onMouseDown: (e: React.MouseEvent<HTMLVideoElement>) => void;
    onMouseMove: (e: React.MouseEvent<HTMLVideoElement>) => void;
    onMouseUp: (e: React.MouseEvent<HTMLVideoElement>) => void;
    onRemoveVideo: () => void;
    isDrawing: boolean;
    startPoint: { x: number; y: number } | null;
    endPoint: { x: number; y: number } | null;
    boundingBoxes: Array<{
        x: number;
        y: number;
        width: number;
        height: number;
    }>;
}

export function VideoPlayer({
    videoUrl,
    videoRef,
    onTimeUpdate,
    onLoadedMetadata,
    onClick,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onRemoveVideo,
    isDrawing,
    startPoint,
    endPoint,
    boundingBoxes,
}: VideoPlayerProps) {
    const [videoDimensions, setVideoDimensions] = React.useState({ width: 0, height: 0 });

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setVideoDimensions({
                width: videoRef.current.videoWidth,
                height: videoRef.current.videoHeight
            });
        }
        onLoadedMetadata();
    };

    return (
        <div
            className="relative"
            style={{
                width: videoDimensions.width > 0 ? `${videoDimensions.width}px` : '100%',
                height: videoDimensions.height > 0 ? `${videoDimensions.height}px` : '100%'
            }}
        >
            {/* Background div that prevents interactions */}
            <div
                className="absolute inset-0 bg-black/5 pointer-events-auto z-0"
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onMouseMove={(e) => e.stopPropagation()}
                onMouseUp={(e) => e.stopPropagation()}
            />
            <video
                ref={videoRef}
                src={videoUrl}
                className="absolute inset-0 w-full h-full object-contain bg-card z-10"
                onTimeUpdate={onTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onClick={onClick}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
            />
            {boundingBoxes.map((box, index) => (
                <div
                    key={index}
                    className="absolute border-2 border-primary pointer-events-none z-20"
                    style={{
                        left: `${box.x}px`,
                        top: `${box.y}px`,
                        width: `${box.width}px`,
                        height: `${box.height}px`,
                    }}
                />
            ))}
            {isDrawing && startPoint && endPoint && (
                <div
                    className="absolute border-2 border-primary pointer-events-none z-20"
                    style={{
                        left: `${Math.min(startPoint.x, endPoint.x)}px`,
                        top: `${Math.min(startPoint.y, endPoint.y)}px`,
                        width: `${Math.abs(endPoint.x - startPoint.x)}px`,
                        height: `${Math.abs(endPoint.y - startPoint.y)}px`,
                    }}
                />
            )}
            <div className={cn(
                "absolute top-4 right-4 flex gap-2 z-30",
                "transition-opacity duration-200",
                "opacity-0 group-hover:opacity-100 focus-within:opacity-100"
            )}>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={onRemoveVideo}
                    className="rounded-full bg-background/20 backdrop-blur-sm border-0 hover:bg-background/30"
                >
                    <X className="w-4 h-4" />
                    <span className="sr-only">Remove video</span>
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full bg-background/20 backdrop-blur-sm border-0 hover:bg-background/30"
                >
                    <span className="sr-only">Info</span>
                    <span className="text-lg">ⓘ</span>
                </Button>
            </div>
        </div>
    );
}