# Aulas Analyzer - Analizador de Disponibilidad de Aulas

Aplicación web React para analizar la disponibilidad de aulas a partir de archivos Excel/CSV con datos de programación de reuniones.

## 🚀 Características

- ✅ Carga de archivos Excel (.xlsx, .xls) y CSV
- ✅ Análisis de 81 aulas predefinidas
- ✅ Filtrado por turnos (Mañana, Tarde, Noche)
- ✅ Matriz visual con código de colores
- ✅ Exportación a Excel
- ✅ Persistencia de datos en LocalStorage
- ✅ Diseño responsive con Tailwind CSS

## 📋 Requisitos Previos

- Node.js 16+ instalado
- Git instalado
- Cuenta de GitHub

## 🛠️ Instalación Local

1. **Clonar el repositorio**
```bash
git clone https://github.com/TU_USUARIO/misitemanuevo.git
cd misitemanuevo
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Ejecutar en desarrollo**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

## 📦 Despliegue en GitHub Pages

### Paso 1: Preparar el repositorio

1. **Crear repositorio en GitHub** (si no existe)
   - Ve a https://github.com/new
   - Nombre: `misitemanuevo` (o el nombre que prefieras)
   - Público o Privado según prefieras
   - NO inicialices con README

2. **Subir el código**
```bash
# Inicializar git (si no está inicializado)
git init

# Agregar todos los archivos
git add .

# Hacer commit
git commit -m "Initial commit - Aulas Analyzer"

# Agregar el remote (reemplaza TU_USUARIO con tu usuario de GitHub)
git remote add origin https://github.com/TU_USUARIO/misitemanuevo.git

# Subir al repositorio
git push -u origin main
```

### Paso 2: Configurar GitHub Pages

1. **Instalar gh-pages** (si no está instalado)
```bash
npm install
```

2. **Compilar y desplegar**
```bash
npm run build
npm run deploy
```

3. **Configurar GitHub Pages en el repositorio**
   - Ve a tu repositorio en GitHub
   - Settings → Pages
   - En "Source" selecciona la rama `gh-pages`
   - Guarda los cambios

4. **Acceder a tu aplicación**
   - La URL será: `https://TU_USUARIO.github.io/misitemanuevo/`
   - Puede tardar 1-2 minutos en estar disponible

### Paso 3: Actualizaciones futuras

Cada vez que hagas cambios:

```bash
# Hacer cambios en el código
# ...

# Guardar cambios
git add .
git commit -m "Descripción de los cambios"
git push

# Redesplegar
npm run deploy
```

## 📊 Formato del Archivo de Entrada

El archivo Excel/CSV debe contener las siguientes columnas:

- **Hora de inicio** (o variantes: `Hora_de_inicio`, `Hora_de _inicio`)
  - Formato: `DD/MM/YYYY HH:MM AM/PM` o `DD/MM/YYYY HH:MM AM/PM (Recurrente)`
  - Ejemplo: `04/12/2025 08:00 AM`

- **Correo Electrónico del anfitrión** (o `Correo_Electrónico_del_anfitrión`)
  - Debe ser el email del aula (ej: `isamaula01@gmail.com`)

## 🎨 Código de Colores

- 🟢 **Verde**: Aula libre (0 clases)
- 🟡 **Amarillo**: Aula disponible (1 clase)
- 🔴 **Rojo**: Aula ocupada (2+ clases)

## ⏰ Turnos

- **Mañana**: 7:00 - 13:00
- **Tarde**: 13:01 - 16:50
- **Noche**: 17:00 - 24:00

## 🏗️ Tecnologías

- **React 18** - Framework de UI
- **Vite** - Build tool
- **Tailwind CSS** - Estilos
- **xlsx** - Lectura de archivos Excel
- **papaparse** - Lectura de archivos CSV
- **lucide-react** - Iconos

## 📁 Estructura del Proyecto

```
misitemanuevo/
├── src/
│   ├── components/
│   │   └── AulasAnalyzer.jsx    # Componente principal
│   ├── App.jsx                   # App wrapper
│   ├── main.jsx                  # Entry point
│   └── index.css                 # Estilos globales
├── public/                       # Archivos estáticos
├── .github/
│   └── copilot-instructions.md   # Instrucciones del proyecto
├── index.html                    # HTML template
├── package.json                  # Dependencias
├── vite.config.js               # Configuración de Vite
├── tailwind.config.js           # Configuración de Tailwind
└── README.md                    # Este archivo
```

## 🐛 Solución de Problemas

### Error: "Module not found"
```bash
rm -rf node_modules package-lock.json
npm install
```

### No se ve la página en GitHub Pages
- Verifica que la rama `gh-pages` exista
- Revisa la configuración en Settings → Pages
- Espera 2-3 minutos después del deploy

### Cambios no se reflejan
```bash
npm run build
npm run deploy
```
Limpia la caché del navegador (Ctrl+Shift+R)

## 📝 Notas Importantes

1. **Base Path**: El `vite.config.js` está configurado con `base: '/misitemanuevo/'`. Si cambias el nombre del repositorio, actualiza esta línea.

2. **LocalStorage**: Los datos se guardan localmente en el navegador de cada usuario. No hay backend ni base de datos compartida.

3. **Aulas Predefinidas**: Las 81 aulas están hardcodeadas en el componente. Para modificarlas, edita el array `PREDEFINED_AULAS` en `src/components/AulasAnalyzer.jsx`.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 👨‍💻 Autor

Desarrollado para el análisis de disponibilidad de aulas ISAM.

---

**¿Necesitas ayuda?** Abre un issue en GitHub o contacta al administrador del repositorio.
