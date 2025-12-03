import React, { useState, useEffect } from 'react';
import { Upload, Download, RefreshCw } from 'lucide-react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

export default function AulasAnalyzer() {
  const [data, setData] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedTurno, setSelectedTurno] = useState('todos');
  const [uploadDateTime, setUploadDateTime] = useState(null);
  const [loadingStorage, setLoadingStorage] = useState(true);

  const PREDEFINED_AULAS = [
    'isamzoom2022@gmail.com',
    'aulaclases01@gmail.com',
    'aulaencus01@gmail.com',
    'aulaencus02@gmail.com',
    'aulaencus03@gmail.com',
    'isamaula01@gmail.com',
    'isamaula02@gmail.com',
    'isamaula03@gmail.com',
    'isamaula04@gmail.com',
    'isamaula05@gmail.com',
    'isamaula06@gmail.com',
    'isamaula10@gmail.com',
    'isamaula11@gmail.com',
    'isamaula12@gmail.com',
    'isamaula14@gmail.com',
    'isamaula18@gmail.com',
    'isamaula19@gmail.com',
    'isamaula20@gmail.com',
    'isamaula21@gmail.com',
    'isamaula22@gmail.com',
    'isamaula23@gmail.com',
    'isamaula25@gmail.com',
    'isamaula26@gmail.com',
    'isamaula27@gmail.com',
    'isamaula28@gmail.com',
    'isamaula29@gmail.com',
    'isamaula30@gmail.com',
    'isamaula31@gmail.com',
    'isamaula32@gmail.com',
    'isamaula33@gmail.com',
    'isamaula34@gmail.com',
    'isamaula35@gmail.com',
    'isamaula36@gmail.com',
    'isamaula37@gmail.com',
    'isamaula38@gmail.com',
    'isamaula41@gmail.com',
    'isamaula42@gmail.com',
    'isamaula43@gmail.com',
    'isamaula44@gmail.com',
    'isamaula45@gmail.com',
    'isamaula48@gmail.com',
    'isamaula49@gmail.com',
    'isamaula50@gmail.com',
    'isamaula51@gmail.com',
    'isamaula52@gmail.com',
    'isamaula53@gmail.com',
    'isamaula55@gmail.com',
    'isamaula56@gmail.com',
    'isamaula57@gmail.com',
    'isamaula58@gmail.com',
    'isamaula59@gmail.com',
    'isamaula60@gmail.com',
    'isamaula62@gmail.com',
    'isamaula63@gmail.com',
    'isamaula64@gmail.com',
    'isamaula65@gmail.com',
    'isamaula66@gmail.com',
    'isamaula68@gmail.com',
    'isamaula69@gmail.com',
    'isamaula71@gmail.com',
    'isamaula72@gmail.com',
    'isamaula73@gmail.com',
    'isamaula74@gmail.com',
    'isamaula76@gmail.com',
    'isamaula83@gmail.com',
    'isamaula85@gmail.com',
    'isamaula86@gmail.com',
    'isamaula87@gmail.com',
    'isamaula89@gmail.com',
    'isamaula90@gmail.com',
    'isamaula92@gmail.com',
    'isamaula93@gmail.com',
    'isamaula94@gmail.com',
    'isamaula95@gmail.com',
    'isamaula96@gmail.com',
    'isamaula98@gmail.com',
    'isamaula100@gmail.com',
    'isamaula104@gmail.com',
    'isamaula105@gmail.com',
    'isamaula106@gmail.com'
  ];

  useEffect(() => {
    loadDataFromStorage();
  }, []);

  const loadDataFromStorage = () => {
    try {
      setLoadingStorage(true);
      
      const storedData = localStorage.getItem('aulas-data');
      const storedDateTime = localStorage.getItem('aulas-upload-date');
      const storedTurno = localStorage.getItem('aulas-turno');
      
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setData(parsedData);
        
        if (storedDateTime) {
          setUploadDateTime(storedDateTime);
        }
        
        if (storedTurno) {
          setSelectedTurno(storedTurno);
        }
        
        analyzeData(parsedData, storedTurno || 'todos');
      }
    } catch (error) {
      console.log('No hay datos previos cargados');
    } finally {
      setLoadingStorage(false);
    }
  };

  const saveDataToStorage = (jsonData, dateTime, turno) => {
    try {
      localStorage.setItem('aulas-data', JSON.stringify(jsonData));
      localStorage.setItem('aulas-upload-date', dateTime);
      localStorage.setItem('aulas-turno', turno);
    } catch (error) {
      console.error('Error al guardar datos:', error);
    }
  };

  const handleTurnoChange = (e) => {
    const newTurno = e.target.value;
    setSelectedTurno(newTurno);
    if (data.length > 0) {
      analyzeData(data, newTurno);
      saveDataToStorage(data, uploadDateTime, newTurno);
    }
  };

  const isInTurno = (time, turno) => {
    const [hours, minutes] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    
    if (turno === 'todos') return true;
    if (turno === 'manana') return totalMinutes >= 420 && totalMinutes <= 780;
    if (turno === 'tarde') return totalMinutes >= 781 && totalMinutes <= 1010;
    if (turno === 'noche') return totalMinutes >= 1020 && totalMinutes <= 1440;
    
    return false;
  };

  const parseDateTime = (dateStr) => {
    const cleanStr = dateStr.replace(/\s*\(Recurrente\)\s*$/i, '').trim();
    const parts = cleanStr.split(' ');
    const datePart = parts[0];
    const timePart = parts[1];
    const meridiem = parts[2];
    
    const [day, month, year] = datePart.split('/');
    const [hours, minutes] = timePart.split(':');
    
    let hour = parseInt(hours);
    if (meridiem === 'PM' && hour !== 12) hour += 12;
    if (meridiem === 'AM' && hour === 12) hour = 0;
    
    const dateObj = new Date(year, month - 1, day, hour, parseInt(minutes));
    const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const dayName = daysOfWeek[dateObj.getDay()];
    
    const formattedTime = hour.toString().padStart(2, '0') + ':' + minutes;
    const sortKey = year + month.padStart(2, '0') + day.padStart(2, '0');
    const formattedDate = day + '/' + month + '/' + year;
    
    return {
      date: formattedDate,
      time: formattedTime,
      dayName: dayName,
      dateTime: dateObj,
      sortKey: sortKey
    };
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    
    const now = new Date();
    const dateStr = now.toLocaleDateString('es-PE', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const timeStr = now.toLocaleTimeString('es-PE', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
    const fullDateTime = dateStr + ' a las ' + timeStr;
    setUploadDateTime(fullDateTime);
    
    const fileExtension = file.name.split('.').pop().toLowerCase();

    if (fileExtension === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const cleanedData = results.data.map(row => {
              const cleanRow = {};
              Object.keys(row).forEach(key => {
                cleanRow[key.trim()] = row[key];
              });
              return cleanRow;
            });
            
            setData(cleanedData);
            analyzeData(cleanedData, selectedTurno);
            saveDataToStorage(cleanedData, fullDateTime, selectedTurno);
          } catch (error) {
            alert('Error al procesar el archivo CSV: ' + error.message);
          } finally {
            setLoading(false);
          }
        },
        error: (error) => {
          alert('Error al leer el archivo CSV: ' + error.message);
          setLoading(false);
        }
      });
    } else if (fileExtension === 'xls' || fileExtension === 'xlsx') {
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const workbook = XLSX.read(event.target.result, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet);

          setData(jsonData);
          analyzeData(jsonData, selectedTurno);
          saveDataToStorage(jsonData, fullDateTime, selectedTurno);
        } catch (error) {
          alert('Error al procesar el archivo Excel: ' + error.message);
        } finally {
          setLoading(false);
        }
      };

      reader.readAsBinaryString(file);
    } else {
      alert('Formato de archivo no soportado. Por favor usa CSV, XLS o XLSX.');
      setLoading(false);
    }
  };

  const analyzeData = (jsonData, turno = 'todos') => {
    const aulasByDate = {};
    const allDates = new Set();
    const foundAulas = new Set();
    
    jsonData.forEach((row) => {
      const horaInicio = row['Hora de inicio'] || row['Hora_de_inicio'] || row['Hora_de _inicio'];
      const correo = (row['Correo Electrónico del anfitrión'] || row['Correo_Electrónico_del_anfitrión'] || '').trim();
      
      if (!horaInicio || !correo) return;

      const { date, time, sortKey, dayName } = parseDateTime(horaInicio);
      
      if (!isInTurno(time, turno)) return;
      
      allDates.add(JSON.stringify({ date, sortKey, dayName }));
      foundAulas.add(correo);
      
      if (!aulasByDate[correo]) {
        aulasByDate[correo] = {};
      }
      
      if (!aulasByDate[correo][date]) {
        aulasByDate[correo][date] = 0;
      }
      
      aulasByDate[correo][date]++;
    });

    const sortedDates = Array.from(allDates)
      .map(str => JSON.parse(str))
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey));

    const sortedAulas = [...PREDEFINED_AULAS];
    
    Array.from(foundAulas)
      .filter(aula => !PREDEFINED_AULAS.includes(aula))
      .sort()
      .forEach(aula => sortedAulas.push(aula));

    const matrixData = sortedAulas.map(aula => {
      const row = { aula };
      sortedDates.forEach(dateInfo => {
        const count = aulasByDate[aula]?.[dateInfo.date] || 0;
        row[dateInfo.date] = count;
      });
      return row;
    });

    setResults({
      matrix: matrixData,
      dates: sortedDates,
      aulas: sortedAulas
    });
  };

  const exportToExcel = () => {
    if (!results) return;

    const wsData = [];
    const header = ['Aula', ...results.dates.map(d => d.dayName + ' ' + d.date)];
    wsData.push(header);

    results.matrix.forEach(row => {
      const rowData = [row.aula];
      results.dates.forEach(dateInfo => {
        const count = row[dateInfo.date];
        rowData.push(count === 0 ? 'Libre' : count);
      });
      wsData.push(rowData);
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Disponibilidad Aulas');
    XLSX.writeFile(wb, 'disponibilidad_aulas.xlsx');
  };

  const handleRefresh = () => {
    setLoadingStorage(true);
    loadDataFromStorage();
  };

  const getCellStyle = (count) => {
    if (count === 0) return 'bg-green-100 text-green-800 font-semibold';
    if (count === 1) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getCellText = (count) => {
    if (count === 0) return 'Libre';
    return count + ' clase' + (count > 1 ? 's' : '');
  };

  if (loadingStorage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600"></div>
          <p className="mt-4 text-gray-700 text-lg">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Matriz de Disponibilidad de Aulas
            </h1>
            <p className="text-gray-600">
              Vista completa de ocupación por aula y día
            </p>
            {uploadDateTime && (
              <div className="mt-4 flex items-center justify-center gap-3">
                <div className="inline-block bg-indigo-100 text-indigo-800 px-4 py-2 rounded-lg text-sm font-medium">
                  📅 Información cargada el {uploadDateTime}
                </div>
                <button
                  onClick={handleRefresh}
                  className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                  title="Actualizar datos"
                >
                  <RefreshCw className="w-4 h-4" />
                  Actualizar
                </button>
              </div>
            )}
          </div>

          {!results && !loading && (
            <div className="mb-8">
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-indigo-300 rounded-xl cursor-pointer bg-indigo-50 hover:bg-indigo-100 transition-all">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-12 h-12 text-indigo-500 mb-3" />
                  <p className="mb-2 text-lg font-semibold text-gray-700">
                    Cargar archivo Excel
                  </p>
                  <p className="text-sm text-gray-500">
                    Sube tu archivo CSV, XLS o XLSX con los datos de las reuniones
                  </p>
                </div>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <p className="mt-4 text-gray-600">Procesando archivo...</p>
            </div>
          )}

          {results && !loading && (
            <div>
              <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <div className="flex gap-4 items-center flex-wrap">
                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                      <span>Libre (0 clases)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
                      <span>Disponible (1 clase)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
                      <span>Ocupado (2+ clases)</span>
                    </div>
                  </div>
                  
                  <div className="ml-0 lg:ml-6">
                    <select
                      value={selectedTurno}
                      onChange={handleTurnoChange}
                      className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="todos">Todos los turnos</option>
                      <option value="manana">Mañana (7:00 - 13:00)</option>
                      <option value="tarde">Tarde (13:01 - 16:50)</option>
                      <option value="noche">Noche (17:00 - 24:00)</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer">
                    <Upload className="w-4 h-4" />
                    Cargar nuevo archivo
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  
                  <button
                    onClick={exportToExcel}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Exportar a Excel
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="sticky left-0 z-10 px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider bg-gray-100 border-r-2 border-gray-300">
                        Aula
                      </th>
                      {results.dates.map((dateInfo, idx) => (
                        <th
                          key={idx}
                          className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap"
                        >
                          <div className="text-indigo-600 font-bold">{dateInfo.dayName}</div>
                          <div className="text-gray-600">{dateInfo.date}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {results.matrix.map((row, rowIdx) => (
                      <tr key={rowIdx} className="hover:bg-gray-50">
                        <td className="sticky left-0 z-10 px-4 py-3 text-sm font-medium text-gray-900 bg-white border-r-2 border-gray-200 whitespace-nowrap">
                          {row.aula}
                        </td>
                        {results.dates.map((dateInfo, colIdx) => {
                          const count = row[dateInfo.date];
                          return (
                            <td
                              key={colIdx}
                              className={'px-4 py-3 text-sm text-center ' + getCellStyle(count)}
                            >
                              {getCellText(count)}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  <strong>Total de aulas mostradas:</strong> {results.aulas.length} 
                  <span className="text-gray-500 ml-1">(81 predefinidas + adicionales)</span> | 
                  <strong className="ml-3">Total de días:</strong> {results.dates.length} |
                  <strong className="ml-3">Turno activo:</strong> {
                    selectedTurno === 'todos' ? 'Todos' :
                    selectedTurno === 'manana' ? 'Mañana (7:00-13:00)' :
                    selectedTurno === 'tarde' ? 'Tarde (13:01-16:50)' :
                    'Noche (17:00-24:00)'
                  }
                </p>
              </div>
            </div>
          )}

          {!results && !loading && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                📋 Cómo funciona
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span><strong>81 aulas predefinidas:</strong> La matriz siempre muestra las 81 aulas principales en orden específico</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span><strong>Verde (Libre):</strong> El aula no tiene clases programadas ese día en el turno seleccionado</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span><strong>Amarillo (1 clase):</strong> El aula tiene solo 1 clase programada</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span><strong>Rojo (2+ clases):</strong> El aula tiene 2 o más clases programadas</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span><strong>Datos guardados localmente:</strong> Los datos se guardan en tu navegador y persisten entre sesiones</span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
