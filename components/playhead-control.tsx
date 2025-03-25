import { useEffect, useMemo } from 'react';
import { formatTime } from './video-timeline';

interface PlayheadControlProps {
  position: number;
  isDragging: boolean;
  duration: number;
  onDragStart: () => void;
  currentTime: number;
  onTimeChange?: (time: number) => void;
  onPositionChange?: (position: number) => void;
}

export function PlayheadControl({
  position,
  isDragging,
  duration,
  onDragStart,
  currentTime,
  onTimeChange,
  onPositionChange
}: PlayheadControlProps) {
  // Calculate position based on current time and duration
  const calculatedPosition = useMemo(() => {
    if (duration <= 0) return 0;
    return Math.min((currentTime / duration) * 100, 100);
  }, [currentTime, duration]);

  // Update position when video is playing
  useEffect(() => {
    if (!isDragging && duration > 0) {
      onTimeChange?.(currentTime);
      onPositionChange?.(calculatedPosition);
    }
  }, [currentTime, duration, isDragging, calculatedPosition, onTimeChange, onPositionChange]);

  const displayPosition = isDragging ? position : calculatedPosition;

  const commonStyles = {
    left: `${displayPosition}%`,
    transition: isDragging ? "none" : "left 0.1s linear",
  };

  return (
    <>
      {/* Playhead indicator */}
      <div
        className="absolute top-0 w-0.5 bg-primary h-full pointer-events-none border border-background"
        style={commonStyles}
      />

      {/* Draggable handle */}
      <div
        className="absolute top-0 w-4 h-6 bg-primary rounded-sm -ml-2 cursor-col-resize z-10 hover:shadow-lg border border-background"
        style={commonStyles}
        onMouseDown={(e) => {
          e.stopPropagation();
          onDragStart();
        }}
      />

      {/* Time tooltip */}
      {isDragging && (
        <div
          className="absolute top-[-25px] bg-popover text-popover-foreground text-xs px-2 py-1 rounded transform -translate-x-1/2 pointer-events-none border border-border"
          style={{ left: `${displayPosition}%` }}
        >
          {formatTime(duration * (displayPosition / 100))}
        </div>
      )}
    </>
  );
}
