"use client";

import React, { useState, useRef, useEffect } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
} from "@/components/ui/card";

const VideoFirstFrame = () => {
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [firstFrame, setFirstFrame] = useState<string | null>(null);
  const [clickCoordinates, setClickCoordinates] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [dotPosition, setDotPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [savedPoint, setSavedPoint] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [points, setPoints] = useState<
    {
      x: number;
      y: number;
      dotX: number;
      dotY: number;
      isDragging: boolean;
    }[]
  >([]);
  const imageRef = useRef<HTMLImageElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<File | null>(null); // Reference to store the selected video file

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
      fileRef.current = file; // Store the file reference
    } else {
      alert("Please select a valid video file.");
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
        }

        videoElement.removeEventListener("seeked", handleSeeked);
        videoElement.removeEventListener(
          "loadedmetadata",
          handleLoadedMetadata
        );
      };

      videoElement.addEventListener("loadedmetadata", handleLoadedMetadata);
      videoElement.addEventListener("seeked", handleSeeked);

      videoElement.load();

      return () => {
        videoElement.removeEventListener("seeked", handleSeeked);
        videoElement.removeEventListener(
          "loadedmetadata",
          handleLoadedMetadata
        );
      };
    }
  }, [videoSrc]);

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

  const handleDotMouseMove = (
    event: React.MouseEvent<HTMLDivElement>,
    index: number
  ) => {
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
    if (fileRef.current && savedPoint) {
      const formData = new FormData();
      formData.append("video", fileRef.current);
      formData.append("x", savedPoint.x.toFixed(2));
      formData.append("y", savedPoint.y.toFixed(2));

      try {
        const response = await fetch("http://127.0.0.1:5000/process_video", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();
        console.log(result);
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  const distance = calculateDistance();

  return (
    <div
      className="flex items-center justify-center min-h-screen"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <Card className="w-full max-w-md">
        {!firstFrame && (
          <CardHeader>
            <CardTitle>Video First Frame Capture</CardTitle>
          </CardHeader>
        )}
        <CardContent className="space-y-4">
          {!firstFrame && (
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="video-upload"
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-4 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag
                    and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    MP4, WebM, or Ogg (MAX. 100MB)
                  </p>
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
                  <h3 className="text-lg font-semibold mb-2">
                    Click on Object to Track:
                  </h3>
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
                      disabled={!clickCoordinates} // Disable button if no coordinates are selected
                    >
                      Next
                    </Button>
                    <div
                      className={`ml-4 transition-opacity duration-200 ${
                        clickCoordinates ? "opacity-100" : "opacity-0"
                      }`}
                      style={{ whiteSpace: "nowrap" }} // Keep coordinates on one line
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
                  <h3 className="text-lg font-semibold mb-2">
                    Click Two Points (1 Meter Apart):
                  </h3>
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
                  <div className="mt-4 flex justify-between items-center">
                    <Button variant="secondary" onClick={handleBack}>
                      Back
                    </Button>
                    {points.length === 2 && (
                      <div className="flex items-center">
                        <h3 className="text-lg font-semibold mr-2">
                          Pixel Distance:
                        </h3>
                        <p>{distance.toFixed(2)} pixels</p>
                      </div>
                    )}
                    <Button
                      className="ml-4"
                      variant="default"
                      onClick={handleNext}
                      disabled={points.length !== 2} // Disable button until two points are selected
                    >
                      Next
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VideoFirstFrame;
