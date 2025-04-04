import { useEffect, useRef, useState } from "react";
import { PlayheadControl } from './playhead-control';
import { Progress } from "./ui/progress";
import { ScrollArea } from "./ui/scroll-area";

interface VideoTimelineProps {
  objects: {
    id: number;
    name: string;
    thumbnail: string;
    color: string;
  }[];
  currentTime: number;
  duration: number;
  onSeek: (value: number[]) => void;
  videoURL: string | null;
  setIsPlaying: (playing: boolean) => void;
}

export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export default function VideoTimeline({
  objects,
  currentTime,
  duration,
  onSeek,
  videoURL,
  setIsPlaying,
}: VideoTimelineProps) {
  // Generate 15 frames for the timeline
  const frames = Array.from({ length: 15 }, (_, i) => i);
  const [frameImages, setFrameImages] = useState<string[]>([]);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localPlayheadPosition, setLocalPlayheadPosition] = useState<number | null>(null);

  // Add reset function
  const resetTimeline = () => {
    setFrameImages([]);
    setLocalPlayheadPosition(null);
    setIsDragging(false);
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.src = "";
      videoRef.current = null;
    }
    onSeek([0]);
  };

  // Generate frame previews when video changes
  useEffect(() => {
    if (!videoURL) {
      resetTimeline();
      return;
    }

    if (!duration) return;

    const video = document.createElement("video");
    video.src = videoURL;
    videoRef.current = video;

    video.addEventListener("loadedmetadata", async () => {
      const newFrameImages: string[] = [];

      for (let i = 0; i < frames.length; i++) {
        const timePosition = (i / (frames.length - 1)) * video.duration;
        video.currentTime = timePosition;

        await new Promise<void>((resolve) => {
          const seekHandler = () => {
            resolve();
            video.removeEventListener("seeked", seekHandler);
          };
          video.addEventListener("seeked", seekHandler);
        });

        const canvas = document.createElement("canvas");
        canvas.width = 160;
        canvas.height = 90;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          newFrameImages.push(canvas.toDataURL("image/jpeg", 0.7));
        }
      }

      setFrameImages(newFrameImages);
    });

    video.load();

    return () => {
      resetTimeline();
    };
  }, [videoURL, duration]);

  useEffect(() => {
    if (!isDragging) {
      setLocalPlayheadPosition(null);
    }
  }, [currentTime, isDragging]);

  const handleTimelineInteraction = (clientX: number) => {
    if (!timelineRef.current || !duration) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const offsetX = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = offsetX / rect.width;
    setLocalPlayheadPosition(percentage * 100);
    const newTime = percentage * duration;
    onSeek([newTime]);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleTimelineInteraction(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      handleTimelineInteraction(e.clientX);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setLocalPlayheadPosition(null);
  };

  useEffect(() => {
    if (isDragging) {
      const onGlobalMouseMove = (e: MouseEvent) => {
        handleTimelineInteraction(e.clientX);
      };

      const onGlobalMouseUp = () => {
        setIsDragging(false);
        setLocalPlayheadPosition(null);
      };

      window.addEventListener("mousemove", onGlobalMouseMove, {
        passive: true,
      });
      window.addEventListener("mouseup", onGlobalMouseUp);

      return () => {
        window.removeEventListener("mousemove", onGlobalMouseMove);
        window.removeEventListener("mouseup", onGlobalMouseUp);
      };
    }
  }, [isDragging, duration]);

  const playheadPosition =
    isDragging && localPlayheadPosition !== null
      ? localPlayheadPosition
      : duration > 0
        ? Math.min((currentTime / duration) * 100, 100)
        : 0;

  const handleTimeChange = (time: number) => {
    if (!isDragging && duration > 0) {
      const newPosition = (time / duration) * 100;
      setLocalPlayheadPosition(newPosition);
    }
  };

  return (
    <div className="flex-1" ref={containerRef}>
      <div className="relative mt-4">
        <div className="flex flex-col h-full">
          {videoURL ? (
            <>
              {duration > 0 && (
                <div className="relative">
                  <div
                    ref={timelineRef}
                    className="relative h-16 bg-muted rounded-md overflow-hidden cursor-col-resize select-none"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                  >
                    <div className="h-full flex">
                      {frames.map((frame, index) => {
                        const frameImage = frameImages[index];
                        const objectIndex = Math.floor(
                          (frame / frames.length) * objects.length
                        );
                        const object = objects[objectIndex];

                        return (
                          <div
                            key={frame}
                            className="flex-1 border-r border-border relative"
                          >
                            <div
                              className="w-full h-full bg-cover bg-center opacity-70 hover:opacity-100 transition-opacity"
                              style={{
                                backgroundImage: frameImage
                                  ? `url(${frameImage})`
                                  : object?.thumbnail
                                    ? `url(${object.thumbnail})`
                                    : "none",
                                backgroundColor: frameImage || object?.thumbnail
                                  ? "transparent"
                                  : "hsl(var(--muted))",
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <PlayheadControl
                    position={playheadPosition}
                    isDragging={isDragging}
                    duration={duration}
                    onDragStart={() => setIsDragging(true)}
                    currentTime={currentTime}
                    onTimeChange={handleTimeChange}
                    isPlaying={!isDragging && currentTime < duration}
                  />
                </div>
              )}
              <ScrollArea className="flex-1 mt-4 border rounded-md">
                <div className="p-4">
                  <div className="flex flex-col gap-3">
                    {objects.map((object, index) => (
                      <div key={object.id} className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-foreground w-1/4">{object.name}</span>
                          <Progress
                            className="w-3/4 h-1 rounded-full bg-muted"
                            style={{ backgroundColor: object.color, opacity: 0.5 }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollArea>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
