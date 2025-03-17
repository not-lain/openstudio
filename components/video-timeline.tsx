interface VideoTimelineProps {
  objects: {
    id: number
    name: string
    thumbnail: string
  }[]
}

export default function VideoTimeline({ objects }: VideoTimelineProps) {
  // Generate 15 frames for the timeline
  const frames = Array.from({ length: 15 }, (_, i) => i)

  return (
    <div className="flex-1">
      <div className="relative">
        {/* Timeline scrubber */}
        <div className="h-16 bg-gray-800 rounded-md overflow-hidden flex">
          {frames.map((frame) => (
            <div key={frame} className="flex-1 border-r border-gray-700 relative">
              <div
                className="w-full h-full bg-cover bg-center opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
                style={{ backgroundImage: `url(/placeholder.svg?height=60&width=60)` }}
              />
            </div>
          ))}
        </div>

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
  )
}

