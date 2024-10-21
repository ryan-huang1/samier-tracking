"use client";

import React, { useState, useRef, useEffect } from "react";
import { Upload, Loader2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface VideoProcessingComponentProps {
  onProcessingComplete: (result: any) => void;
  onFirstFrameLoaded: () => void;
}

interface ExampleVideo {
  title: string;
  url: string;
  thumbnail: string;
}

const exampleVideos: ExampleVideo[] = [
  {
    title: "Basketball Shot",
    url: "/videos/basketball.mp4",
    thumbnail: "/frames/basketball.jpg",
  },
  {
    title: "Cart Collision",
    url: "/videos/cart.mp4",
    thumbnail: "/frames/cart.jpg",
  },
  {
    title: "Turntable Turning",
    url: "/https://pub-b9538b15e1c34772aaf7f433d4657b2b.r2.dev/turntable.mp4",
    thumbnail: "/frames/turntable.jpg",
  },
];

const VideoProcessingComponent: React.FC<VideoProcessingComponentProps> = ({
  onProcessingComplete,
  onFirstFrameLoaded,
}) => {
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [firstFrame, setFirstFrame] = useState<string | null>(null);
  const [clickCoordinates, setClickCoordinates] = useState<{ x: number; y: number } | null>(null);
  const [dotPosition, setDotPosition] = useState<{ x: number; y: number } | null>(null);
  const [savedPoint, setSavedPoint] = useState<{ x: number; y: number } | null>(null);
  const [points, setPoints] = useState<{ x: number; y: number; dotX: number; dotY: number; isDragging: boolean }[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (file && file.type.startsWith("video/")) {
      const videoUrl = URL.createObjectURL(file);
      setVideoSrc(videoUrl);
      setFirstFrame(null);
      setClickCoordinates(null);
      setDotPosition(null);
      setSavedPoint(null);
      setPoints([]);
      fileRef.current = file;
    } else {
      alert("Please select a valid video file.");
    }
  };

  const handleExampleVideoSelect = async (video: ExampleVideo) => {
    setVideoSrc(video.url);
    setFirstFrame(null);
    setClickCoordinates(null);
    setDotPosition(null);
    setSavedPoint(null);
    setPoints([]);
    fileRef.current = null;

    // Fetch the video blob and create a File object
    try {
      const response = await fetch(video.url);
      if (!response.ok) {
        throw new Error(`Failed to fetch the example video: ${response.statusText}`);
      }
      const blob = await response.blob();
      const file = new File([blob], `${video.title}.mp4`, { type: blob.type });
      fileRef.current = file;
    } catch (error) {
      console.error("Error fetching example video:", error);
      alert("Failed to load the selected example video. Please try another one.");
    }
  };

  useEffect(() => {
    if (videoSrc && videoRef.current) {
      const videoElement = videoRef.current;

      const handleLoadedMetadata = () => {
        videoElement.currentTime = 0;
      };

      const handleSeeked = () => {
        const canvas = document.createElement("canvas");
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
          const dataURL = canvas.toDataURL("image/png");
          setFirstFrame(dataURL);
          onFirstFrameLoaded(); // Call this when the first frame is loaded
        }

        videoElement.removeEventListener("seeked", handleSeeked);
        videoElement.removeEventListener("loadedmetadata", handleLoadedMetadata);
      };

      videoElement.addEventListener("loadedmetadata", handleLoadedMetadata);
      videoElement.addEventListener("seeked", handleSeeked);

      videoElement.load();

      return () => {
        videoElement.removeEventListener("seeked", handleSeeked);
        videoElement.removeEventListener("loadedmetadata", handleLoadedMetadata);
      };
    }
  }, [videoSrc, onFirstFrameLoaded]);

  const handleImageClick = (event: React.MouseEvent<HTMLImageElement>) => {
    if (imageRef.current) {
      const img = imageRef.current;

      if (savedPoint && points.length >= 2) {
        return;
      }

      const rect = img.getBoundingClientRect();

      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const scaleX = img.naturalWidth / img.clientWidth;
      const scaleY = img.naturalHeight / img.clientHeight;

      const realX = x * scaleX;
      const realY = y * scaleY;

      if (!savedPoint) {
        setDotPosition({ x, y });
        setClickCoordinates({ x: realX, y: realY });
      } else {
        setPoints((prevPoints) => [
          ...prevPoints,
          {
            x: realX,
            y: realY,
            dotX: x,
            dotY: y,
            isDragging: false,
          },
        ]);
      }
    }
  };

  const handleDotMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    setDotPosition(null);
    setClickCoordinates(null);
  };

  const handleDotMouseMove = (event: React.MouseEvent<HTMLDivElement>, index: number) => {
    event.preventDefault();
    if (points[index].isDragging && imageRef.current) {
      const img = imageRef.current;
      const rect = img.getBoundingClientRect();

      let x = event.clientX - rect.left;
      let y = event.clientY - rect.top;

      x = Math.max(0, Math.min(x, img.clientWidth));
      y = Math.max(0, Math.min(y, img.clientHeight));

      const scaleX = img.naturalWidth / img.clientWidth;
      const scaleY = img.naturalHeight / img.clientHeight;

      const realX = x * scaleX;
      const realY = y * scaleY;

      setPoints((prevPoints) =>
        prevPoints.map((point, i) =>
          i === index ? { ...point, x: realX, y: realY, dotX: x, dotY: y } : point
        )
      );
    }
  };

  const handleDotMouseUp = (index: number) => {
    setPoints((prevPoints) =>
      prevPoints.map((point, i) =>
        i === index ? { ...point, isDragging: false } : point
      )
    );
  };

  const handleDotMouseDownPoint = (index: number) => {
    setPoints((prevPoints) =>
      prevPoints.map((point, i) =>
        i === index ? { ...point, isDragging: true } : point
      )
    );
  };

  const handleMouseUp = () => {
    setPoints((prevPoints) =>
      prevPoints.map((point) => ({ ...point, isDragging: false }))
    );
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    points.forEach((point, index) => {
      if (point.isDragging && imageRef.current) {
        const img = imageRef.current;
        const rect = img.getBoundingClientRect();

        let x = event.clientX - rect.left;
        let y = event.clientY - rect.top;

        x = Math.max(0, Math.min(x, img.clientWidth));
        y = Math.max(0, Math.min(y, img.clientHeight));

        const scaleX = img.naturalWidth / img.clientWidth;
        const scaleY = img.naturalHeight / img.clientHeight;

        const realX = x * scaleX;
        const realY = y * scaleY;

        setPoints((prevPoints) =>
          prevPoints.map((p, i) =>
            i === index ? { ...p, x: realX, y: realY, dotX: x, dotY: y } : p
          )
        );
      }
    });
  };

  const handleConfirm = () => {
    if (dotPosition && clickCoordinates) {
      setSavedPoint(clickCoordinates);
      setDotPosition(null);
      setClickCoordinates(null);
    }
  };

  const handleBack = () => {
    setSavedPoint(null);
    setPoints([]);
  };

  const calculateDistance = () => {
    if (points.length === 2) {
      const dx = points[0].x - points[1].x;
      const dy = points[0].y - points[1].y;
      return Math.sqrt(dx * dx + dy * dy);
    }
    return 0;
  };

  const handleNext = async () => {
    if (fileRef.current && savedPoint && points.length === 2) {
      setLoading(true);

      const pixelDistance = calculateDistance();

      const formData = new FormData();
      formData.append("video", fileRef.current);
      formData.append("x", savedPoint.x.toFixed(2));
      formData.append("y", savedPoint.y.toFixed(2));
      formData.append("pixel_to_meter", pixelDistance.toFixed(2));

      try {
        const response = await fetch("https://samier-tracking-backend-RyanHuang9.replit.app/process_video", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Backend responded with status ${response.status}`);
        }

        const result = await response.json();
        onProcessingComplete(result);
      } catch (error) {
        console.error("Error:", error);
        onProcessingComplete({ error: "An error occurred during processing" });
      } finally {
        setLoading(false);
      }
    } else {
      alert("Please ensure that the video is selected and two points are marked.");
    }
  };

  const distance = calculateDistance();

  return (
    <div
      className="space-y-4"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {!firstFrame && (
        <div>
          <CardContent>
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="video-upload"
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-4 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">MP4, WebM, or Ogg (MAX. 100MB)</p>
                </div>
                <input
                  id="video-upload"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept="video/*"
                />
              </label>
            </div>
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Or choose an example video:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {exampleVideos.map((video, index) => (
                  <div
                    key={index}
                    className="border rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-200"
                    onClick={() => handleExampleVideoSelect(video)}
                  >
                    <img src={video.thumbnail} alt={video.title} className="w-full h-24 object-cover" />
                    <div className="p-2 flex items-center justify-between">
                      <span className="text-sm font-medium">{video.title}</span>
                      <Play className="w-4 h-4 text-gray-500" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </div>
      )}
      {videoSrc && (
        <video
          ref={videoRef}
          src={videoSrc}
          style={{ display: "none" }}
          crossOrigin="anonymous"
        />
      )}
      {firstFrame && (
        <div>
          {!savedPoint ? (
            <>
              <h3 className="text-lg font-semibold mb-2">Click on Object to Track:</h3>
              <div
                style={{ position: "relative", display: "inline-block" }}
                onMouseDown={handleMouseUp}
              >
                <img
                  ref={imageRef}
                  src={firstFrame}
                  alt="First frame of the video"
                  style={{
                    maxWidth: "100%",
                    height: "auto",
                    display: "block",
                  }}
                  className="cursor-crosshair"
                  onClick={handleImageClick}
                />
                {dotPosition && (
                  <div
                    onMouseDown={handleDotMouseDown}
                    style={{
                      position: "absolute",
                      left: dotPosition.x,
                      top: dotPosition.y,
                      transform: "translate(-50%, -50%)",
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      backgroundColor: "rgba(255, 0, 0, 0.5)",
                      cursor: "grab",
                    }}
                  ></div>
                )}
              </div>
              <div className="mt-4 flex items-center">
                <Button
                  variant="default"
                  onClick={handleConfirm}
                  disabled={!clickCoordinates}
                >
                  Next
                </Button>
                <div
                  className={`ml-4 transition-opacity duration-200 ${
                    clickCoordinates ? "opacity-100" : "opacity-0"
                  }`}
                  style={{ whiteSpace: "nowrap" }}
                >
                  {clickCoordinates && (
                    <p>
                      <strong>Coordinates:</strong> X: {clickCoordinates.x.toFixed(2)}, Y:
                      {clickCoordinates.y.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold mb-2">Click Two Points (1 Meter Apart):</h3>
              <div
                style={{ position: "relative", display: "inline-block" }}
                onMouseDown={handleMouseUp}
              >
                <img
                  ref={imageRef}
                  src={firstFrame}
                  alt="First frame of the video"
                  style={{
                    maxWidth: "100%",
                    height: "auto",
                    display: "block",
                  }}
                  className="cursor-crosshair"
                  onClick={handleImageClick}
                />
                {points.map((point, index) => (
                  <div
                    key={index}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      handleDotMouseDownPoint(index);
                    }}
                    onMouseMove={(e) => handleDotMouseMove(e, index)}
                    onMouseUp={() => handleDotMouseUp(index)}
                    style={{
                      position: "absolute",
                      left: point.dotX,
                      top: point.dotY,
                      transform: "translate(-50%, -50%)",
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      backgroundColor: "rgba(0, 0, 255, 0.5)",
                      cursor: "grab",
                    }}
                  ></div>
                ))}
                {points.length === 2 && (
                  <svg
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      pointerEvents: "none",
                      width: "100%",
                      height: "100%",
                    }}
                  >
                    <line
                      x1={points[0].dotX}
                      y1={points[0].dotY}
                      x2={points[1].dotX}
                      y2={points[1].dotY}
                      stroke="red"
                      strokeWidth="2"
                    />
                  </svg>
                )}
              </div>
              <div className="mt-4 flex items-center justify-left">
                <Button variant="secondary" onClick={handleBack}>
                  Back
                </Button>
                <Button
                  className="ml-2 flex justify-center items-center"
                  style={{ minWidth: "3rem" }}
                  variant="default"
                  onClick={handleNext}
                  disabled={points.length !== 2 || loading}
                >
                  {loading ? (
                    <Loader2 className="animate-spin h-5 w-5 text-white" />
                  ) : (
                    "Next"
                  )}
                </Button>
                <div
                  className={`ml-4 transition-opacity duration-200 ${
                    points.length === 2 ? "opacity-100" : "opacity-0"
                  }`}
                  style={{ whiteSpace: "nowrap" }}
                >
                  {points.length === 2 && (
                    <p>
                      <strong>Pixel Distance:</strong> {distance.toFixed(2)} pixels
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default VideoProcessingComponent;
