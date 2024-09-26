"use client"
// app/page.tsx

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
  const [dotPosition, setDotPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (file && file.type.startsWith('video/')) {
      const videoUrl = URL.createObjectURL(file);
      setVideoSrc(videoUrl);
      setFirstFrame(null);
      setClickCoordinates(null);
      setDotPosition(null);
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
        videoElement.removeEventListener(
          'loadedmetadata',
          handleLoadedMetadata
        );
      };

      // Add event listeners
      videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
      videoElement.addEventListener('seeked', handleSeeked);

      // Load the video
      videoElement.load();

      // Clean up on unmount or when videoSrc changes
      return () => {
        videoElement.removeEventListener('seeked', handleSeeked);
        videoElement.removeEventListener(
          'loadedmetadata',
          handleLoadedMetadata
        );
      };
    }
  }, [videoSrc]);

  const handleImageClick = (event: React.MouseEvent<HTMLImageElement>) => {
    if (imageRef.current) {
      const img = imageRef.current;
      const rect = img.getBoundingClientRect();

      // Coordinates relative to the displayed image
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      // Coordinates relative to the image container
      setDotPosition({ x, y });

      // Scaling factors
      const scaleX = img.naturalWidth / img.clientWidth;
      const scaleY = img.naturalHeight / img.clientHeight;

      // Coordinates relative to the actual image size
      const realX = x * scaleX;
      const realY = y * scaleY;

      setClickCoordinates({ x: realX, y: realY });
    }
  };

  const handleDotMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation(); // Prevent triggering image click
    setIsDragging(true);
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging && imageRef.current) {
      const img = imageRef.current;
      const rect = img.getBoundingClientRect();

      // Coordinates relative to the displayed image
      let x = event.clientX - rect.left;
      let y = event.clientY - rect.top;

      // Constrain the dot within the image boundaries
      x = Math.max(0, Math.min(x, img.clientWidth));
      y = Math.max(0, Math.min(y, img.clientHeight));

      // Scaling factors
      const scaleX = img.naturalWidth / img.clientWidth;
      const scaleY = img.naturalHeight / img.clientHeight;

      // Coordinates relative to the actual image size
      const realX = x * scaleX;
      const realY = y * scaleY;

      setDotPosition({ x, y });
      setClickCoordinates({ x: realX, y: realY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Video First Frame Capture</CardTitle>
        </CardHeader>
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
              style={{ display: 'none' }}
              crossOrigin="anonymous"
            />
          )}
          {firstFrame && (
            <div>
              <h3 className="text-lg font-semibold mb-2">First Frame:</h3>
              <div
                style={{ position: 'relative', display: 'inline-block' }}
                onMouseDown={handleMouseUp} // Stop dragging when clicking outside the dot
              >
                <img
                  ref={imageRef}
                  src={firstFrame}
                  alt="First frame of the video"
                  style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
                  className="cursor-crosshair"
                  onClick={handleImageClick}
                />
                {dotPosition && (
                  <div
                    onMouseDown={handleDotMouseDown}
                    style={{
                      position: 'absolute',
                      left: dotPosition.x,
                      top: dotPosition.y,
                      transform: 'translate(-50%, -50%)',
                      width: '10px', // Made the dot smaller
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(255, 0, 0, 0.5)', // Semi-transparent red
                      cursor: 'grab',
                      transition: isDragging ? 'none' : 'left 0.3s, top 0.3s',
                    }}
                  ></div>
                )}
              </div>
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
      </Card>
    </div>
  );
};

export default VideoFirstFrame;
