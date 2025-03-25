"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import {
  Play,
  Plus,
  RotateCcw,
  ExternalLink,
  Upload,
  X,
  Pause,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ObjectSelection from "./object-selection";
import VideoTimeline from "./video-timeline";
import { Slider } from "@/components/ui/slider";

export default function SegmentationDemo() {
  const [currentStep, setCurrentStep] = useState(1);
  const [nextObjectId, setNextObjectId] = useState(1);
  const [objects, setObjects] = useState<
    {
      id: number;
      name: string;
      thumbnail: string;
      points: Array<{x: number; y: number; frameNumber: number; isAddMode: boolean}>;
      boundingBoxes: Array<{x: number; y: number; width: number; height: number; frameNumber: number; isAddMode: boolean}>;
      isAddMode?: boolean; // Track add/remove mode for each object
    }[]
  >([]);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [currentTimeSeconds, setCurrentTimeSeconds] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Bounding Box State
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(
    null
  );
  const [endPoint, setEndPoint] = useState<{ x: number; y: number } | null>(
    null
  );
  const [boundingBoxes, setBoundingBoxes] = useState<
    {
      x: number;
      y: number;
      width: number;
      height: number;
      frameNumber: number;
      isAddMode: boolean;
    }[]
  >([]);
  
  // Track which object is currently selected
  const [selectedObjectIndex, setSelectedObjectIndex] = useState<number | null>(null);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

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

  // Add keyboard control
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && videoRef.current) {
        e.preventDefault(); // Prevent page scroll
        togglePlayPause();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [isPlaying]); // Include isPlaying in dependencies

  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0];
    }
  };

  const handleRemoveVideo = useCallback(() => {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    setVideoFile(null);
    setVideoUrl(null);
    setBoundingBoxes([]); // Clear bounding boxes
    setIsPlaying(false); // Reset playing state
    setCurrentTime("0:00"); // Reset time display
    setCurrentTimeSeconds(0); // Reset time in seconds
    setDuration(0); // Reset duration
    setObjects([]); // Reset objects to initial empty array
    setNextObjectId(1); // Reset nextObjectId to initial value
  }, [videoUrl]);

  const handleFileSelect = useCallback((file: File) => {
    if (file && file.type.startsWith("video/")) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setBoundingBoxes([]); // Clear bounding boxes when new video is loaded
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

  const addObject = () => {
    const newId = nextObjectId;
    const newObject = {
      id: newId,
      name: `Object ${newId}`,
      thumbnail: "/placeholder.svg?height=60&width=60",
      points: [],
      boundingBoxes: [],
      isAddMode: true, // Default to add mode
    };
    setObjects([...objects, newObject]);
    setNextObjectId(newId + 1);
    // Select the newly created object
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
    
    // Update selected object index if necessary
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
    setBoundingBoxes([]); // Clear bounding boxes when starting over
    setNextObjectId(1); // Reset nextObjectId to initial value
  };

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

  // Bounding box handlers
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
        // Use the tracked selectedObjectIndex or default to the last object
        const objIndex = selectedObjectIndex !== null ? selectedObjectIndex : objects.length - 1;
        const selectedObject = objects[objIndex];
        
        // Get the isAddMode state from the selected object
        const isAddMode = selectedObject.isAddMode !== undefined ? selectedObject.isAddMode : true;
        
        // Create a new bounding box with the isAddMode flag
        const newBoundingBox = { x, y, width, height, frameNumber, isAddMode };
        
        // Update the selected object with the new bounding box
        const updatedObjects = [...objects];
        updatedObjects[objIndex] = {
          ...selectedObject,
          boundingBoxes: [...selectedObject.boundingBoxes, newBoundingBox]
        };
        
        setObjects(updatedObjects);
        console.log("Bounding Box added to object:", { objectId: selectedObject.id, boundingBox: newBoundingBox });
      }
    }

    // Clear drawing states
    setIsDrawing(false);
    setStartPoint(null);
    setEndPoint(null);
  };

  // Function to handle clicks on the video when not drawing a box
  const handleVideoClick = (e: React.MouseEvent<HTMLVideoElement>) => {
    if (!isDrawing && videoRef.current && objects.length > 0) {
      const video = videoRef.current;
      const rect = video.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Calculate frame number (assuming 30 fps for demonstration)
      const fps = 30;
      const frameNumber = Math.floor(video.currentTime * fps);
      
      // Use the tracked selectedObjectIndex or default to the last object
      const objIndex = selectedObjectIndex !== null ? selectedObjectIndex : objects.length - 1;
      const selectedObject = objects[objIndex];
      
      // Get the isAddMode state from the selected object
      const isAddMode = selectedObject.isAddMode !== undefined ? selectedObject.isAddMode : true;
      
      // Create a new point with the isAddMode flag
      const newPoint = { x, y, frameNumber, isAddMode };
      
      // Update the selected object with the new point
      const updatedObjects = [...objects];
      updatedObjects[objIndex] = {
        ...selectedObject,
        points: [...selectedObject.points, newPoint]
      };
      
      setObjects(updatedObjects);
      console.log("Point added to object:", { objectId: selectedObject.id, point: newPoint });
    }
  };
  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="flex justify-between items-center p-4 border-b border-gray-800">
        <div>
          <h1 className="text-xl font-bold">Segment Anything 2 Demo</h1>
          <p className="text-sm text-gray-400">OpenStudio</p>
        </div>
        <div className="flex gap-6">
          <a href="#" className="flex items-center gap-1 text-sm">
            About <ExternalLink className="w-4 h-4" />
          </a>
          <a href="#" className="flex items-center gap-1 text-sm">
            Dataset <ExternalLink className="w-4 h-4" />
          </a>
          <a href="#" className="flex items-center gap-1 text-sm">
            AI Demos <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-96 bg-gray-900 border-r border-gray-800 overflow-y-auto">
          <div className="p-4 border-b border-gray-800">
            <p className="text-gray-400 text-sm">
              Adjust the selection of your object, or add additional objects.
              Press "Track objects" to track your objects throughout the video.
            </p>
          </div>

          <div className="pt-4 px-4 space-y-4 pb-20">
            {objects.map((object, index) => (
              <ObjectSelection
                key={object.id}
                object={object}
                onRemove={() => removeObject(object.id)}
                showDeleteButton={true}
                onSelect={() => setSelectedObjectIndex(index)}
                isSelected={selectedObjectIndex === index}
                />
            ))}

            {objects.length === 0 && (
              <div className="text-center p-4 text-gray-400">
                No objects selected. Click the "Add another object" button below
                to get started.
              </div>
            )}

            <button
              onClick={addObject}
              disabled={!videoUrl}
              className={`w-full h-16 border border-gray-700 rounded-md flex items-center justify-center gap-2 transition-colors text-white ${videoUrl ? 'hover:bg-gray-800' : 'opacity-50 cursor-not-allowed'}`}
            >
              <Plus className="w-5 h-5" />
              <span>Add another object</span>
            </button>
          </div>

          <div className="absolute bottom-0 w-96 p-4 border-t border-gray-800 bg-gray-900 flex justify-between items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={startOver}
              className="flex items-center gap-2 bg-white text-black hover:bg-gray-100 border-0 [&_svg]:text-black"
            >
              <RotateCcw className="w-4 h-4" />
              Start over
            </Button>
            <Button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
              Track objects
            </Button>
          </div>
        </div>

        {/* Main Video Area */}
        <div className="flex-1 flex flex-col relative">
          <div
            className="flex-1 relative"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {videoUrl ? (
              <>
                <video
                  ref={videoRef}
                  src={videoUrl}
                  className="absolute inset-0 w-full h-full object-contain"
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onClick={handleVideoClick} // Click event for non-drawing
                  onMouseDown={handleMouseDown} // Start drawing
                  onMouseMove={handleMouseMove} // Draw
                  onMouseUp={handleMouseUp} // Finish drawing
                />
                {/* Render Bounding Boxes */}
                {boundingBoxes.map((box, index) => (
                  <div
                    key={index}
                    className="absolute border-2 border-blue-500 pointer-events-none"
                    style={{
                      left: `${box.x}px`,
                      top: `${box.y}px`,
                      width: `${box.width}px`,
                      height: `${box.height}px`,
                    }}
                  />
                ))}
                {/* Temporary Bounding Box */}
                {isDrawing && startPoint && endPoint && (
                  <div
                    className="absolute border-2 border-red-500 pointer-events-none"
                    style={{
                      left: `${Math.min(startPoint.x, endPoint.x)}px`,
                      top: `${Math.min(startPoint.y, endPoint.y)}px`,
                      width: `${Math.abs(endPoint.x - startPoint.x)}px`,
                      height: `${Math.abs(endPoint.y - startPoint.y)}px`,
                    }}
                  />
                )}
                <div className="absolute top-4 right-4 flex gap-2">
                  {/* Remove Video */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleRemoveVideo}
                    className="rounded-full bg-black/50 border-0 hover:bg-black/70 text-white [&_svg]:text-white"
                  >
                    <X className="w-4 h-4" />
                    <span className="sr-only">Remove video</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full bg-black/50 border-0 text-white"
                  >
                    <span className="sr-only">Info</span>
                    <span className="text-lg">ⓘ</span>
                  </Button>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <div className="text-center">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-400 mb-2">
                    Drag and drop a video file here
                  </p>
                  <p className="text-gray-500 text-sm">or</p>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2 bg-white text-black hover:bg-gray-100 [&_svg]:text-black"
                  >
                    Select a video file
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Video Controls */}
          <div className="p-4 border-t border-gray-800 bg-gray-900">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={togglePlayPause}
                  className="rounded-full bg-white text-black hover:bg-gray-100 border-0 [&_svg]:text-black"
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
                <span className="text-sm">{currentTime}</span>
                <span className="text-sm text-gray-400">/</span>
                <span className="text-sm">{formatTime(duration)}</span>
              </div>
              <div className="flex items-center gap-4">
                <VideoTimeline
                  objects={objects}
                  currentTime={currentTimeSeconds}
                  duration={duration}
                  onSeek={handleSeek}
                  videoURL={videoUrl}
                  setIsPlaying={setIsPlaying}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
