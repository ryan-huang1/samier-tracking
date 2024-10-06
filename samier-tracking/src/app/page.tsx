"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import VideoProcessingComponent from "@/components/VideoProcessingComponent";
import { InteractiveGraph } from "@/components/interactive-graph";

interface PositionDataPoint {
  x: number;
  y1: number; // x_position
  y2: number; // y_position
}

interface VelocityDataPoint {
  x: number;
  y1: number; // x_velocity
  y2: number; // y_velocity
}

const VideoProcessingPage = () => {
  const [processingResult, setProcessingResult] = useState<any>(null);
  const [firstFrameLoaded, setFirstFrameLoaded] = useState(false);
  const [positionData, setPositionData] = useState<PositionDataPoint[]>([]);
  const [velocityData, setVelocityData] = useState<VelocityDataPoint[]>([]);

  const handleProcessingComplete = (result: any) => {
    // Parse the response and extract relevant information
    if (result) {
      const debugVideoUrl = `http://127.0.0.1:5000${result.debug_video_url}`;
      const positions = result.positions;
      const velocities = result.velocities;

      // Convert positions to graph data points for InteractiveGraph
      const posData: PositionDataPoint[] = positions.time_steps.map((time: number, index: number) => ({
        x: time,
        y1: positions.x_positions_meters[index],
        y2: positions.y_positions_meters_flipped[index],
      }));

      // Convert velocities to graph data points for InteractiveGraph
      const velData: VelocityDataPoint[] = velocities.time_steps.map((time: number, index: number) => ({
        x: time,
        y1: velocities.x_velocities_m_per_s[index],
        y2: velocities.y_velocities_m_per_s[index],
      }));

      // Set the parsed result to the state
      setProcessingResult({
        debugVideoUrl,
      });
      setPositionData(posData);
      setVelocityData(velData);

      console.log("Processing complete:", {
        debugVideoUrl,
        posData,
        velData,
      });
    }
  };

  const handleFirstFrameLoaded = () => {
    setFirstFrameLoaded(true);
  };

  const handleDeletePositionPoints = (indices: number[]) => {
    setPositionData(prev => prev.filter((_, index) => !indices.includes(index)))
  }

  const handleDeleteVelocityPoints = (indices: number[]) => {
    setVelocityData(prev => prev.filter((_, index) => !indices.includes(index)))
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        {!processingResult && (
          <>
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
            </CardContent>
          </>
        )}
        {processingResult && (
          <>
            <CardHeader>
              <CardTitle className="text-2xl">Processing Results Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mt-4">
                <h3 className="text-lg font-semibold">Debug Video:</h3>
                <a
                  href={processingResult.debugVideoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  View Debug Video (opens in a new tab)
                </a>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-semibold">Position Graph:</h3>
                <InteractiveGraph 
                  data={positionData} 
                  graphTitle="Position Data" 
                  graphDescription="Position over time for X and Y directions" 
                  onDelete={handleDeletePositionPoints}
                />
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-semibold">Velocity Graph:</h3>
                <InteractiveGraph 
                  data={velocityData} 
                  graphTitle="Velocity Data" 
                  graphDescription="Velocity over time for X and Y directions" 
                  onDelete={handleDeleteVelocityPoints}
                />
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
};

export default VideoProcessingPage;
