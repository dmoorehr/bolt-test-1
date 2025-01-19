import React, { useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { Upload, LogOut, Filter, Table as TableIcon } from 'lucide-react';
import * as XLSX from 'xlsx';

export function Dashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [filters, setFilters] = useState<Record<string, string>>({});

  // Define the columns we want to filter by
  const filterColumns = [
    'Job Family',
    'Job Function',
    'FLSA Status',
    'Employee Classification Type',
    'Employee Type',
    'Department',
    'Business Unit',
    'Division',
    'Country'
  ];

  // Get unique values for each filter column
  const filterOptions = useMemo(() => {
    const options: Record<string, Set<string>> = {};
    filterColumns.forEach(column => {
      options[column] = new Set(data.map(item => item[column]).filter(Boolean));
    });
    return options;
  }, [data]);

  // Filter the data based on selected filters
  const filteredData = useMemo(() => {
    return data.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        return !value || item[key] === value;
      });
    });
  }, [data, filters]);

  const handleFilterChange = (column: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [column]: value
    }));
  };

  const processData = async (data: any[], headers: string[]) => {
    try {
      setData(data);
      setHeaders(headers);
      setFilters({}); // Reset filters when new data is loaded
      const { error } = await supabase
        .from('dashboard_data')
        .insert({ 
          data,
          headers,
          user_id: (await supabase.auth.getUser()).data.user?.id 
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Error processing file');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFile(file);

    const fileExt = file.name.split('.').pop()?.toLowerCase();
    
    if (fileExt === 'csv') {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const csvData = e.target?.result as string;
          const rows = csvData.split('\n').map(row => row.split(','));
          const headers = rows[0].map(header => header.trim());
          const parsedData = rows.slice(1)
            .filter(row => row.some(cell => cell.trim())) // Skip empty rows
            .map(row => {
              const obj: any = {};
              headers.forEach((header, i) => {
                const value = row[i]?.trim() || '';
                obj[header] = isNaN(Number(value)) ? value : Number(value);
              });
              return obj;
            });
          await processData(parsedData, headers);
        } catch (error) {
          console.error('Error processing CSV:', error);
          alert('Error processing CSV file');
        }
      };
      reader.readAsText(file);
    } else if (fileExt === 'xlsx' || fileExt === 'xls') {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const headers = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0] as string[];
          const parsedData = XLSX.utils.sheet_to_json(worksheet, { raw: false });
          await processData(parsedData, headers);
        } catch (error) {
          console.error('Error processing Excel:', error);
          alert('Error processing Excel file');
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      alert('Please upload a CSV or Excel file');
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error signing out:', error);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Analytics</h1>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleSignOut}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">
                Upload Spreadsheet
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        className="sr-only"
                        onChange={handleFileUpload}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">CSV or Excel files</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {data.length > 0 && headers.length > 0 && (
          <>
            <div className="mt-8 bg-white shadow sm:rounded-lg p-6">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Filter className="h-5 w-5 mr-2" />
                  Filters
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filterColumns.map(column => (
                    <div key={column} className="flex flex-col">
                      <label htmlFor={column} className="block text-sm font-medium text-gray-700 mb-1">
                        {column}
                      </label>
                      <select
                        id={column}
                        value={filters[column] || ''}
                        onChange={(e) => handleFilterChange(column, e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      >
                        <option value="">All</option>
                        {Array.from(filterOptions[column] || []).sort().map(value => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 bg-white shadow sm:rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <TableIcon className="h-5 w-5 mr-2" />
                  Data Table
                </h2>
                <p className="text-sm text-gray-500">
                  Showing {filteredData.length} of {data.length} records
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {headers.map((header) => (
                        <th
                          key={header}
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredData.map((row, rowIndex) => (
                      <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        {headers.map((header) => (
                          <td
                            key={header}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                          >
                            {(row[header]?.toString() || '')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}