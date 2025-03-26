"use client";

import { Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import VideoTimeline from "@/components/video-timeline";
import { ScrollArea } from "@/components/ui/scroll-area";

interface VideoControlsProps {
    isPlaying: boolean;
    currentTime: string;
    duration: number;
    currentTimeSeconds: number;
    togglePlayPause: () => void;
    objects: Array<{
        id: number;
        name: string;
        thumbnail: string;
        points: Array<{ x: number; y: number; frameNumber: number; isAddMode: boolean }>;
        boundingBoxes: Array<{ x: number; y: number; width: number; height: number; frameNumber: number; isAddMode: boolean }>;
        isAddMode?: boolean;
        color: string;
    }>;
    onSeek: (value: number[]) => void;
    videoURL: string | null;
    setIsPlaying: (playing: boolean) => void;
}

export function VideoControls({
    isPlaying,
    currentTime,
    duration,
    currentTimeSeconds,
    togglePlayPause,
    objects,
    onSeek,
    videoURL,
    setIsPlaying,
}: VideoControlsProps) {
    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
    };

    return (
        <ScrollArea className="h-full">
            <div className="p-4 border-t border-border bg-card">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={togglePlayPause}
                            className="rounded-full"
                        >
                            {isPlaying ? (
                                <Pause className="w-4 h-4" />
                            ) : (
                                <Play className="w-4 h-4" />
                            )}
                            <span className="sr-only">
                                {isPlaying ? "Pause" : "Play"}
                            </span>
                        </Button>
                        <span className="text-sm text-foreground">{currentTime}</span>
                        <span className="text-sm text-muted-foreground">/</span>
                        <span className="text-sm text-foreground">{formatTime(duration)}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <VideoTimeline
                            objects={objects}
                            currentTime={currentTimeSeconds}
                            duration={duration}
                            onSeek={onSeek}
                            videoURL={videoURL}
                            setIsPlaying={setIsPlaying}
                        />
                    </div>
                </div>
            </div>
        </ScrollArea>
    );
}