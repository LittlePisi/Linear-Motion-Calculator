import React, { useEffect, useRef } from 'react';
import { MotionResults } from '../types';

interface MotorGraphProps {
  results: MotionResults;
  darkMode: boolean;
}

const MotorGraph: React.FC<MotorGraphProps> = ({ results, darkMode }) => {
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

    // Motor values 
    const maxTorque = results.M_max;
    const maxRPM = results.N_max;
    const ratedTorque = results.M_nom;
    const ratedRPM = results.N_nom;

    // Calculated values
    const RMSTorque = results.meanTorque;
    const MeanRPM = results.meanRPM;
    const MAXTorque = results.maxTorque;
    const MAXRPM = results.maxRPM;
   

    const scaleX = (width - 2 * padding) / maxRPM;
    const scaleYTorque = (height - 2 * padding) / (maxTorque);


    // Draw axes and grid
    ctx.beginPath();
    ctx.strokeStyle = darkMode ? '#4b5563' : '#94a3b8';
    ctx.lineWidth = 1;
    
    // X-axis (time)
    ctx.moveTo(padding, height - padding );
    ctx.lineTo(width - padding, height - padding);
    
    // Y-axis
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    
    ctx.stroke();

    // Draw grid and labels
    ctx.font = '12px Arial';
    ctx.fillStyle = darkMode ? '#9ca3af' : '#64748b';


    // Torque labels (left)
    for (let t = 0; t <= maxTorque; t += maxTorque / 6) {
        const y = height  - t * scaleYTorque - padding;
        ctx.fillText(t.toFixed(1) + 'Н⋅м', 2, y + 4);
        ctx.moveTo(padding,  y);
        ctx.lineTo(width-padding ,  y);
    }

    // RPM labels (bottom)
    for (let rpm = 0 ; rpm <= maxRPM; rpm += maxRPM / 6) {
        const x = padding + rpm * scaleX;
        ctx.fillText(rpm.toFixed(0) + ' об/мин', x - 20, height - padding + 20);
        ctx.moveTo(x ,  height - padding);
        ctx.lineTo(x ,  padding);
        ctx.stroke();
    }



    // Draw peak torque profile
    ctx.beginPath();
    ctx.strokeStyle = '#f16366';
    ctx.lineWidth = 3;
    ctx.moveTo(0 + padding,  padding);
    ctx.lineTo(results.N_d * scaleX + padding,  padding);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = '#f16366';
    ctx.lineWidth = 3;
    ctx.moveTo(results.N_d * scaleX + padding, padding);
    ctx.lineTo(maxRPM * scaleX + padding, (maxTorque * scaleYTorque + padding));
    ctx.stroke();

    // Draw rated torque profile
    ctx.beginPath();
    ctx.strokeStyle = '#00adef';
    ctx.lineWidth = 3;
    ctx.moveTo(0 + padding, height - (ratedTorque * scaleYTorque) - padding);
    ctx.lineTo(ratedRPM * scaleX + padding, height - (ratedTorque * scaleYTorque) - padding);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = '#00adef';
    ctx.lineWidth = 3;
    ctx.moveTo(ratedRPM * scaleX + padding, height - (ratedTorque * scaleYTorque) - padding);
    ctx.lineTo(results.N_fp * scaleX + padding, height - (results.M_fp * scaleYTorque) - padding);
    ctx.stroke();

    // Draw mean work point
    ctx.beginPath();
    ctx.fillStyle = '#00adef';
    ctx.arc(MeanRPM * scaleX + padding,  height - (RMSTorque * scaleYTorque) - padding, 4, 0, 2 * Math.PI, false);
    ctx.fill();

    // Draw max work point
    ctx.beginPath();
    ctx.fillStyle = '#f16366';
    ctx.arc(MAXRPM * scaleX + padding,  height - (MAXTorque * scaleYTorque) - padding, 4, 0, 2 * Math.PI, false);
    ctx.fill();

  

    // Add legend
    const legendY = padding - 30;
    ctx.font = '12px Arial';
    
    // Draw legend 
    ctx.strokeStyle = '#6366f1';
    ctx.beginPath();
    ctx.fillStyle = '#66f163';
    ctx.arc(padding + 10, legendY, 4, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.fillStyle = '#66f163';
    ctx.fillText('Среднеквадратичные значения', padding + 30, legendY + 4);

    ctx.strokeStyle = '#6366f1';
    ctx.beginPath();
    ctx.fillStyle = '#f16366';
    ctx.arc(padding + 300, legendY, 4, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.fillStyle = '#f16366';
    ctx.fillText('Пиковые значения', padding + 320, legendY + 4);



  }, [results, darkMode]);

  return (
    <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      <h3 className={`text-xl font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
        Механическая характеристика двигателя {results.MotorName}
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

export default MotorGraph;

