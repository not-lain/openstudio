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

  const handleRemoveVideo = useCallback(() => {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    setVideoFile(null);
    setVideoUrl(null);
  }, [videoUrl]);

  const handleFileSelect = useCallback((file: File) => {
    if (file && file.type.startsWith("video/")) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
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
    setObjects([
      ...objects,
      {
        id: newId,
        name: `Object ${newId}`,
        thumbnail: "/placeholder.svg?height=60&width=60",
      },
    ]);
    setNextObjectId(newId + 1);
  };

  const removeObject = (id: number) => {
    setObjects(objects.filter((obj) => obj.id !== id));
  };

  const startOver = () => {
    setObjects([]);
    setCurrentStep(1);
  };

  // Add an effect to request animation frames for smoother updates during playback
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
            <div className="inline-block bg-gray-800 rounded-full px-3 py-1 text-sm mb-4">
              {currentStep}/3 Select objects
            </div>
            <p className="text-gray-400 text-sm">
              Adjust the selection of your object, or add additional objects.
              Press "Track objects" to track your objects throughout the video.
            </p>
          </div>

          <div className="pt-4 px-4 space-y-4 pb-20">
            {objects.map((object) => (
              <ObjectSelection
                key={object.id}
                object={object}
                onRemove={() => removeObject(object.id)}
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
              className="w-full h-16 border border-gray-700 rounded-md flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors text-white"
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
                />
                <div className="absolute top-4 right-4 flex gap-2">
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
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
