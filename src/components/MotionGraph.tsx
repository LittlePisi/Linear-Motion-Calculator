import React, { useEffect, useRef } from 'react';
import { MotionResults } from '../types';

interface MotionGraphProps {
  results: MotionResults;
  darkMode: boolean;
}

const MotionGraph: React.FC<MotionGraphProps> = ({ results, darkMode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const padding = 60;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Set background
    ctx.fillStyle = darkMode ? '#1f2937' : '#ffffff';
    ctx.fillRect(0, 0, width, height);

    const totalTime = results.totalCycleTime;
    const maxVelocity = results.maxVelocity;
    //const maxPosition = results.stroke;
    const maxPosition = Math.max(...results.torqueProfile.map(p => Math.abs(p.position)));

    // Calculate scales
    const scaleX = (width - 2 * padding) / totalTime;
    const scaleYVelocity = (height - 2 * padding) / maxVelocity;
    const scaleYPosition = (height - 2 * padding) / maxPosition;

    // Draw axes
    ctx.beginPath();
    ctx.strokeStyle = darkMode ? '#4b5563' : '#94a3b8';
    ctx.lineWidth = 1;
    
    // X-axis (time)
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    
    // Y-axis (velocity/position)
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    
    ctx.stroke();

    // Draw grid and labels
    ctx.font = '12px Arial';
    ctx.fillStyle = darkMode ? '#9ca3af' : '#64748b';

    // Time labels with pause time indication
    const activeTime = totalTime - results.pauseTime;
    for (let t = 0; t <= totalTime; t += totalTime / 5) {
      const x = padding + t * scaleX;
      ctx.fillText(t.toFixed(1) + 'с', x - 15, height - padding + 20);
      if (t >= activeTime && t <= totalTime) {
        ctx.fillStyle = darkMode ? '#374151' : '#e2e8f0';
        ctx.fillRect(
          padding + activeTime * scaleX,
          padding,
          (totalTime - activeTime) * scaleX,
          height - 2 * padding
        );
        ctx.fillStyle = darkMode ? '#9ca3af' : '#64748b';
      }
    }

    // Velocity labels (left)
    for (let v = 0; v <= maxVelocity; v += maxVelocity / 4) {
      const y = height - padding - v * scaleYVelocity;
      ctx.fillText(v.toFixed(0) + 'мм/с', 2, y + 4);
    }

    // Position labels (right)
    for (let p = 0; p <= maxPosition; p += maxPosition / 4) {
      const y = height - padding - p * scaleYPosition;
      ctx.fillText(p.toFixed(0) + 'мм', width - padding + 5, y + 4);
    }

    // Draw velocity profile
    if (results.torqueProfile.length > 0) {
      ctx.beginPath();
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 2;

      results.torqueProfile.forEach((point, i) => {
        const x = padding + point.time * scaleX;
        const y = height - padding - point.velocity * scaleYVelocity;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }

    // Draw position profile
    if (results.torqueProfile.length > 0) {
      ctx.beginPath();
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 2;

      results.torqueProfile.forEach((point, i) => {
        const x = padding + point.time * scaleX;
        const y = height - padding - point.position * scaleYPosition;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }

    // Add legend
    const legendY = padding - 30;
    ctx.font = '12px Arial';
    
    // Velocity legend
    ctx.strokeStyle = '#6366f1';
    ctx.beginPath();
    ctx.moveTo(padding + 10, legendY);
    ctx.lineTo(padding + 40, legendY);
    ctx.stroke();
    ctx.fillStyle = '#6366f1';
    ctx.fillText('Скорость [мм/с]', padding + 50, legendY + 4);

    // Position legend
    ctx.strokeStyle = '#22c55e';
    ctx.beginPath();
    ctx.moveTo(padding + 180, legendY);
    ctx.lineTo(padding + 210, legendY);
    ctx.stroke();
    ctx.fillStyle = '#22c55e';
    ctx.fillText('Перемещение [мм]', padding + 220, legendY + 4);

  }, [results, darkMode]);

  return (
    <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
        Профиль перемещения
      </h3>
      <canvas
        ref={canvasRef}
        width={800}
        height={400}
        className="w-full h-auto rounded-lg"
      />
    </div>
  );
};

export default MotionGraph;