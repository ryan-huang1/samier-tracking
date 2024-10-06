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

  // Helper function to round to the hundredth place
  const roundToHundredth = (value: number) => {
    return Math.round(value * 100) / 100;
  };

  const handleProcessingComplete = (result: any) => {
    // Parse the response and extract relevant information
    if (result) {
      const debugVideoUrl = `http://127.0.0.1:5000${result.debug_video_url}`;
      const positions = result.positions;
      const velocities = result.velocities;

      // Convert positions to graph data points for InteractiveGraph, rounded to hundredth place
      const posData: PositionDataPoint[] = positions.time_steps.map((time: number, index: number) => ({
        x: roundToHundredth(time),
        y1: roundToHundredth(positions.x_positions_meters[index]),
        y2: roundToHundredth(positions.y_positions_meters_flipped[index]),
      }));

      // Convert velocities to graph data points for InteractiveGraph, rounded to hundredth place
      const velData: VelocityDataPoint[] = velocities.time_steps.map((time: number, index: number) => ({
        x: roundToHundredth(time),
        y1: roundToHundredth(velocities.x_velocities_m_per_s[index]),
        y2: roundToHundredth(velocities.y_velocities_m_per_s[index]),
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
    setPositionData(prev => prev.filter((_, index) => !indices.includes(index)));
  };

  const handleDeleteVelocityPoints = (indices: number[]) => {
    setVelocityData(prev => prev.filter((_, index) => !indices.includes(index)));
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card
        className={`w-full ${
          processingResult ? "w-3/5 my-10" : "max-w-md"
        } transition-width duration-300`}
      >
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
              {/* Position Graph with Top and Bottom Margin of 40px */}
              <div className="my-10">
                <h3 className="text-lg font-semibold pb-2.5">Position Graph:</h3>
                <InteractiveGraph 
                  data={positionData} 
                  graphTitle="Position Data" 
                  graphDescription="Position over time for X and Y directions" 
                  onDelete={handleDeletePositionPoints}
                />
              </div>
              {/* Velocity Graph with Top Margin of 40px and No Bottom Margin */}
              <div className="mt-10 mb-0">
                <h3 className="text-lg font-semibold pb-2.5">Velocity Graph:</h3>
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
