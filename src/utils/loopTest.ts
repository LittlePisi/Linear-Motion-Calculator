import React, { useState, useEffect } from 'react';
import * as ExcelJS from 'exceljs';
import * as fs from 'fs/promises';

// Define the ParameterSet interface (same as in your React module)
export interface ParameterSet {
  name: string;
  lead: string;
  M_idleTorque: string;
  M_zsInertia: string;
  M_pmInertia: string;
  M_maxTorque: string;
  ScrewDLR: string;
  Screw_dr: string;
  Screw_la: string;
  mod_Mx: string;
  mod_My: string;
  mod_Mz: string;
  mod_lever: string;
  mod_GSLM: string;
  mod_Zd: string;
  mod_pic: string;
  mod_maxSpeed: string;
  mod_maxAcc: string;
}

// Script to export data from XLSX to JSON
async function exportExcelToJson(inputFile: string, outputFile: string): Promise<void> {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(inputFile);
    const worksheet = workbook.worksheets[0];
    const data: ParameterSet[] = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 1) { // Skip header row
        data.push({
          name: (row.getCell(1).value ?? '').toString(),
          lead: (row.getCell(2).value ?? '').toString(),
          M_idleTorque: (row.getCell(3).value ?? '').toString(),
          M_zsInertia: (row.getCell(4).value ?? '').toString(),
          M_pmInertia: (row.getCell(5).value ?? '').toString(),
          M_maxTorque: (row.getCell(6).value ?? '').toString(),
          ScrewDLR: (row.getCell(7).value ?? '').toString(),
          Screw_dr: (row.getCell(8).value ?? '').toString(),
          Screw_la: (row.getCell(9).value ?? '').toString(),
          mod_Mx: (row.getCell(10).value ?? '').toString(),
          mod_My: (row.getCell(11).value ?? '').toString(),
          mod_Mz: (row.getCell(12).value ?? '').toString(),
          mod_lever: (row.getCell(13).value ?? '').toString(),
          mod_GSLM: (row.getCell(14).value ?? '').toString(),
          mod_Zd: (row.getCell(15).value ?? '').toString(),
          mod_pic: (row.getCell(16).value ?? '').toString(),
          mod_maxSpeed: (row.getCell(17).value ?? '').toString(),
          mod_maxAcc: (row.getCell(18).value ?? '').toString(),
        });
      }
    });

    await fs.writeFile(outputFile, JSON.stringify(data, null, 2));
    console.log(`Data exported successfully to ${outputFile}`);
  } catch (error) {
    console.error('Error exporting Excel data:', error);
  }
}

export default exportExcelToJson;

//exportExcelToJson('LinearModule.xlsx', 'linearModuleData.json');

// Load data from JSON (assuming it's in the same directory)
const data: ParameterSet[] = require('./linearModuleData.json');

// Function to search and output suitable rows based on criteria
function searchSuitableSets(criteria: {
  minMaxTorque?: number; // Example: Filter by minimum M_maxTorque
  nameSearch?: string;   // Example: Filter by name containing this string
}): ParameterSet[] {
  return data.filter(set => {
    let isSuitable = true;

    // Example criterion: M_maxTorque > minMaxTorque
    if (criteria.minMaxTorque !== undefined) {
      const torque = parseFloat(set.M_maxTorque);
      if (isNaN(torque) || torque <= criteria.minMaxTorque) {
        isSuitable = false;
      }
    }

    // Example criterion: Name contains search term (case-insensitive)
    if (criteria.nameSearch !== undefined) {
      if (!set.name.toLowerCase().includes(criteria.nameSearch.toLowerCase())) {
        isSuitable = false;
      }
    }

    // Add more criteria here as needed, e.g., based on other fields

    return isSuitable;
  });
}

// Example usage: Search for sets with M_maxTorque > 50 and name containing 'example'
const suitableSets = searchSuitableSets({
  minMaxTorque: 50,
  nameSearch: 'example',
});

console.log('Suitable sets:');
suitableSets.forEach(set => {
  console.log(set);
});

// If you just want to output all rows without filtering:
// data.forEach(set => console.log(set));
