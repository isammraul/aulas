import React, { useState, useEffect } from 'react';
import { Upload, Download, RefreshCw, Search, Filter, TrendingUp, Calendar, Share2, ArrowUp, ArrowDown } from 'lucide-react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

export default function AulasAnalyzer() {
  const [data, setData] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedTurno, setSelectedTurno] = useState('todos');
  const [uploadDateTime, setUploadDateTime] = useState(null);
  const [loadingStorage, setLoadingStorage] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [showStats, setShowStats] = useState(false);
  const [gistId, setGistId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);

  // ID del Gist principal
  const MAIN_GIST_ID = '4eef79d272bdff63e7018c1c9803eb39';

  // URL del backend de Vercel
  const BACKEND_URL = 'https://aulas-vert.vercel.app';

  // Clave de admin (debe coincidir con ADMIN_KEY en Vercel)
  const ADMIN_KEY = 'isam123@@';

  const [aulas, setAulas] = useState([]);

  const [password, setPassword] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [showAulasManager, setShowAulasManager] = useState(false);
  const [newAulaEmail, setNewAulaEmail] = useState('');

  useEffect(() => {
    // Verificar sesión previa
    const isLogged = localStorage.getItem('is-admin') === 'true';
    if (isLogged) {
      setIsAdmin(true);
    }

    const urlParams = new URLSearchParams(window.location.search);
    const sharedGist = urlParams.get('gist');

    if (sharedGist) {
      loadFromGist(sharedGist);
    } else if (MAIN_GIST_ID && MAIN_GIST_ID.trim() !== '') {
      loadFromGist(MAIN_GIST_ID);
    } else {
      // Si no hay Gist, intentar cargar de localStorage
      const storedAulas = localStorage.getItem('aulas-list');
      if (storedAulas) {
        setAulas(JSON.parse(storedAulas));
      }
      setLoadingStorage(false);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_KEY) {
      setIsAdmin(true);
      localStorage.setItem('is-admin', 'true');
      setShowLogin(false);
      setPassword('');
      alert('✅ Sesión iniciada como administrador');
    } else {
      alert('❌ Clave incorrecta');
    }
  };

  // Guardar aulas en localStorage cuando cambien
  useEffect(() => {
    if (aulas && aulas.length > 0) {
      localStorage.setItem('aulas-list', JSON.stringify(aulas));
    }
  }, [aulas]);

  const handleLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('is-admin');
    alert('BYE 👋');
  };

  const addAula = () => {
    if (!newAulaEmail.trim()) return;

    // Soporte para múltiples correos (coma o nueva línea)
    const emails = newAulaEmail
      .split(/[\n,]+/)
      .map(e => e.trim())
      .filter(e => e && e.includes('@')); // Validación básica

    if (emails.length === 0) {
      alert('No se detectaron correos válidos');
      return;
    }

    const updatedAulas = [...new Set([...aulas, ...emails])]; // SIN .sort()
    setAulas(updatedAulas);
    setNewAulaEmail('');

    // Si hay datos cargados, re-analizar con la nueva aula
    if (data.length > 0) {
      analyzeData(data, selectedTurno, updatedAulas);
    }
  };

  const moveAula = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= aulas.length) return;

    const updatedAulas = [...aulas];
    const temp = updatedAulas[index];
    updatedAulas[index] = updatedAulas[newIndex];
    updatedAulas[newIndex] = temp;

    setAulas(updatedAulas);
    if (data.length > 0) {
      analyzeData(data, selectedTurno, updatedAulas);
    }
  };
  const handleDragStartItem = (index) => {
    setDragIndex(index);
  };
  const handleDragOverItem = (e) => {
    e.preventDefault();
  };
  const handleDropItem = (index) => {
    if (dragIndex === null || dragIndex === index) return;
    const updatedAulas = [...aulas];
    const [moved] = updatedAulas.splice(dragIndex, 1);
    updatedAulas.splice(index, 0, moved);
    setDragIndex(null);
    setAulas(updatedAulas);
    if (data.length > 0) {
      analyzeData(data, selectedTurno, updatedAulas);
    }
  };

  const removeAllAulas = () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar TODAS las aulas de la lista?')) {
      setAulas([]);
      if (data.length > 0) {
        analyzeData(data, selectedTurno, []);
      }
    }
  };

  const removeAula = (email) => {
    if (window.confirm(`¿Seguro que quieres eliminar el aula ${email}?`)) {
      const updatedAulas = aulas.filter(a => a !== email);
      setAulas(updatedAulas);

      if (data.length > 0) {
        analyzeData(data, selectedTurno, updatedAulas);
      }
    }
  };

  const loadDataFromStorage = () => {
    try {
      setLoadingStorage(true);

      const storedData = localStorage.getItem('aulas-data');
      const storedDateTime = localStorage.getItem('aulas-upload-date');
      const storedTurno = localStorage.getItem('aulas-turno');
      const storedGistId = localStorage.getItem('aulas-gist-id');

      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setData(parsedData);

        if (storedDateTime) {
          setUploadDateTime(storedDateTime);
        }

        if (storedTurno) {
          setSelectedTurno(storedTurno);
        }

        if (storedGistId) {
          setGistId(storedGistId);
        }

        analyzeData(parsedData, storedTurno || 'todos');
      }
    } catch (error) {
      console.log('No hay datos previos cargados');
    } finally {
      setLoadingStorage(false);
    }
  };

  const saveDataToStorage = (jsonData, dateTime, turno, updatedAulas) => {
    try {
      localStorage.setItem('aulas-data', JSON.stringify(jsonData));
      localStorage.setItem('aulas-upload-date', dateTime);
      localStorage.setItem('aulas-turno', turno);
      if (updatedAulas) {
        localStorage.setItem('aulas-list', JSON.stringify(updatedAulas));
      }
    } catch (error) {
      console.error('Error al guardar datos:', error);
    }
  };

  const saveToGist = async (jsonData, dateTime, updatedAulas) => {
    try {
      setLoading(true);
      // Llamar al backend de Vercel
      const response = await fetch(`${BACKEND_URL}/api/update-gist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminKey: ADMIN_KEY,
          data: jsonData || data,
          uploadDateTime: dateTime || uploadDateTime,
          aulas: updatedAulas || aulas
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (!jsonData && !dateTime) {
          alert('✅ ¡Listado de aulas guardado en la nube!');
        } else {
          alert('✅ ¡Datos actualizados automáticamente!\n\nTodos los usuarios verán la información actualizada.');
        }
        console.log('✅ Gist actualizado:', result);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar');
      }
    } catch (error) {
      console.error('❌ Error al actualizar Gist:', error);
      let errorMsg = 'Error al actualizar los datos.';
      if (error.message.includes('403')) errorMsg = 'Error 403: No tienes permisos para actualizar (clave incorrecta o token expirado).';
      if (error.message.includes('Failed to fetch')) errorMsg = 'Error de conexión: No se pudo contactar con el servidor. Verifica tu internet.';

      alert(`❌ ${errorMsg}\n\nDetalles: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadFromGist = async (id) => {
    try {
      setLoadingStorage(true);
      // Añadir timestamp para evitar caché del navegador o de GitHub
      const response = await fetch(`https://api.github.com/gists/${id}?t=${Date.now()}`);
      if (response.ok) {
        const gist = await response.json();
        const content = gist.files['aulas-data.json'].content;
        const gistData = JSON.parse(content);

        setData(gistData.data);
        setUploadDateTime(gistData.uploadDateTime);

        const currentAulas = gistData.aulas || JSON.parse(localStorage.getItem('aulas-list') || '[]');
        if (gistData.aulas && gistData.aulas.length > 0) {
          setAulas(gistData.aulas);
        } else {
          // Si el Gist no tiene aulas pero el storage sí, mantenemos las del storage
          const storedAulas = localStorage.getItem('aulas-list');
          if (storedAulas) {
            setAulas(JSON.parse(storedAulas));
          }
        }

        analyzeData(gistData.data, selectedTurno, currentAulas);

        // Solo guardar en localStorage si es admin
        if (isAdmin) {
          saveDataToStorage(gistData.data, gistData.uploadDateTime, selectedTurno, currentAulas);
        }

        setGistId(id);
      } else {
        throw new Error('Gist no encontrado');
      }
    } catch (error) {
      console.error('Error al cargar desde Gist:', error);
      // No mostrar error si no hay datos aún
    } finally {
      setLoadingStorage(false);
    }
  };

  const handleTurnoChange = (e) => {
    const newTurno = e.target.value;
    setSelectedTurno(newTurno);
    if (data.length > 0) {
      analyzeData(data, newTurno, aulas);
      saveDataToStorage(data, uploadDateTime, newTurno, aulas);
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
    try {
      if (!dateStr || typeof dateStr !== 'string') return null;

      const cleanStr = dateStr.replace(/\s*\(Recurrente\)\s*$/i, '').trim();
      const parts = cleanStr.split(/\s+/); // Manejar cualquier cantidad de espacios

      if (parts.length < 2) return null;

      const datePart = parts[0];
      const timePart = parts[1];
      const meridiem = parts[2] ? parts[2].toUpperCase() : null;

      // Soportar separadores / y -
      const dateBits = datePart.split(/[/-]/);
      if (dateBits.length !== 3) return null;

      const day = dateBits[0].padStart(2, '0');
      const month = dateBits[1].padStart(2, '0');
      const year = dateBits[2];

      const timeBits = timePart.split(':');
      if (timeBits.length < 2) return null;

      let hour = parseInt(timeBits[0]);
      const minutes = timeBits[1].padStart(2, '0');

      if (meridiem === 'PM' && hour !== 12) hour += 12;
      if (meridiem === 'AM' && hour === 12) hour = 0;

      const dateObj = new Date(year, parseInt(month) - 1, parseInt(day), hour, parseInt(minutes));

      if (isNaN(dateObj.getTime())) return null;

      const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      const daysShort = {
        'Domingo': 'DOM',
        'Lunes': 'LUN',
        'Martes': 'MAR',
        'Miércoles': 'MIE',
        'Jueves': 'JUE',
        'Viernes': 'VIE',
        'Sábado': 'SAB'
      };
      const dayName = daysShort[daysOfWeek[dateObj.getDay()]];

      const formattedTime = hour.toString().padStart(2, '0') + ':' + minutes;
      const sortKey = year + month + day; // Solo día para agrupar columnas
      const formattedDate = day + '/' + month; // Solo día/mes

      return {
        date: formattedDate,
        time: formattedTime,
        dayName: dayName,
        dateTime: dateObj,
        sortKey: sortKey
      };
    } catch (e) {
      console.error('Error parsing date:', dateStr, e);
      return null;
    }
  };

  const processFile = async (file) => {
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
        complete: async (results) => {
          try {
            const cleanedData = results.data.map(row => {
              const cleanRow = {};
              Object.keys(row).forEach(key => {
                cleanRow[key.trim()] = row[key];
              });
              return cleanRow;
            });

            setData(cleanedData);
            analyzeData(cleanedData, selectedTurno, aulas);
            saveDataToStorage(cleanedData, fullDateTime, selectedTurno, aulas);
            await saveToGist(cleanedData, fullDateTime, aulas);
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

      reader.onload = async (event) => {
        try {
          const workbook = XLSX.read(event.target.result, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(sheet);

          setData(jsonData);
          analyzeData(jsonData, selectedTurno, aulas);
          saveDataToStorage(jsonData, fullDateTime, selectedTurno, aulas);
          await saveToGist(jsonData, fullDateTime, aulas);
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

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    processFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const analyzeData = (jsonData, turno = 'todos', currentAulas = aulas) => {
    const aulasByDate = {};
    const allDates = new Set();
    const foundAulas = new Set();

    jsonData.forEach((row) => {
      const horaInicio = row['Hora de inicio'] || row['Hora_de_inicio'] || row['Hora_de _inicio'];
      const correo = (row['Correo Electrónico del anfitrión'] || row['Correo_Electrónico_del_anfitrión'] || '').trim();

      if (!horaInicio || !correo) return;

      const parsed = parseDateTime(horaInicio);
      if (!parsed) return;

      const { date, time, sortKey, dayName } = parsed;

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

    const sortedAulas = [...currentAulas];

    Array.from(foundAulas)
      .filter(aula => !currentAulas.includes(aula))
      .sort()
      .forEach(aula => sortedAulas.push(aula));

    const matrixData = sortedAulas.map(aula => {
      const row = { aula };
      let totalClases = 0;
      let diasLibres = 0;
      let diasOcupados = 0;

      sortedDates.forEach(dateInfo => {
        const count = aulasByDate[aula]?.[dateInfo.date] || 0;
        row[dateInfo.date] = count;
        totalClases += count;
        if (count === 0) diasLibres++;
        else diasOcupados++;
      });

      row.totalClases = totalClases;
      row.diasLibres = diasLibres;
      row.diasOcupados = diasOcupados;
      row.promedioDiario = sortedDates.length > 0 ? (totalClases / sortedDates.length).toFixed(1) : 0;

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
    const header = ['Aula', ...results.dates.map(d => d.dayName + ' ' + d.date), 'Total Clases', 'Días Libres', 'Días Ocupados', 'Promedio/Día'];
    wsData.push(header);

    const filteredData = getFilteredMatrix();
    filteredData.forEach(row => {
      const rowData = [row.aula];
      results.dates.forEach(dateInfo => {
        const count = row[dateInfo.date];
        rowData.push(count === 0 ? 'Libre' : count);
      });
      rowData.push(row.totalClases, row.diasLibres, row.diasOcupados, row.promedioDiario);
      wsData.push(rowData);
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Disponibilidad Aulas');
    XLSX.writeFile(wb, 'disponibilidad_aulas_' + new Date().toISOString().split('T')[0] + '.xlsx');
  };

  const handleRefresh = () => {
    setLoadingStorage(true);
    loadDataFromStorage();
  };

  const getCellStyle = (count) => {
    if (count === 0) return 'bg-green-100 text-green-800 font-semibold';
    if (count === 1) return 'bg-yellow-100 text-yellow-800';
    // Rojo suave pero con buen contraste para daltonismo (2+ clases)
    return 'bg-red-200 text-red-900 font-bold border border-red-300 shadow-sm';
  };

  const getCellText = (count) => {
    if (count === 0) return 'Libre';
    return count + ' clase' + (count > 1 ? 's' : '');
  };

  const formatAulaName = (email) => {
    if (!email) return '';
    return email;
  };

  const getFilteredMatrix = () => {
    if (!results) return [];

    let filtered = results.matrix;

    // Filtro de búsqueda inteligente
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const cleanSearch = search.replace(/\s+/g, '');
      const isIdSearch = /^\d{9,}$/.test(cleanSearch);

      return filtered.map(row => {
        const email = row.aula.toLowerCase();
        const formattedName = formatAulaName(row.aula).toLowerCase();

        // Si buscamos por nombre de aula, mostramos todos sus datos originales
        const matchesAula = email.includes(search) || formattedName.includes(search);
        if (matchesAula && !isIdSearch && cleanSearch.length < 9) {
          return row;
        }

        // Si es búsqueda por ID o texto específico, filtramos las celdas individualmente
        const filteredRow = { ...row };
        let hasAnyMeetingMatch = false;
        let totalFilteredClases = 0;

        results.dates.forEach(dateInfo => {
          // Filtramos las reuniones de esta aula/fecha que coinciden con la búsqueda
          const matchingMeetings = data.filter(d => {
            const meetingEmail = (d['Correo Electrónico del anfitrión'] || d['Correo_Electrónico_del_anfitrión'] || '').trim();
            if (meetingEmail.toLowerCase() !== email) return false;

            const parsed = parseDateTime(d['Hora de inicio'] || d['Hora_de_inicio'] || d['Hora_de _inicio']);
            if (!parsed || parsed.date !== dateInfo.date) return false;
            if (!isInTurno(parsed.time, selectedTurno)) return false;

            return Object.values(d).some(val => {
              if (!val) return false;
              if (isIdSearch) {
                const valStr = String(val).replace(/\D/g, '');
                return valStr === cleanSearch;
              }
              const valStr = String(val).toLowerCase();
              return valStr.includes(search);
            });
          });

          filteredRow[dateInfo.date] = matchingMeetings.length;
          totalFilteredClases += matchingMeetings.length;
          if (matchingMeetings.length > 0) hasAnyMeetingMatch = true;
        });

        filteredRow.totalClases = totalFilteredClases;

        // Solo mostrar la fila si hay al menos una coincidencia en alguna celda
        return hasAnyMeetingMatch ? filteredRow : null;
      }).filter(Boolean);
    }

    // Filtro de estado (Inteligente: Basado en el primer día disponible)
    if (results.dates.length > 0 && filterStatus !== 'todos') {
      const firstDate = results.dates[0].date;
      if (filterStatus === 'libres') {
        filtered = filtered.filter(row => row[firstDate] === 0);
      } else if (filterStatus === 'ocupadas') {
        filtered = filtered.filter(row => row[firstDate] > 1);
      } else if (filterStatus === 'disponibles') {
        filtered = filtered.filter(row => row[firstDate] === 1);
      }
    }

    return filtered;
  };

  const calculateStats = () => {
    if (!results) return null;

    const totalAulas = results.matrix.length;
    const aulasLibres = results.matrix.filter(row => row.totalClases === 0).length;
    const aulasOcupadas = results.matrix.filter(row => row.totalClases > 0).length;
    const totalClases = results.matrix.reduce((sum, row) => sum + row.totalClases, 0);
    const promedioClasesPorAula = (totalClases / totalAulas).toFixed(1);
    const aulasMasUsadas = [...results.matrix].sort((a, b) => b.totalClases - a.totalClases).slice(0, 5);

    return {
      totalAulas,
      aulasLibres,
      aulasOcupadas,
      totalClases,
      promedioClasesPorAula,
      aulasMasUsadas
    };
  };

  const stats = calculateStats();

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-3 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl md:rounded-2xl shadow-2xl p-4 md:p-8">
          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-2xl md:text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
              <i className="fa-solid fa-chart-simple text-indigo-600"></i> Disponibilidad de Aulas
            </h1>
            <p className="text-sm md:text-base text-gray-600 flex items-center justify-center gap-2">
              Vista completa de ocupación por aula y día - ISAM
              {!isAdmin && (
                <button
                  onClick={() => setShowLogin(true)}
                  className="text-gray-400 hover:text-indigo-600 transition-colors"
                  title="Acceso Administrador"
                >
                  <i className="fa-solid fa-user-gear"></i>
                </button>
              )}
            </p>
             {isAdmin && (
               <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
                 <div className="inline-block bg-yellow-100 border border-yellow-400 text-yellow-800 px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium">
                   🔑 Modo Administrador
                 </div>
                 <button
                   onClick={() => setShowAulasManager(!showAulasManager)}
                   className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700"
                 >
                   Gestionar Aulas
                 </button>
                 <button
                   onClick={handleLogout}
                   className="text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-200"
                 >
                   Salir
                 </button>
               </div>
             )}
            {uploadDateTime && (
              <div className="mt-3 md:mt-4 flex flex-col items-center justify-center gap-3">
                {/* Fila Única: Fecha y Botones de Acción */}
                <div className="flex items-center justify-center gap-2 md:gap-3 flex-wrap px-2">
                  <div className="inline-block bg-indigo-100 text-indigo-800 px-2 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium max-w-full overflow-hidden">
                    <Calendar className="w-3 h-3 md:w-4 md:h-4 inline mr-1 md:mr-2" />
                    <span className="hidden sm:inline">Actualizado: </span>
                    <span className="text-[10px] md:text-xs lg:text-sm">{uploadDateTime}</span>
                  </div>

                  {results && !loading && !showAulasManager && (
                    <>
                      <label
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-lg transition-all cursor-pointer text-xs md:text-sm font-medium border-2 border-dashed ${isDragging
                          ? 'bg-indigo-100 border-indigo-600 scale-105 shadow-lg text-indigo-700'
                          : 'bg-indigo-600 border-transparent text-white hover:bg-indigo-700'
                          }`}
                      >
                        <Upload className={`w-3.5 h-3.5 md:w-4 md:h-4 ${isDragging ? 'animate-bounce' : ''}`} />
                        <span>{isDragging ? '¡Suelta aquí!' : 'Cargar'}</span>
                        <input
                          type="file"
                          accept=".xlsx,.xls,.csv"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>

                      <button
                        onClick={exportToExcel}
                        className="flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs md:text-sm font-medium"
                      >
                        <Download className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        <span>Exportar</span>
                      </button>

                      <button
                        onClick={() => setShowStats(!showStats)}
                        className={`flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-lg transition-all text-xs md:text-sm font-medium ${showStats
                          ? 'bg-purple-600 text-white shadow-lg hover:bg-purple-700'
                          : 'bg-purple-50 text-purple-400 border border-purple-200 hover:bg-purple-100 hover:text-purple-600'
                          }`}
                        title="Mostrar/Ocultar estadísticas"
                      >
                        <TrendingUp className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        <span>Stats</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Login Modal */}
          {showLogin && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl">
                <h2 className="text-xl font-bold mb-4">Acceso Administrador</h2>
                <form onSubmit={handleLogin}>
                  <input
                    type="password"
                    placeholder="isam123"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2 border rounded mb-4"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 bg-indigo-600 text-white py-2 rounded font-medium hover:bg-indigo-700"
                    >
                      Entrar
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowLogin(false)}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 rounded font-medium hover:bg-gray-200"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Classroom Manager View */}
          {showAulasManager && isAdmin && (
            <div className="mb-8 p-6 bg-gray-50 border border-gray-200 rounded-xl">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                🏠 Gestión de Aulas
              </h2>
              <div className="flex flex-col gap-2 mb-6">
                <label className="text-sm text-gray-600 font-medium">
                  Introduce uno o varios correos (puedes pegarlos separados por comas o saltos de línea):
                </label>
                <div className="flex gap-2">
                  <textarea
                    placeholder="ejemplo1@gmail.com, ejemplo2@gmail.com..."
                    value={newAulaEmail}
                    onChange={(e) => setNewAulaEmail(e.target.value)}
                    className="flex-1 p-2 border rounded min-h-[100px] text-sm"
                  />
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={addAula}
                      className="bg-indigo-600 text-white px-6 py-2 rounded font-medium hover:bg-indigo-700 text-sm"
                    >
                      Agregar / Pegar
                    </button>
                    <button
                      onClick={removeAllAulas}
                      className="bg-red-50 text-red-600 border border-red-200 px-6 py-2 rounded font-medium hover:bg-red-100 text-sm"
                    >
                      Eliminar Todas
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto p-2">
                {aulas.map((aula, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between bg-white p-3 rounded-lg border shadow-sm ${dragIndex === idx ? 'opacity-80 border-indigo-300' : ''}`}
                    draggable
                    onDragStart={() => handleDragStartItem(idx)}
                    onDragOver={handleDragOverItem}
                    onDrop={() => handleDropItem(idx)}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-xs font-bold bg-indigo-50 text-indigo-600 w-6 h-6 flex items-center justify-center rounded-full flex-shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-sm font-medium truncate">{aula}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => moveAula(idx, -1)}
                        disabled={idx === 0}
                        className="text-gray-400 hover:text-indigo-600 p-1 rounded disabled:opacity-20"
                        title="Subir"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => moveAula(idx, 1)}
                        disabled={idx === aulas.length - 1}
                        className="text-gray-400 hover:text-indigo-600 p-1 rounded disabled:opacity-20"
                        title="Bajar"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeAula(aula)}
                        className="text-red-500 hover:bg-red-50 p-1 rounded ml-1"
                        title="Eliminar aula"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t pt-4">
                <p className="text-xs md:text-sm text-gray-500 mr-auto">
                  * Haz clic en "Guardar en Nube" para que los cambios sean permanentes.
                </p>
                <button
                  onClick={() => saveToGist(data, uploadDateTime, aulas)}
                  disabled={loading}
                  className={`px-6 py-2 rounded font-medium shadow-md flex items-center gap-2 transition-all ${loading
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-green-600 text-white hover:bg-green-700 active:scale-95'
                    }`}
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Share2 className="w-4 h-4" />
                  )}
                  {loading ? 'Guardando...' : 'Guardar en Nube'}
                </button>
                <button
                  onClick={() => setShowAulasManager(false)}
                  className="bg-gray-200 text-gray-800 px-6 py-2 rounded font-medium hover:bg-gray-300"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}

          {!results && !loading && !showAulasManager && (
            <div className="mb-8">
              {isAdmin ? (
                <label
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer transition-all ${isDragging
                    ? 'bg-indigo-100 border-indigo-600 scale-[1.02] shadow-xl'
                    : 'border-indigo-300 bg-indigo-50 hover:bg-indigo-100'
                    }`}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className={`w-12 h-12 mb-3 ${isDragging ? 'text-indigo-600 animate-bounce' : 'text-indigo-500'}`} />
                    <p className="mb-2 text-lg font-semibold text-gray-700">
                      {isDragging ? '¡Suelta el archivo ahora!' : 'Cargar archivo Excel o CSV'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {isDragging ? 'Formatos aceptados: .xlsx, .xls, .csv' : 'Sube o arrastra tu archivo aquí'}
                    </p>
                    {!isDragging && (
                      <p className="text-xs text-gray-400 mt-2">
                        Los datos se publicarán automáticamente para todos los usuarios
                      </p>
                    )}
                  </div>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-xl border border-gray-200">
                  <Calendar className="w-16 h-16 text-gray-400 mb-4" />
                  <p className="text-lg font-semibold text-gray-700 mb-2">
                    No hay datos disponibles
                  </p>
                  <p className="text-sm text-gray-500 text-center">
                    El administrador aún no ha publicado la información de disponibilidad de aulas.
                  </p>
                </div>
              )}
            </div>
          )}

          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <p className="mt-4 text-gray-600">Procesando archivo...</p>
            </div>
          )}

          {results && !loading && !showAulasManager && (
            <div>
              {/* Estadísticas */}
              {showStats && stats && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-4 mb-4 md:mb-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 md:p-3">
                    <div className="flex items-center justify-center gap-2">
                      <div className="text-xl md:text-2xl font-bold text-blue-900">{stats.totalAulas}</div>
                      <div className="text-blue-600 text-xs md:text-sm font-medium">Total Aulas</div>
                    </div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-2 md:p-3">
                    <div className="flex items-center justify-center gap-2">
                      <div className="text-xl md:text-2xl font-bold text-green-900">{stats.aulasLibres}</div>
                      <div className="text-green-600 text-xs md:text-sm font-medium">Aulas Libres</div>
                    </div>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-2 md:p-3">
                    <div className="flex items-center justify-center gap-2">
                      <div className="text-xl md:text-2xl font-bold text-red-900">{stats.aulasOcupadas}</div>
                      <div className="text-red-600 text-xs md:text-sm font-medium">Aulas Ocupadas</div>
                    </div>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-2 md:p-3">
                    <div className="flex items-center justify-center gap-2">
                      <div className="text-xl md:text-2xl font-bold text-purple-900">{stats.totalClases}</div>
                      <div className="text-purple-600 text-xs md:text-sm font-medium">Total Clases</div>
                    </div>
                  </div>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 md:p-3 col-span-2 md:col-span-1">
                    <div className="flex items-center justify-center gap-2">
                      <div className="text-xl md:text-2xl font-bold text-orange-900">{stats.promedioClasesPorAula}</div>
                      <div className="text-orange-600 text-xs md:text-sm font-medium">Promedio/Aula</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Controles y Filtros Simplificados */}
              <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-4 md:mb-6">
                {/* Búsqueda (Ocupa más espacio) */}
                <div className="relative w-full md:col-span-2 lg:col-span-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar aula o ID de reunión..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-sm md:text-base text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full h-full"
                  />
                </div>

                {/* Filtro de Estado */}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-2 md:px-4 py-2 border border-gray-300 rounded-lg bg-white text-xs md:text-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
                >
                  <option value="todos">Todas las Aulas</option>
                  <option value="libres">Libres ({results.dates[0]?.date || 'Hoy'})</option>
                  <option value="disponibles">Disponibles ({results.dates[0]?.date || 'Hoy'})</option>
                  <option value="ocupadas">Ocupadas ({results.dates[0]?.date || 'Hoy'})</option>
                </select>

                {/* Filtro de Turno */}
                <div className="flex flex-col gap-1.5 md:col-span-1 lg:col-span-1">
                  <select
                    value={selectedTurno}
                    onChange={handleTurnoChange}
                    className="px-2 md:px-4 py-2 border border-gray-300 rounded-lg bg-white text-xs md:text-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
                  >
                    <option value="todos">Todos los Turnos</option>
                    <option value="manana">Mañana (7am - 1pm)</option>
                    <option value="tarde">Tarde (1pm - 5pm)</option>
                    <option value="noche">Noche (5pm - 12am)</option>
                  </select>
                </div>
              </div>

              {/* Leyenda */}
              <div className="flex gap-3 md:gap-4 text-xs md:text-sm mb-3 md:mb-4 flex-wrap justify-center md:justify-start">
                <div className="flex items-center gap-1.5 md:gap-2">
                  <div className="w-3 h-3 md:w-4 md:h-4 bg-green-100 border border-green-300 rounded"></div>
                  <span>Libre</span>
                </div>
                <div className="flex items-center gap-1.5 md:gap-2">
                  <div className="w-3 h-3 md:w-4 md:h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
                  <span>1 clase</span>
                </div>
                <div className="flex items-center gap-1.5 md:gap-2">
                  <div className="w-3 h-3 md:w-4 md:h-4 bg-red-200 border border-red-300 rounded"></div>
                  <span>2+ clases</span>
                </div>
              </div>

              {/* Tabla con scroll interno para permitir encabezado fijo */}
              <div className="overflow-auto border border-gray-200 rounded-lg shadow-sm -mx-2 md:mx-0 max-h-[75vh]">
                <div className="inline-block min-w-full align-middle">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="sticky left-0 top-0 z-30 px-1 md:px-2 py-2 md:py-3 text-center text-[10px] md:text-xs font-bold text-gray-700 uppercase tracking-wider bg-gray-100 border-r-2 border-gray-300 w-[45px] md:w-[55px] min-w-[45px] md:min-w-[55px]">
                          N°
                        </th>
                        <th className="sticky left-[45px] md:left-[55px] top-0 z-30 px-2 md:px-4 py-2 md:py-3 text-left text-[10px] md:text-xs font-bold text-gray-700 uppercase tracking-wider bg-gray-100 border-r-2 border-gray-300 min-w-[150px] md:min-w-[200px]">
                          Aula
                        </th>
                        {results.dates.map((dateInfo, idx) => (
                          <th
                            key={idx}
                            className="sticky top-0 z-20 px-1 md:px-2 py-2 md:py-3 text-center text-[9px] md:text-xs font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap min-w-[60px] md:min-w-[80px] bg-gray-50"
                          >
                            <div className="text-indigo-600 font-bold">{dateInfo.dayName.substring(0, 3)}</div>
                            <div className="text-gray-600 text-[8px] md:text-xs">{dateInfo.date}</div>
                          </th>
                        ))}
                        <th className="sticky right-0 top-0 z-30 px-2 md:px-4 py-2 md:py-3 text-center text-[10px] md:text-xs font-bold text-gray-700 uppercase tracking-wider bg-gray-100 border-l-2 border-gray-300 min-w-[50px] md:min-w-[70px]">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getFilteredMatrix().map((row, rowIdx) => (
                        <tr key={rowIdx} className="hover:bg-gray-50">
                          <td className="sticky left-0 z-10 px-1 md:px-2 py-2 md:py-3 text-[10px] md:text-sm font-medium text-gray-900 bg-white border-r-2 border-gray-200 whitespace-nowrap text-center w-[45px] md:w-[55px]">
                            {rowIdx + 1}
                          </td>
                          <td className="sticky left-[45px] md:left-[55px] z-10 px-2 md:px-4 py-2 md:py-3 text-[10px] md:text-sm font-medium text-gray-900 bg-white border-r-2 border-gray-200 whitespace-nowrap">
                            {formatAulaName(row.aula)}
                          </td>
                          {results.dates.map((dateInfo, colIdx) => {
                            const count = row[dateInfo.date];
                            return (
                              <td
                                key={colIdx}
                                className={'px-1 md:px-2 py-2 md:py-3 text-[9px] md:text-sm text-center whitespace-nowrap ' + getCellStyle(count)}
                              >
                                <span className="md:hidden">{count === 0 ? '✓' : count}</span>
                                <span className="hidden md:inline">{getCellText(count)}</span>
                              </td>
                            );
                          })}
                          <td className="sticky right-0 z-10 px-2 md:px-4 py-2 md:py-3 text-[10px] md:text-sm text-center font-bold bg-gray-50 border-l-2 border-gray-200">
                            {row.totalClases}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Información adicional */}
              <div className={`mt-6 border rounded-lg p-4 ${results.dates.length <= 1 ? 'bg-yellow-50 border-yellow-300' : 'bg-blue-50 border-blue-200'}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-700">
                      <strong>Aulas mostradas:</strong> {getFilteredMatrix().length} de {results.aulas.length} |
                      <strong className="ml-3">Días analizados:</strong> {results.dates.length} |
                      <strong className="ml-3">Turno:</strong> {
                        selectedTurno === 'todos' ? 'Todos' :
                          selectedTurno === 'manana' ? 'Mañana' :
                            selectedTurno === 'tarde' ? 'Tarde' : 'Noche'
                      }
                    </p>
                    {results.dates.length <= 1 && (
                      <p className="text-xs text-yellow-700 mt-2">
                        ⚠️ Solo se detectó 1 día. Verifica que tu archivo tenga datos de múltiples fechas.
                      </p>
                    )}
                  </div>
                  {gistId && (
                    <div className="text-right">
                      <p className="text-xs text-gray-600">
                        Datos sincronizados • Compartible con otros usuarios
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Aulas más usadas */}
              {showStats && stats && stats.aulasMasUsadas.length > 0 && (
                <div className="mt-4 md:mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-3 md:p-4">
                  <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-2 md:mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 md:w-5 md:h-5" />
                    Top 5 Aulas Más Usadas
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-3">
                    {stats.aulasMasUsadas.map((aula, idx) => (
                      <div key={idx} className="bg-white rounded-lg p-2 md:p-3 border border-yellow-300">
                        <div className="flex items-center justify-center gap-2">
                          <div className="text-lg md:text-xl font-bold text-yellow-600">#{idx + 1}</div>
                          <div className="text-xs md:text-sm font-medium text-gray-700 truncate">{formatAulaName(aula.aula)}</div>
                          <div className="text-base md:text-lg font-bold text-gray-900">{aula.totalClases}</div>
                          <div className="text-[10px] md:text-xs text-gray-500">{aula.promedioDiario}/día</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                  <span><strong>Carga tu archivo:</strong> Excel (.xlsx, .xls) o CSV con los datos de reuniones</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span><strong>Visualiza:</strong> Matriz completa con todos los días y disponibilidad por colores</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span><strong>Filtra:</strong> Por turno, estado (libres/ocupadas) o busca aulas específicas</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span><strong>Comparte:</strong> Los datos se sincronizan y puedes compartir el link con otros</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span><strong>Exporta:</strong> Descarga la matriz en Excel con estadísticas completas</span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
