// src/showdata.js
import XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to your Excel file
const excelPath = path.join(__dirname, '../public/intern_assignment_support_pack_dev_only_v3.xlsx');

// Read the Excel file
const workbook = XLSX.readFile(excelPath);

// Get the sheet named "Metric_Examples"
const worksheet = workbook.Sheets['Metric_Examples'];

// Convert to JSON
const data = XLSX.utils.sheet_to_json(worksheet);

// Print to console
// console.log('Data from Metric_Examples:');
// console.log(data);
// console.log(__dirname);

const srcPath = path.join(__dirname, 'metricExamples.json');
fs.writeFileSync(srcPath, JSON.stringify(data, null, 2));
console.log(`Saved to ${srcPath}`);
// Export if needed
export default data;