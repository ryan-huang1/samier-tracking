"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import VideoProcessingComponent from "@/components/VideoProcessingComponent";

const VideoProcessingPage = () => {
  const [processingResult, setProcessingResult] = useState<any>(null);
  const [firstFrameLoaded, setFirstFrameLoaded] = useState(false);

  const handleProcessingComplete = (result: any) => {
    setProcessingResult(result);
    console.log("Processing complete:", result);
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
              <pre>{JSON.stringify(processingResult, null, 2)}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VideoProcessingPage;