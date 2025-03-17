import { useEffect, useRef, useState } from "react";

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
}

export default function VideoTimeline({
  objects,
  currentTime,
  duration,
  onSeek,
  videoURL,
}: VideoTimelineProps) {
  // Generate 15 frames for the timeline
  const frames = Array.from({ length: 15 }, (_, i) => i);
  const [frameImages, setFrameImages] = useState<string[]>([]);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localPlayheadPosition, setLocalPlayheadPosition] = useState<
    number | null
  >(null);

  useEffect(() => {
    if (!videoURL || !duration) return;

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
      // Clean up
      if (videoRef.current) {
        videoRef.current.src = "";
      }
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
    const offsetX = clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, offsetX / rect.width));

    // Update local position immediately for smooth UI
    setLocalPlayheadPosition(percentage * 100);

    // Debounce the actual seek to avoid overwhelming the video element
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
        handleTimelineInteraction(e.clientX);
      };

      const onGlobalMouseUp = () => {
        setIsDragging(false);
        setLocalPlayheadPosition(null); // Clear local position to use currentTime again
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
  }, [isDragging]);

  // Calculate playhead position as percentage - use local position while dragging for smoother UI
  const playheadPosition =
    isDragging && localPlayheadPosition !== null
      ? localPlayheadPosition
      : duration > 0
      ? (currentTime / duration) * 100
      : 0;

  return (
    <div className="flex-1">
      <div className="relative mt-4">
        {/* Timeline scrubber with video frames */}
        {duration > 0 && (
          <div
            ref={timelineRef}
            className="relative h-16 bg-gray-800 rounded-md overflow-hidden cursor-col-resize select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => {
              if (isDragging) {
                setIsDragging(false);
                setLocalPlayheadPosition(null);
              }
            }}
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

            {/* Playhead indicator */}
            <div
              className="absolute top-0 w-0.5 bg-white h-full pointer-events-none border border-black"
              style={{
                left: `${playheadPosition}%`,
                transition: isDragging ? "none" : "left 0.1s linear",
              }}
            />

            {/* Draggable handle */}
            <div
              className="absolute top-0 w-4 h-6 bg-white rounded-sm -ml-2 cursor-col-resize z-10 hover:shadow-lg border border-black"
              style={{
                left: `${playheadPosition}%`,
                transition: isDragging ? "none" : "left 0.1s linear",
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                setIsDragging(true);
                // Don't call handleTimelineInteraction here, just set dragging state
                // This prevents the handle from jumping when clicked
              }}
            />

            {/* Time tooltip */}
            {isDragging && (
              <div
                className="absolute top-[-25px] bg-black/80 text-white text-xs px-2 py-1 rounded transform -translate-x-1/2 pointer-events-none"
                style={{ left: `${playheadPosition}%` }}
              >
                {formatTime(duration * (playheadPosition / 100))}
              </div>
            )}
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
      </div>
    </div>
  );
}

// Helper function to format time
function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}
