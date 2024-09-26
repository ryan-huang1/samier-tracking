"use client"

// app/page.tsx

import React, { useState, useEffect } from 'react';

const Page = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [firstFrame, setFirstFrame] = useState<string | null>(null);
  const [clickCoordinates, setClickCoordinates] = useState<{ x: number; y: number } | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setVideoFile(event.target.files[0]);
      setClickCoordinates(null);
    }
  };

  useEffect(() => {
    if (videoFile) {
      const url = URL.createObjectURL(videoFile);
      const video = document.createElement('video');
      video.src = url;
      video.crossOrigin = 'anonymous';

      video.addEventListener('loadeddata', () => {
        video.currentTime = 0;
      });

      video.addEventListener('seeked', () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataURL = canvas.toDataURL('image/png');
          setFirstFrame(dataURL);
          URL.revokeObjectURL(url);
        }
      });
    }
  }, [videoFile]);

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
    <div>
      <h1>Upload a Video</h1>
      <input type="file" accept="video/*" onChange={handleFileChange} />

      {firstFrame && (
        <div>
          <h2>First Frame</h2>
          <img
            src={firstFrame}
            alt="First Frame"
            onClick={handleImageClick}
            style={{ cursor: 'crosshair', maxWidth: '100%', height: 'auto' }}
          />
        </div>
      )}

      {clickCoordinates && (
        <div>
          <h2>Clicked Coordinates</h2>
          <p>
            X: {clickCoordinates.x.toFixed(2)}, Y: {clickCoordinates.y.toFixed(2)}
          </p>
        </div>
      )}
    </div>
  );
};

export default Page;
