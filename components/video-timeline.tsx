import { Slider } from "@/components/ui/slider";
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

  return (
    <div className="flex-1">
      <div className="relative">
        {/* Video progress slider */}
        <div className="mt-4">
          <Slider
            value={[currentTime]}
            max={duration}
            step={0.1}
            onValueChange={onSeek}
            className="flex-1"
          />
        </div>
        <br />
        {/* Timeline scrubber with video frames */}
        {duration > 0 && (
          <div className="h-16 bg-gray-800 rounded-md overflow-hidden flex">
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
                  onClick={() => {
                    if (duration) {
                      onSeek([(frame / (frames.length - 1)) * duration]);
                    }
                  }}
                >
                  <div
                    className="w-full h-full bg-cover bg-center opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
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
