import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { MotionParameters } from '../types';


interface ParameterPresetsProps {
  onSelectPreset: (preset: Partial<MotionParameters>) => void;
  darkMode: boolean;
}

interface PresetData {
  name: string;
  parameters: Partial<MotionParameters>;
}

const ParameterPresets: React.FC<ParameterPresetsProps> = ({ onSelectPreset, darkMode }) => {
  // Hardcoded presets data
  const presets: PresetData[] = [
    {
      name: "ITO40",
      parameters: {
        lead: 99,
        externalInertia: 0.93 + 1000 * 2,
        idleTorque: 0.1
      }
    },
    {
      name: "ITO60",
      parameters: {
        lead: 130,
        externalInertia: 2 + 1000 * 5.1,
        idleTorque: 0.35
      }
    },
    {
      name: "ITO80",
      parameters: {
        lead: 176,
        externalInertia: 8.2 + 1000 * 8.6,
        idleTorque: 0.5
      }
    },
    {
      name: "ITO100",
      parameters: {
        lead: 224,
        externalInertia: 14.2 + 1000 * 12.4,
        idleTorque: 0.9
      }
    },
    {
      name: "ITO160",
      parameters: {
        lead: 176,
        externalInertia: 15.9 + 1000 * 15,
        idleTorque: 1.5
      }
    }
  ];

  const [isOpen, setIsOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>('');

  const handlePresetSelect = (presetName: string) => {
    const preset = presets.find(p => p.name === presetName);
    if (preset) {
      setSelectedPreset(presetName);
      onSelectPreset(preset.parameters);
      setIsOpen(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border transition-colors ${
            darkMode
              ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600'
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <span className="truncate">
            {selectedPreset || 'Выберите пресет...'}
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className={`absolute top-full left-0 right-0 mt-1 rounded-lg border shadow-lg z-50 max-h-60 overflow-y-auto ${
            darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
          }`}>
            {presets.map((preset, index) => (
              <button
                key={index}
                onClick={() => handlePresetSelect(preset.name)}
                className={`w-full text-left px-3 py-2 hover:bg-opacity-50 transition-colors ${
                  selectedPreset === preset.name
                    ? darkMode ? 'bg-indigo-600' : 'bg-indigo-100'
                    : darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100'
                }`}
              >
                <div className="truncate">{preset.name}</div>
                <div className={`text-xs truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {Object.keys(preset.parameters).length} параметров
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
        Доступно {presets.length} пресетов
      </div>
    </div>
  );
};

export default ParameterPresets;