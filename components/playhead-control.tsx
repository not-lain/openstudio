import { useEffect } from 'react';
import { formatTime } from './video-timeline';

interface PlayheadControlProps {
  position: number;
  isDragging: boolean;
  duration: number;
  onDragStart: () => void;
  currentTime: number;
  onTimeChange?: (time: number) => void;
}

export function PlayheadControl({ 
  position, 
  isDragging, 
  duration, 
  onDragStart,
  currentTime,
  onTimeChange 
}: PlayheadControlProps) {
  // Update position when video is playing
  useEffect(() => {
    if (!isDragging && duration > 0) {
      const calculatedPosition = (currentTime / duration) * 100;
      onTimeChange?.(currentTime);
    }
  }, [currentTime, duration, isDragging, onTimeChange]);

  const commonStyles = {
    left: `${position}%`,
    transition: isDragging ? "none" : "left 0.1s linear",
  };

  return (
    <>
      {/* Playhead indicator */}
      <div
        className="absolute top-0 w-0.5 bg-white h-full pointer-events-none border border-black"
        style={commonStyles}
      />

      {/* Draggable handle */}
      <div
        className="absolute top-0 w-4 h-6 bg-white rounded-sm -ml-2 cursor-col-resize z-10 hover:shadow-lg border border-black"
        style={commonStyles}
        onMouseDown={(e) => {
          e.stopPropagation();
          onDragStart();
        }}
      />

      {/* Time tooltip */}
      {isDragging && (
        <div
          className="absolute top-[-25px] bg-black/80 text-white text-xs px-2 py-1 rounded transform -translate-x-1/2 pointer-events-none border border-black"
          style={{ left: `${position}%` }}
        >
          {formatTime(duration * (position / 100))}
        </div>
      )}
    </>
  );
}
