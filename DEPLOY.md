# 🚀 Guía Rápida de Despliegue en GitHub Pages

## ✅ Estado Actual
- ✅ Proyecto configurado
- ✅ Dependencias instaladas
- ✅ Build exitoso
- ⏳ Pendiente: Subir a GitHub

## 📝 Pasos para Desplegar

### 1. Crear Repositorio en GitHub

1. Ve a https://github.com/new
2. Nombre del repositorio: `misitemanuevo` (o el que prefieras)
3. Descripción: "Analizador de disponibilidad de aulas"
4. Selecciona **Público**
5. **NO** marques "Add a README file"
6. Click en **Create repository**

### 2. Subir el Código

Abre PowerShell en la carpeta del proyecto y ejecuta:

```powershell
# Inicializar git (si no está inicializado)
git init

# Agregar todos los archivos
git add .

# Hacer el primer commit
git commit -m "Initial commit - Aulas Analyzer"

# Agregar el remote (REEMPLAZA 'TU_USUARIO' con tu usuario de GitHub)
git remote add origin https://github.com/TU_USUARIO/misitemanuevo.git

# Renombrar la rama a main (si es necesario)
git branch -M main

# Subir al repositorio
git push -u origin main
```

### 3. Desplegar a GitHub Pages

Hay dos opciones:

#### Opción A: Despliegue Manual (Rápido)

```powershell
npm run deploy
```

Esto creará automáticamente la rama `gh-pages` y subirá el build.

#### Opción B: Despliegue Automático con GitHub Actions (Recomendado)

El proyecto ya incluye el workflow de GitHub Actions. Solo necesitas:

1. Ir a tu repositorio en GitHub
2. Click en **Settings** → **Pages**
3. En **Source** selecciona: **GitHub Actions**
4. Cada push a `main` desplegará automáticamente

### 4. Configurar GitHub Pages

1. Ve a tu repositorio: `https://github.com/TU_USUARIO/misitemanuevo`
2. Click en **Settings** (Configuración)
3. En el menú lateral, click en **Pages**
4. En **Source**:
   - Si usaste `npm run deploy`: Selecciona **Deploy from a branch** → `gh-pages` → `/ (root)`
   - Si usas GitHub Actions: Selecciona **GitHub Actions**
5. Click en **Save**

### 5. Acceder a tu Aplicación

Tu aplicación estará disponible en:
```
https://TU_USUARIO.github.io/misitemanuevo/
```

⏱️ **Nota**: Puede tardar 1-2 minutos en estar disponible la primera vez.

## 🔄 Actualizar la Aplicación

Cada vez que hagas cambios:

```powershell
# Hacer cambios en el código...

# Guardar cambios
git add .
git commit -m "Descripción de los cambios"
git push

# Si usas despliegue manual:
npm run deploy

# Si usas GitHub Actions, se desplegará automáticamente
```

## ⚙️ Configuración Importante

### Si cambias el nombre del repositorio:

1. Actualiza `vite.config.js`:
```javascript
export default defineConfig({
  plugins: [react()],
  base: '/NUEVO_NOMBRE_REPOSITORIO/'  // ← Cambiar aquí
})
```

2. Recompila y despliega:
```powershell
npm run build
npm run deploy
```

## 🐛 Solución de Problemas

### "Permission denied" al hacer push
```powershell
# Configura tu nombre y email de Git
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"

# Si pide autenticación, usa un Personal Access Token
# Créalo en: GitHub → Settings → Developer settings → Personal access tokens
```

### La página no carga (404)
1. Verifica que el `base` en `vite.config.js` coincida con el nombre del repositorio
2. Espera 2-3 minutos después del primer deploy
3. Limpia la caché del navegador (Ctrl+Shift+R)

### Cambios no se reflejan
```powershell
npm run build
npm run deploy
```
Luego limpia la caché del navegador.

### Error "gh-pages not found"
```powershell
npm install
npm run deploy
```

## 📊 Verificar el Build Local

Antes de desplegar, puedes probar localmente:

```powershell
# Compilar
npm run build

# Previsualizar
npm run preview
```

Abre http://localhost:4173 en tu navegador.

## 📞 Ayuda Adicional

- **Documentación de GitHub Pages**: https://pages.github.com/
- **Documentación de Vite**: https://vitejs.dev/guide/
- **Issues del proyecto**: Abre un issue en el repositorio

---

**¡Listo!** 🎉 Tu aplicación estará disponible públicamente en GitHub Pages.

## 🎯 Checklist Final

- [ ] Repositorio creado en GitHub
- [ ] Código subido con `git push`
- [ ] Desplegado con `npm run deploy` o GitHub Actions
- [ ] GitHub Pages configurado en Settings
- [ ] Aplicación accesible en `https://TU_USUARIO.github.io/misitemanuevo/`
- [ ] Datos de prueba cargados y funcionando

**Nota**: Reemplaza `TU_USUARIO` con tu nombre de usuario de GitHub en todos los comandos y URLs.
