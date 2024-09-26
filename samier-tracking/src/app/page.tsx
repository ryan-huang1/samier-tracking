"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const VideoFirstFrame = () => {
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [firstFrame, setFirstFrame] = useState<string | null>(null);
  const [clickCoordinates, setClickCoordinates] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (file && file.type.startsWith('video/')) {
      const videoUrl = URL.createObjectURL(file);
      setVideoSrc(videoUrl);
      setFirstFrame(null);
      setClickCoordinates(null);
    } else {
      alert('Please select a valid video file.');
    }
  };

  useEffect(() => {
    if (videoSrc && videoRef.current) {
      const videoElement = videoRef.current;

      const handleLoadedMetadata = () => {
        // Seek to the first frame
        videoElement.currentTime = 0;
      };

      const handleSeeked = () => {
        // Create a canvas to capture the frame
        const canvas = document.createElement('canvas');
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
          const dataURL = canvas.toDataURL('image/png');
          setFirstFrame(dataURL);
        }

        // Clean up event listeners
        videoElement.removeEventListener('seeked', handleSeeked);
        videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };

      // Add event listeners
      videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
      videoElement.addEventListener('seeked', handleSeeked);

      // Load the video
      videoElement.load();

      // Clean up on unmount or when videoSrc changes
      return () => {
        videoElement.removeEventListener('seeked', handleSeeked);
        videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    }
  }, [videoSrc]);

  const handleImageClick = (event: React.MouseEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    const rect = img.getBoundingClientRect();

    // Coordinates relative to the displayed image
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Scaling factors
    const scaleX = (img.naturalWidth || img.width) / img.width;
    const scaleY = (img.naturalHeight || img.height) / img.height;

    // Coordinates relative to the actual image size
    const realX = x * scaleX;
    const realY = y * scaleY;

    setClickCoordinates({ x: realX, y: realY });
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Video First Frame Capture</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
          {videoSrc && (
            <video
              ref={videoRef}
              src={videoSrc}
              style={{ display: 'none' }}
              crossOrigin="anonymous"
            />
          )}
          {firstFrame && (
            <div>
              <h3 className="text-lg font-semibold mb-2">First Frame:</h3>
              <img
                src={firstFrame}
                alt="First frame of the video"
                className="w-full cursor-crosshair"
                onClick={handleImageClick}
              />
            </div>
          )}
          {clickCoordinates && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Clicked Coordinates:</h3>
              <p>
                X: {clickCoordinates.x.toFixed(2)}, Y:{' '}
                {clickCoordinates.y.toFixed(2)}
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={() => document.getElementById('video-upload')?.click()}>
            <Upload className="w-4 h-4 mr-2" />
            Upload Video
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default VideoFirstFrame;