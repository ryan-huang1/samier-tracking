"use client"

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface DataPoint {
  x: number
  y1: number
  y2?: number
}

interface InteractiveGraphProps {
  data: DataPoint[];
  graphTitle: string;
  graphDescription: string;
  onDelete: (indices: number[]) => void;
}

const DARK_BLUE_LINE_NAME = "X Value"
const BLACK_LINE_NAME = "Y Value"

export function InteractiveGraph({ data, graphTitle, graphDescription, onDelete }: InteractiveGraphProps) {
  const [selectedPoints, setSelectedPoints] = useState<number[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const chartRef = useRef<HTMLDivElement>(null)

  const hasTwoLines = data.some(point => point.y2 !== undefined)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    setSelectedPoints([])
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !chartRef.current) return

    const chartRect = chartRef.current.getBoundingClientRect()
    const x = e.clientX - chartRect.left
    const selectedIndex = Math.floor((x / chartRect.width) * data.length)

    if (selectedIndex >= 0 && selectedIndex < data.length && !selectedPoints.includes(selectedIndex)) {
      setSelectedPoints(prev => [...prev, selectedIndex])
    }
  }, [isDragging, data.length, selectedPoints])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const deleteSelectedPoints = useCallback(() => {
    onDelete(selectedPoints)
    setSelectedPoints([])
  }, [selectedPoints, onDelete])

  const handleOutsideClick = useCallback((e: MouseEvent) => {
    if (chartRef.current && !chartRef.current.contains(e.target as Node)) {
      setSelectedPoints([])
    }
  }, [])

  useEffect(() => {
    document.addEventListener('click', handleOutsideClick)
    return () => {
      document.removeEventListener('click', handleOutsideClick)
    }
  }, [handleOutsideClick])

  const renderDot = (color: string) => ({ cx, cy, index }: { cx: number, cy: number, index: number }) => (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={selectedPoints.includes(index) ? 8 : 4}
        fill={selectedPoints.includes(index) ? "hsl(var(--destructive))" : color}
        stroke={selectedPoints.includes(index) ? "hsl(var(--destructive-foreground))" : "none"}
        strokeWidth={2}
      />
      {selectedPoints.includes(index) && (
        <circle
          cx={cx}
          cy={cy}
          r={12}
          fill="none"
          stroke="hsl(var(--destructive))"
          strokeWidth={2}
          opacity={0.5}
        />
      )}
    </g>
  )

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{graphTitle}</CardTitle>
        <CardDescription>{graphDescription}</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div
          ref={chartRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="w-full h-[400px] cursor-crosshair select-none"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="y1"
                stroke="#00008B"
                strokeWidth={2}
                name={DARK_BLUE_LINE_NAME}
                dot={renderDot("#00008B")}
              />
              {hasTwoLines && (
                <Line
                  type="monotone"
                  dataKey="y2"
                  stroke="#000000"
                  strokeWidth={2}
                  name={BLACK_LINE_NAME}
                  dot={renderDot("#000000")}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-between items-center p-4">
          <p className="text-sm text-muted-foreground">
            {selectedPoints.length} point{selectedPoints.length !== 1 ? 's' : ''} selected
          </p>
          <Button
            onClick={deleteSelectedPoints}
            disabled={selectedPoints.length === 0}
            variant="destructive"
          >
            Delete Selected Points
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
