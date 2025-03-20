import { useEffect, useRef, useState } from "react";
import { PlayheadControl } from './playhead-control';

interface VideoTimelineProps {
  objects: {
    id: number;
    name: string;
    thumbnail: string;
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
  const [localPlayheadPosition, setLocalPlayheadPosition] = useState<
    number | null
  >(null);

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
    onSeek([0]); // Reset video time to 0
  };

  useEffect(() => {
    if (!videoURL) {
      resetTimeline();
      return;
    }

    if (!duration) return;

    // Create a video element for extracting frames
    const video = document.createElement("video");
    video.src = videoURL;
    videoRef.current = video;

    // Load metadata to ensure duration is available
    video.addEventListener("loadedmetadata", async () => {
      // Generate frames once metadata is loaded
      const newFrameImages: string[] = [];

      for (let i = 0; i < frames.length; i++) {
        // Calculate the time position for this frame
        const timePosition = (i / (frames.length - 1)) * video.duration;

        // Seek to the time position
        video.currentTime = timePosition;

        // Wait for the seek to complete
        await new Promise<void>((resolve) => {
          const seekHandler = () => {
            resolve();
            video.removeEventListener("seeked", seekHandler);
          };
          video.addEventListener("seeked", seekHandler);
        });

        // Capture the frame
        const canvas = document.createElement("canvas");
        canvas.width = 160; // Set width appropriate for timeline
        canvas.height = 90; // Set height using 16:9 aspect ratio
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

  // Reset local playhead position when currentTime changes from external source
  useEffect(() => {
    if (!isDragging) {
      setLocalPlayheadPosition(null);
    }
  }, [currentTime, isDragging]);

  // Handle timeline click and dragging with improved performance
  const handleTimelineInteraction = (clientX: number) => {
    if (!timelineRef.current || !duration) return;

    const rect = timelineRef.current.getBoundingClientRect();

    // Calculate position, clamped to the timeline width
    const offsetX = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = offsetX / rect.width;

    // Update local position immediately for smooth UI
    setLocalPlayheadPosition(percentage * 100);

    // Update the video position
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
    setLocalPlayheadPosition(null); // Clear local position to use currentTime again
  };

  useEffect(() => {
    // Add global mouse event listeners for dragging
    if (isDragging) {
      const onGlobalMouseMove = (e: MouseEvent) => {
        // Continue tracking horizontal movement even if cursor is outside timeline vertically
        handleTimelineInteraction(e.clientX);
      };

      const onGlobalMouseUp = () => {
        setIsDragging(false);
        setLocalPlayheadPosition(null); // Clear local position to use currentTime again
      };

      // Add listeners to window to track cursor outside of component
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

  // Calculate playhead position as percentage - use local position while dragging for smoother UI
  const playheadPosition = 
    isDragging && localPlayheadPosition !== null
      ? localPlayheadPosition
      : duration > 0
      ? Math.min((currentTime / duration) * 100, 100) // Ensure we don't exceed 100%
      : 0;

  // Add handler for time updates
  const handleTimeChange = (time: number) => {
    if (!isDragging && duration > 0) {
      const newPosition = (time / duration) * 100;
      setLocalPlayheadPosition(newPosition);
    }
  };

  return (
    <div className="flex-1" ref={containerRef}>
      <div className="relative mt-4">
        {videoURL ? (
          <>
            {/* Timeline scrubber with video frames */}
            {duration > 0 && (
              <div
                ref={timelineRef}
                className="relative h-16 bg-gray-800 rounded-md overflow-hidden cursor-col-resize select-none"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
              >
                {/* Frame display */}
                <div className="h-full flex">
                  {frames.map((frame, index) => {
                    const frameImage = frameImages[index];
                    // Fall back to object thumbnail if frame not available yet
                    const objectIndex = Math.floor(
                      (frame / frames.length) * objects.length
                    );
                    const object = objects[objectIndex];

                    return (
                      <div
                        key={frame}
                        className="flex-1 border-r border-gray-700 relative"
                      >
                        <div
                          className="w-full h-full bg-cover bg-center opacity-70 hover:opacity-100 transition-opacity"
                          style={{
                            backgroundImage: frameImage
                              ? `url(${frameImage})`
                              : object?.thumbnail
                              ? `url(${object.thumbnail})`
                              : "none",
                            backgroundColor:
                              frameImage || object?.thumbnail
                                ? "transparent"
                                : "#1f2937",
                          }}
                        />
                      </div>
                    );
                  })}
                </div>

                <PlayheadControl
                  position={playheadPosition}
                  isDragging={isDragging}
                  duration={duration}
                  onDragStart={() => setIsDragging(true)}
                  currentTime={currentTime}
                  onTimeChange={handleTimeChange}
                />
              </div>
            )}

            {/* Object indicators */}
            <div className="mt-2 flex items-center gap-2">
              {objects.map((object) => (
                <div key={object.id} className="flex items-center gap-2">
                  <span className="text-sm">{object.name}</span>
                  <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                </div>
              ))}
            </div>
          </>
        ) : (
          null // Also reset when video is not present in render
        )}
      </div>
    </div>
  );
}
