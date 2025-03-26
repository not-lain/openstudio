"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import { VideoPlayer } from "@/components/video/video-player";
import { VideoControls } from "@/components/video/video-controls";
import { VideoUploader } from "@/components/video/video-uploader";

export default function SegmentationDemo() {
  const [currentStep, setCurrentStep] = useState(1);
  const [nextObjectId, setNextObjectId] = useState(1);
  const objectColors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];

  const [objects, setObjects] = useState<{
    id: number;
    name: string;
    thumbnail: string;
    color: string;
    points: Array<{ x: number; y: number; frameNumber: number; isAddMode: boolean }>;
    boundingBoxes: Array<{ x: number; y: number; width: number; height: number; frameNumber: number; isAddMode: boolean }>;
    isAddMode?: boolean;
  }[]>([]);

  const [currentTime, setCurrentTime] = useState("0:00");
  const [currentTimeSeconds, setCurrentTimeSeconds] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [endPoint, setEndPoint] = useState<{ x: number; y: number } | null>(null);
  const [boundingBoxes, setBoundingBoxes] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
    frameNumber: number;
    isAddMode: boolean;
  }[]>([]);

  const [selectedObjectIndex, setSelectedObjectIndex] = useState<number | null>(null);
  const [justFinishedDrawing, setJustFinishedDrawing] = useState(false);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const seconds = videoRef.current.currentTime;
      setCurrentTime(formatTime(seconds));
      setCurrentTimeSeconds(seconds);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        if (videoRef.current.ended) {
          videoRef.current.currentTime = 0;
        }
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0];
    }
  };

  const handleFileSelect = useCallback((file: File) => {
    if (file && file.type.startsWith("video/")) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setBoundingBoxes([]);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const file = e.dataTransfer.files[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleRemoveVideo = useCallback(() => {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    setVideoFile(null);
    setVideoUrl(null);
    setBoundingBoxes([]);
    setIsPlaying(false);
    setCurrentTime("0:00");
    setCurrentTimeSeconds(0);
    setDuration(0);
    setObjects([]);
    setNextObjectId(1);
  }, [videoUrl]);

  const addObject = () => {
    const newId = nextObjectId;
    const colorIndex = objects.length > 0
      ? (objects[objects.length - 1].color === objectColors[objectColors.length - 1])
        ? 0
        : objectColors.indexOf(objects[objects.length - 1].color) + 1
      : 0;

    const newObject = {
      id: newId,
      name: `Object ${newId}`,
      thumbnail: "/placeholder.svg?height=60&width=60",
      color: objectColors[colorIndex],
      points: [] as { x: number; y: number; frameNumber: number; isAddMode: boolean }[],
      boundingBoxes: [] as { x: number; y: number; width: number; height: number; frameNumber: number; isAddMode: boolean }[],
      isAddMode: true,
    };
    setObjects([...objects, newObject]);
    setNextObjectId(newId + 1);
    setSelectedObjectIndex(objects.length);
  };

  const removeObject = (id: number) => {
    const removedObjectIndex = objects.findIndex(obj => obj.id === id);
    if (removedObjectIndex === -1) return;

    const updatedObjects = objects.filter((obj) => obj.id !== id).map((obj, index) => ({
      ...obj,
      id: index + 1,
      name: `Object ${index + 1}`
    }));

    setObjects(updatedObjects);
    setNextObjectId(updatedObjects.length + 1);

    if (selectedObjectIndex !== null) {
      if (selectedObjectIndex === removedObjectIndex) {
        setSelectedObjectIndex(null);
      } else if (selectedObjectIndex > removedObjectIndex) {
        setSelectedObjectIndex(selectedObjectIndex - 1);
      }
    }
  };

  const startOver = () => {
    setObjects([]);
    setCurrentStep(1);
    setBoundingBoxes([]);
    setNextObjectId(1);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLVideoElement>) => {
    setIsDrawing(true);
    if (videoRef.current) {
      const rect = videoRef.current.getBoundingClientRect();
      setStartPoint({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setEndPoint({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLVideoElement>) => {
    if (isDrawing && videoRef.current) {
      const rect = videoRef.current.getBoundingClientRect();
      setEndPoint({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLVideoElement>) => {
    if (startPoint && endPoint && videoRef.current && objects.length > 0) {
      const x = Math.min(startPoint.x, endPoint.x);
      const y = Math.min(startPoint.y, endPoint.y);
      const width = Math.abs(endPoint.x - startPoint.x);
      const height = Math.abs(endPoint.y - startPoint.y);
      const fps = 30;
      const frameNumber = Math.floor(videoRef.current.currentTime * fps);

      if (width > 10 && height > 10) {
        const objIndex = selectedObjectIndex !== null ? selectedObjectIndex : objects.length - 1;
        const selectedObject = objects[objIndex];
        const isAddMode = selectedObject.isAddMode !== undefined ? selectedObject.isAddMode : true;
        const newBoundingBox = { x, y, width, height, frameNumber, isAddMode };

        console.log(`[Bounding Box] Frame ${frameNumber}, Object ${selectedObject.name}, Mode: ${isAddMode ? 'Add' : 'Remove'}, Coordinates: x=${x}, y=${y}, w=${width}, h=${height}`);

        const updatedObjects = [...objects];
        updatedObjects[objIndex] = {
          ...selectedObject,
          boundingBoxes: [...(selectedObject.boundingBoxes || []), newBoundingBox]
        };

        setObjects(updatedObjects);
        setJustFinishedDrawing(true);
        // Reset the flag after a short delay
        setTimeout(() => setJustFinishedDrawing(false), 100);
      }
    }
    setIsDrawing(false);
    setStartPoint(null);
    setEndPoint(null);
  };

  const handleVideoClick = (e: React.MouseEvent<HTMLVideoElement>) => {
    if (!isDrawing && !justFinishedDrawing && videoRef.current && objects.length > 0) {
      const video = videoRef.current;
      const rect = video.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const fps = 30;
      const frameNumber = Math.floor(video.currentTime * fps);

      const objIndex = selectedObjectIndex !== null ? selectedObjectIndex : objects.length - 1;
      const selectedObject = objects[objIndex];
      const isAddMode = selectedObject.isAddMode !== undefined ? selectedObject.isAddMode : true;
      const newPoint = { x, y, frameNumber, isAddMode };

      console.log(`[Point] Frame ${frameNumber}, Object ${selectedObject.name}, Mode: ${isAddMode ? 'Add' : 'Remove'}, Coordinates: x=${x}, y=${y}`);

      const updatedObjects = [...objects];
      updatedObjects[objIndex] = {
        ...selectedObject,
        points: [...(selectedObject.points || []), newPoint]
      };

      setObjects(updatedObjects);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && videoRef.current) {
        e.preventDefault();
        if (videoRef.current.ended) {
          videoRef.current.currentTime = 0;
          videoRef.current.play();
          setIsPlaying(true);
        } else {
          togglePlayPause();
        }
      }
    };

    // Only add the event listener if we have a video
    if (videoUrl) {
      window.addEventListener('keydown', handleKeyPress);
      return () => {
        window.removeEventListener('keydown', handleKeyPress);
      };
    }
  }, [videoUrl, togglePlayPause]);

  useEffect(() => {
    if (!isPlaying || !videoRef.current) return;

    let animationFrameId: number;

    const updateTime = () => {
      if (videoRef.current) {
        const seconds = videoRef.current.currentTime;
        setCurrentTimeSeconds(seconds);
      }
      animationFrameId = requestAnimationFrame(updateTime);
    };

    animationFrameId = requestAnimationFrame(updateTime);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying]);

  return (
    <div className="flex flex-col h-[100dvh] bg-background text-foreground overflow-hidden">
      <main className="flex flex-1 overflow-hidden">
        <Sidebar
          objects={objects}
          onRemoveObject={removeObject}
          onAddObject={addObject}
          selectedObjectIndex={selectedObjectIndex}
          setSelectedObjectIndex={setSelectedObjectIndex}
          videoUrl={videoUrl}
          onStartOver={startOver}
        />

        <div className="flex-1 flex flex-col min-w-0">
          <div
            className="h-full relative group"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {videoUrl ? (
              <VideoPlayer
                videoUrl={videoUrl}
                videoRef={videoRef}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onClick={handleVideoClick}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onRemoveVideo={handleRemoveVideo}
                isDrawing={isDrawing}
                startPoint={startPoint}
                endPoint={endPoint}
                boundingBoxes={boundingBoxes}
              />
            ) : (
              <VideoUploader
                onFileSelect={handleFileSelect}
                fileInputRef={fileInputRef}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onFileInput={handleFileInput}
              />
            )}
          </div>
          {videoUrl && (
            <VideoControls
              isPlaying={isPlaying}
              currentTime={currentTime}
              duration={duration}
              currentTimeSeconds={currentTimeSeconds}
              togglePlayPause={togglePlayPause}
              objects={objects}
              onSeek={handleSeek}
              videoURL={videoUrl}
              setIsPlaying={setIsPlaying}
            />
          )}
        </div>
      </main>
    </div>
  );
}
