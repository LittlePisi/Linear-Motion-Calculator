import React, { useEffect, useRef } from 'react';
import { MotionResults } from '../types';

interface TorqueGraphProps {
  results: MotionResults;
  darkMode: boolean;
}

const TorqueGraph: React.FC<TorqueGraphProps> = ({ results, darkMode }) => {
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

    // Find max values for scaling
    const maxTorque = Math.max(...results.torqueProfile.map(p => Math.abs(p.torque)));
    const maxRPM = Math.max(...results.torqueProfile.map(p => Math.abs(p.rpm)));
    const totalTime = results.totalCycleTime;

    const scaleX = (width - 2 * padding) / totalTime;
    const scaleYTorque = (height - 2 * padding) / (2 * maxTorque);
    const scaleYRPM = (height - 2 * padding) / (2 * maxRPM);

    // Draw axes and grid
    ctx.beginPath();
    ctx.strokeStyle = darkMode ? '#4b5563' : '#94a3b8';
    ctx.lineWidth = 1;
    
    // X-axis (time)
    ctx.moveTo(padding, height / 2);
    ctx.lineTo(width - padding, height / 2);
    
    // Y-axis
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

    // Torque labels (left)
    for (let t = -maxTorque; t <= maxTorque; t += maxTorque / 2) {
      const y = height / 2 - t * scaleYTorque;
      ctx.fillText(t.toFixed(1) + 'Н⋅м', 2, y + 4);
    }

    // RPM labels (right)
    for (let rpm = -maxRPM; rpm <= maxRPM; rpm += maxRPM / 2) {
      const y = height / 2 - rpm * scaleYRPM;
      ctx.fillText(rpm.toFixed(0) + 'об/мин', width - padding + 0, y + 4);
    }

    // Draw torque profile
    if (results.torqueProfile.length > 0) {
      ctx.beginPath();
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 2;

      results.torqueProfile.forEach((point, i) => {
        const x = padding + point.time * scaleX;
        const y = height / 2 - point.torque * scaleYTorque;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }

    // Draw RPM profile
    if (results.torqueProfile.length > 0) {
      ctx.beginPath();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;

      results.torqueProfile.forEach((point, i) => {
        const x = padding + point.time * scaleX;
        const y = height / 2 - point.rpm * scaleYRPM;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }

    // Add legend
    const legendY = padding - 30;
    ctx.font = '12px Arial';
    
    // Torque legend
    ctx.strokeStyle = '#6366f1';
    ctx.beginPath();
    ctx.moveTo(padding + 10, legendY);
    ctx.lineTo(padding + 40, legendY);
    ctx.stroke();
    ctx.fillStyle = '#6366f1';
    ctx.fillText('Момент [Нм]', padding + 50, legendY + 4);

    // RPM legend
    ctx.strokeStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(padding + 180, legendY);
    ctx.lineTo(padding + 210, legendY);
    ctx.stroke();
    ctx.fillStyle = '#ef4444';
    ctx.fillText('Скорость вращения  [об/мин]', padding + 220, legendY + 4);

  }, [results, darkMode]);

  return (
    <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
        График момента и скорости вращения двигателя
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

export default TorqueGraph;