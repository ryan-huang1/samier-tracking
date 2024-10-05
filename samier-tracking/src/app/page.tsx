// Updated version of `VideoProcessingPage`
"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import VideoProcessingComponent from "@/components/VideoProcessingComponent";

const VideoProcessingPage = () => {
  const [processingResult, setProcessingResult] = useState<any>(null);
  const [firstFrameLoaded, setFirstFrameLoaded] = useState(false);

  const handleProcessingComplete = (result: any) => {
    // Parse the response and extract relevant information
    if (result) {
      const debugVideoUrl = `http://127.0.0.1:5000${result.debug_video_url}`;
      const positions = result.positions;
      const velocities = result.velocities;

      // Set the parsed result to the state
      setProcessingResult({
        debugVideoUrl,
        positions,
        velocities,
      });

      console.log("Processing complete:", {
        debugVideoUrl,
        positions,
        velocities,
      });
    }
  };

  const handleFirstFrameLoaded = () => {
    setFirstFrameLoaded(true);
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        {!firstFrameLoaded && (
          <CardHeader>
            <CardTitle className="text-2xl">Samier Object Tracking</CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <VideoProcessingComponent
            onProcessingComplete={handleProcessingComplete}
            onFirstFrameLoaded={handleFirstFrameLoaded}
          />
          {processingResult && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold">Processing Result:</h3>
              <div className="mt-2">
                <h4 className="text-md font-semibold">Debug Video:</h4>
                <a href={processingResult.debugVideoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                  View Debug Video (opens in a new tab)
                </a>
              </div>
              <div className="mt-2">
                <h4 className="text-md font-semibold">Positions:</h4>
                <pre>{JSON.stringify(processingResult.positions, null, 2)}</pre>
              </div>
              <div className="mt-2">
                <h4 className="text-md font-semibold">Velocities:</h4>
                <pre>{JSON.stringify(processingResult.velocities, null, 2)}</pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VideoProcessingPage;