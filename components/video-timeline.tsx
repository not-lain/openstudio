import { Slider } from "@/components/ui/slider";

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
  console.log("Video URL:", videoURL);
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
        {/* Timeline scrubber */}
        {duration > 0 && objects.length > 0 && (
          <div className="h-16 bg-gray-800 rounded-md overflow-hidden flex">
            {frames.map((frame) => {
              // Calculate which object's thumbnail to show based on the frame position
              const objectIndex = Math.floor(
                (frame / frames.length) * objects.length
              );
              const object = objects[objectIndex];

              // Debug log to check thumbnail URLs
              console.log("Frame:", frame, "Object:", object?.thumbnail);

              return (
                <div
                  key={frame}
                  className="flex-1 border-r border-gray-700 relative"
                >
                  <div
                    className="w-full h-full bg-cover bg-center opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
                    style={{
                      backgroundImage: object?.thumbnail
                        ? `url(${object.thumbnail})`
                        : "none",
                      backgroundColor: object?.thumbnail
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
