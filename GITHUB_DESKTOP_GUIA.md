# 🐙 Guía para Subir a GitHub usando GitHub Desktop

## 📥 Paso 1: Descargar e Instalar GitHub Desktop

1. **Descargar GitHub Desktop**
   - Ve a: https://desktop.github.com/
   - Click en **"Download for Windows"**
   - Espera a que descargue (aprox. 100 MB)

2. **Instalar**
   - Ejecuta el archivo descargado `GitHubDesktopSetup.exe`
   - La instalación es automática (toma 1-2 minutos)
   - Se abrirá automáticamente al terminar

## 🔐 Paso 2: Configurar GitHub Desktop

### Primera vez usando GitHub:

1. **Crear cuenta de GitHub** (si no tienes)
   - Ve a: https://github.com/signup
   - Ingresa tu email
   - Crea una contraseña
   - Elige un username (nombre de usuario)
   - Verifica tu email
   - ¡Listo! 🎉

2. **Iniciar sesión en GitHub Desktop**
   - Abre GitHub Desktop
   - Click en **"Sign in to GitHub.com"**
   - Se abrirá tu navegador
   - Ingresa tu usuario y contraseña
   - Click en **"Authorize desktop"**
   - Vuelve a GitHub Desktop

3. **Configurar Git**
   - GitHub Desktop te pedirá tu nombre y email
   - Usa tu nombre real y el email de tu cuenta GitHub
   - Click en **"Finish"**

## 📂 Paso 3: Agregar tu Proyecto a GitHub Desktop

1. **En GitHub Desktop:**
   - Click en **"File"** → **"Add local repository..."**
   - O presiona: `Ctrl + O`

2. **Seleccionar la carpeta:**
   - Click en **"Choose..."**
   - Navega a: `C:\xampp\htdocs\misitemanuevo`
   - Click en **"Seleccionar carpeta"**

3. **Si dice "This directory does not appear to be a Git repository":**
   - Click en **"create a repository"**
   - DESMARCA ☐ "Initialize this repository with a README"
   - Click en **"Create Repository"**

4. **Verás todos tus archivos en la lista de cambios** ✅

## ☁️ Paso 4: Publicar en GitHub

1. **En GitHub Desktop, verás un botón azul:**
   - **"Publish repository"**
   - Click en él

2. **Configurar el repositorio:**
   ```
   Name: misitemanuevo
   Description: Analizador de disponibilidad de aulas
   ☐ Keep this code private (desmarcado para público)
   Organization: None (deja tu usuario personal)
   ```
   - Click en **"Publish repository"**

3. **¡Espera 10-30 segundos!** ⏳
   - GitHub Desktop subirá todos los archivos
   - Verás "Last fetched just now" cuando termine

## 🌐 Paso 5: Desplegar a GitHub Pages

### Opción A: Despliegue Automático (Recomendado)

1. **Ir a tu repositorio en GitHub:**
   - En GitHub Desktop, click en **"Repository"** → **"View on GitHub"**
   - O ve a: `https://github.com/TU_USUARIO/misitemanuevo`

2. **Configurar GitHub Pages:**
   - Click en **"Settings"** (⚙️ arriba a la derecha)
   - En el menú lateral izquierdo, click en **"Pages"**
   - En **"Build and deployment"**:
     - Source: **GitHub Actions**
   - ¡Listo! El deploy es automático en cada push

3. **Esperar el despliegue:**
   - Ve a la pestaña **"Actions"** (arriba)
   - Verás un workflow "Deploy to GitHub Pages" ejecutándose
   - Espera a que aparezca ✅ (1-3 minutos)

4. **Obtener la URL:**
   - Vuelve a **Settings** → **Pages**
   - Verás: "Your site is live at https://TU_USUARIO.github.io/misitemanuevo/"
   - Click en **"Visit site"** 🎉

### Opción B: Despliegue Manual

Si prefieres desplegar manualmente:

1. **En PowerShell** (en la carpeta del proyecto):
   ```powershell
   npm run deploy
   ```

2. **Configurar en GitHub:**
   - Settings → Pages
   - Source: **Deploy from a branch**
   - Branch: **gh-pages** → **/ (root)**
   - Save

## 🔄 Paso 6: Hacer Cambios en el Futuro

### Cuando modifiques el código:

1. **Guarda tus archivos** en VS Code

2. **GitHub Desktop detectará los cambios automáticamente**
   - Verás la lista de archivos modificados

3. **Escribir un mensaje de commit:**
   - Abajo a la izquierda donde dice "Summary"
   - Ejemplo: "Agregué nueva funcionalidad"
   - (Opcional) Descripción más detallada

4. **Click en el botón azul:**
   - **"Commit to main"**

5. **Subir los cambios:**
   - Click en **"Push origin"** (arriba)
   - ¡Listo! Los cambios están en GitHub

6. **Si usas GitHub Actions:**
   - El deploy es automático, solo espera 2-3 minutos
   
7. **Si usas deploy manual:**
   ```powershell
   npm run deploy
   ```

## 🎨 Interfaz de GitHub Desktop Explicada

```
┌─────────────────────────────────────────────┐
│  Repository: misitemanuevo     🔄 Fetch     │
├─────────────────────────────────────────────┤
│ Current branch: main           ↑ Push       │
├─────────────────────────────────────────────┤
│                                              │
│ Changes (12)                                 │
│ ├─ ✓ src/components/AulasAnalyzer.jsx      │
│ ├─ ✓ package.json                           │
│ └─ ✓ README.md                              │
│                                              │
│ ┌──────────────────────────────────────┐   │
│ │ Summary (required)                   │   │
│ │ Actualización del componente         │   │
│ ├──────────────────────────────────────┤   │
│ │ Description                           │   │
│ │ Se corrigió el bug del filtro        │   │
│ └──────────────────────────────────────┘   │
│                                              │
│        [Commit to main]                      │
└─────────────────────────────────────────────┘
```

## ❓ Solución de Problemas Comunes

### "Authentication failed"
1. En GitHub Desktop: File → Options → Accounts
2. Click en "Sign out"
3. Vuelve a hacer "Sign in"

### "Push rejected"
1. Click en "Repository" → "Pull"
2. Luego vuelve a hacer Push

### "Conflictos de merge"
1. GitHub Desktop te mostrará los archivos en conflicto
2. Ábrelos en VS Code
3. Resuelve los conflictos (Git te marcará las secciones)
4. Guarda los archivos
5. En GitHub Desktop: "Commit merge"

### No aparece mi sitio en GitHub Pages
1. Espera 3-5 minutos después del primer deploy
2. Verifica en Settings → Pages que esté configurado
3. Revisa la pestaña "Actions" para ver si hay errores
4. Limpia la caché del navegador (Ctrl+Shift+R)

## 🎯 Checklist Completo

- [ ] Descargar GitHub Desktop
- [ ] Instalar GitHub Desktop
- [ ] Crear cuenta en GitHub (si no tienes)
- [ ] Iniciar sesión en GitHub Desktop
- [ ] Agregar repositorio local (C:\xampp\htdocs\misitemanuevo)
- [ ] Hacer commit inicial
- [ ] Publicar repositorio (botón azul)
- [ ] Ir a Settings → Pages en GitHub
- [ ] Configurar GitHub Actions o gh-pages
- [ ] Esperar despliegue
- [ ] Visitar tu sitio: https://TU_USUARIO.github.io/misitemanuevo/
- [ ] Probar cargar el archivo ejemplo_datos.csv

## 📱 Enlaces Útiles

- **GitHub Desktop**: https://desktop.github.com/
- **Crear cuenta GitHub**: https://github.com/signup
- **Documentación**: https://docs.github.com/en/desktop
- **Tu repositorio**: https://github.com/TU_USUARIO/misitemanuevo (después de publicar)
- **Tu aplicación**: https://TU_USUARIO.github.io/misitemanuevo/ (después de deploy)

## 💡 Consejos

1. **Commits frecuentes**: Haz commit cada vez que completes una funcionalidad
2. **Mensajes claros**: Escribe mensajes descriptivos ("Agregué filtro de búsqueda")
3. **Push regularmente**: Sube tus cambios al menos una vez al día
4. **Fetch origin**: Antes de trabajar, haz "Fetch" para traer cambios (si trabajas en equipo)

## 🎉 ¡Eso es todo!

GitHub Desktop hace todo mucho más fácil. No necesitas memorizar comandos, todo es visual y con botones. 

**Tiempo estimado total**: 10-15 minutos desde cero hasta tener tu app en línea.

---

**Nota**: Reemplaza `TU_USUARIO` con tu nombre de usuario real de GitHub en todos los URLs.
