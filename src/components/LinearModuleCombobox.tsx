import React, { useState, useEffect } from 'react';
import * as ExcelJS from 'exceljs';

export interface ParameterSet {
  name: string;
  lead: string;
  M_idleTorque: string;
  M_zsInertia: string;
  M_pmInertia: string;
  M_maxTorque: string;
}

interface LMComboBoxProps {
  onSelectSet?: (selectedSet: ParameterSet | undefined) => void;
  darkMode?: boolean;
  selectedSetName: string;
  setSelectedSetName: (name: string) => void;
}

const LMComboBox: React.FC<LMComboBoxProps> = ({
  onSelectSet,
  darkMode = false,
  selectedSetName,
  setSelectedSetName
}) => {
  const [parameterSets, setParameterSets] = useState<ParameterSet[]>([]);

  // Load once on mount
  useEffect(() => {
    const fetchExcelData = async () => {
      try {
        const response = await fetch('/LinearModule.xlsx');
        const arrayBuffer = await response.arrayBuffer();
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(arrayBuffer);

        const worksheet = workbook.worksheets[0];
        const data: ParameterSet[] = [];
        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber > 1) {
            data.push({
              name: row.getCell(1).text,
              lead: row.getCell(2).text,
              M_idleTorque: row.getCell(3).text,
              M_zsInertia: row.getCell(4).text,
              M_pmInertia: row.getCell(5).text,
              M_maxTorque: row.getCell(6).text,
            });
          }
        });

        setParameterSets(data);

        if (data.length > 0) {
          // Ensure a valid default and notify parent immediately
          const current = data.find(s => s.name === selectedSetName) ?? data[0];
          setSelectedSetName(current.name);
          onSelectSet?.(current);
        } else {
          onSelectSet?.(undefined);
        }
      } catch (error) {
        console.error('Error reading Excel file:', error);
        onSelectSet?.(undefined);
      }
    };

    fetchExcelData();
  }, []); // mount-only (prevents re-fetch loops).  

  const handleChange = (name: string) => {
    setSelectedSetName(name);
    const selected = parameterSets.find(s => s.name === name);
    onSelectSet?.(selected);
  };

  return (
    <div className='flex items-center gap-2'>
      <label htmlFor="lm-parameterSet" className={`block text-sm w-1/3 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
        Выбор привода
      </label>

    <div className="flex-1 relative">
      <select
        id="lm-parameterSet"
        value={selectedSetName}
        onChange={(e) => handleChange(e.target.value)}
        className={`mt-0 px-3 block w-full h-9 text-sm rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
          darkMode ? 'bg-gray-700 border-gray-600 text-gray-200 focus:border-gray-500'
                   : 'border-gray-300 text-gray-700 focus:border-indigo-500'
        }`}
      >
        {parameterSets.map((set) => (
          <option key={set.name} value={set.name}>
            {set.name}
          </option>
        ))}
      </select>
    </div>

    </div>
  );
};

export default LMComboBox;
