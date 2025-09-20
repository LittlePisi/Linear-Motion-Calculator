import React, { useState, useEffect } from 'react';
import * as ExcelJS from 'exceljs';

export interface MTParameterSet {
  name: string;
  M_nom: string;
  N_nom: string;
  M_max: string;
  N_max: string;
  motorRotorInertia: string;
  M_torqueConstant: string;
  M_fp: string;
  N_fp: string;
  N_d: string;
  mot_pic: string;
}

interface MTComboBoxProps {
  onSelectSet?: (selectedSet: MTParameterSet | undefined) => void;
  darkMode?: boolean;
  selectedMTSetName: string;
  setSelectedSetName: (name: string) => void;
}

const MTComboBox: React.FC<MTComboBoxProps> = ({
  onSelectSet,
  darkMode = false,
  selectedMTSetName,
  setSelectedSetName
}) => {
  const [parameterSets, setParameterSets] = useState<MTParameterSet[]>([]);

  useEffect(() => {
    const fetchExcelData = async () => {
      try {
        const response = await fetch('/Motors.xlsx');
        const arrayBuffer = await response.arrayBuffer();
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(arrayBuffer);

        const worksheet = workbook.worksheets[0];
        const data: MTParameterSet[] = [];
        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber > 1) {
            data.push({
              name: row.getCell(1).text,
              M_nom: row.getCell(2).text,
              N_nom: row.getCell(3).text,
              M_max: row.getCell(4).text,
              N_max: row.getCell(5).text,
              motorRotorInertia: row.getCell(6).text,
              M_torqueConstant: row.getCell(7).text,
              M_fp: row.getCell(8).text, 
              N_fp: row.getCell(9).text,
              N_d: row.getCell(10).text,
              mot_pic: row.getCell(11).text,
            });
          }
        });

        setParameterSets(data);

        if (data.length > 0) {
          const current = data.find(s => s.name === selectedMTSetName) ?? data[0];
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
  }, []); // mount-only  

  const handleChange = (name: string) => {
    setSelectedSetName(name);
    const selected = parameterSets.find(s => s.name === name);
    onSelectSet?.(selected);
  };

  return (
    <div className='flex items-center gap-2'>
      <label htmlFor="gearbox-parameterSet" className={`block text-sm w-1/3 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
        Выбор двигателя
      </label>
    
    <div className="flex-1 relative">
      <select
        id="gearbox-parameterSet"
        value={selectedMTSetName}
        onChange={(e) => handleChange(e.target.value)}
        className={`mt-0 px-3 block w-full h-9 text-sm rounded-lg shadow-sm focus:border-blue-400 focus:ring-blue-300 sm:text-sm ${
          darkMode ? 'bg-gray-700 border border-gray-600 text-gray-200 focus:border-gray-500'
                   : ' bg-gray-100 border border-gray-300 text-gray-700 focus:border-blue-500'
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

export default MTComboBox;
