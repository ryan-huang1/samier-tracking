"use client"

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface DataPoint {
  x: number
  y1: number
  y2: number
}

const GRAPH_TITLE = "Interactive Dual-Line Graph"
const GRAPH_DESCRIPTION = "Drag to select points, then click the button to delete them. Click outside the graph to clear selection."
const DARK_BLUE_LINE_NAME = "Dark Blue Line"
const BLACK_LINE_NAME = "Black Line"

export function InteractiveGraph() {
  const [data, setData] = useState<DataPoint[]>([
    { x: 1, y1: 5, y2: 3 },
    { x: 2, y1: 3, y2: 4 },
    { x: 3, y1: 7, y2: 6 },
    { x: 4, y1: 2, y2: 5 },
    { x: 5, y1: 6, y2: 4 },
  ])
  const [selectedPoints, setSelectedPoints] = useState<number[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const chartRef = useRef<HTMLDivElement>(null)

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

    if (!selectedPoints.includes(selectedIndex)) {
      setSelectedPoints(prev => [...prev, selectedIndex])
    }
  }, [isDragging, data.length, selectedPoints])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const deleteSelectedPoints = useCallback(() => {
    setData(prev => prev.filter((_, index) => !selectedPoints.includes(index)))
    setSelectedPoints([])
  }, [selectedPoints])

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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{GRAPH_TITLE}</CardTitle>
        <CardDescription>{GRAPH_DESCRIPTION}</CardDescription>
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
                dot={({ cx, cy, index }) => (
                  <g>
                    <circle
                      cx={cx}
                      cy={cy}
                      r={selectedPoints.includes(index) ? 8 : 4}
                      fill={selectedPoints.includes(index) ? "hsl(var(--destructive))" : "#00008B"}
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
                )}
              />
              <Line
                type="monotone"
                dataKey="y2"
                stroke="#000000"
                strokeWidth={2}
                name={BLACK_LINE_NAME}
                dot={({ cx, cy, index }) => (
                  <g>
                    <circle
                      cx={cx}
                      cy={cy}
                      r={selectedPoints.includes(index) ? 8 : 4}
                      fill={selectedPoints.includes(index) ? "hsl(var(--destructive))" : "#000000"}
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
                )}
              />
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