"use client";

import React, { useState, useRef, useEffect } from "react";
import { Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    url: "https://pub-b9538b15e1c34772aaf7f433d4657b2b.r2.dev/basketball.mp4",
    thumbnail: "https://pub-b9538b15e1c34772aaf7f433d4657b2b.r2.dev/basketball.jpg",
  },
  {
    title: "Pool Table Shot",
    url: "https://pub-b9538b15e1c34772aaf7f433d4657b2b.r2.dev/pool.mp4",
    thumbnail: "https://pub-b9538b15e1c34772aaf7f433d4657b2b.r2.dev/pool.jpg",
  },
  {
    title: "Turntable Turning",
    url: "https://pub-b9538b15e1c34772aaf7f433d4657b2b.r2.dev/turntable.mp4",
    thumbnail: "https://pub-b9538b15e1c34772aaf7f433d4657b2b.r2.dev/turntable.jpg",
  },
];

// Removed React.FC to avoid issues with implicit children prop and better type inference
const VideoProcessingComponent = ({
  onProcessingComplete,
  onFirstFrameLoaded,
}: VideoProcessingComponentProps) => {
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [firstFrame, setFirstFrame] = useState<string | null>(null);
  const [clickCoordinates, setClickCoordinates] = useState<{ x: number; y: number } | null>(null);
  const [dotPosition, setDotPosition] = useState<{ x: number; y: number } | null>(null);
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

      const rect = img.getBoundingClientRect();

      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const scaleX = img.naturalWidth / img.clientWidth;
      const scaleY = img.naturalHeight / img.clientHeight;

      const realX = x * scaleX;
      const realY = y * scaleY;

      setDotPosition({ x, y });
      setClickCoordinates({ x: realX, y: realY });
    }
  };

  const handleNext = async () => {
    if (fileRef.current && clickCoordinates) {
      setLoading(true);

      const formData = new FormData();
      formData.append("video", fileRef.current);
      formData.append("x", clickCoordinates.x.toFixed(2));
      formData.append("y", clickCoordinates.y.toFixed(2));
      formData.append("pixel_to_meter", "1000");

      try {
        const response = await fetch(
          "https://samier-tracking-backend-RyanHuang9.replit.app/process_video",
          {
            method: "POST",
            body: formData,
          }
        );

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
      alert("Please ensure that the video is selected and the object is marked.");
    }
  };

  return (
    <div className="space-y-2">
      {!firstFrame && (
        <div className="space-y-4">
          {/* File Upload Section */}
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
          {/* Example Videos Section */}
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Or choose an example video:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {exampleVideos.map((video, index) => (
                <div
                  key={index}
                  className="border rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-200"
                  onClick={() => handleExampleVideoSelect(video)}
                >
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-24 object-cover"
                  />
                  <div className="p-2 flex items-center justify-between">
                    <span className="text-sm font-medium">{video.title}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {videoSrc && (
        <video ref={videoRef} src={videoSrc} style={{ display: "none" }} crossOrigin="anonymous" />
      )}
      {firstFrame && (
        <div className="space-y-2">
          {/* Click on Object to Track Section */}
          <h3
            className="text-lg font-semibold mb-2"
            style={{ paddingLeft: "12px", paddingRight: "12px" }}
          >
            Click on Object to Track:
          </h3>

          <div
            style={{
              position: "relative",
              display: "inline-block",
              marginLeft: "12px", // Added left padding
              marginRight: "12px", // Added right padding
            }}
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
          {/* Next Button and Coordinates Display */}
          <div
  className="mt-4 flex items-center"
  style={{ paddingLeft: "12px", paddingRight: "12px" }}
>
  <Button
    variant="default"
    onClick={handleNext}
    disabled={!clickCoordinates || loading}
  >
    {loading ? (
      <Loader2 className="animate-spin h-5 w-5 text-white" />
    ) : (
      "Next"
    )}
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
        </div>
      )}
    </div>
  );
};

export default VideoProcessingComponent;
