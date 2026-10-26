DULCE MORA · PANEL EN GITHUB PAGES

ARCHIVOS
- index.html
- styles.css
- app.js
- manifest.webmanifest
- sw.js
- Code.gs  -> este va en Google Apps Script, NO en GitHub.

PASO 1 · APPS SCRIPT
1. Abrí tu proyecto de Apps Script.
2. En Código.gs, borrá el contenido anterior y pegá Code.gs de esta carpeta.
3. Guardá.
4. Implementar > Nueva implementación > Aplicación web.
5. Ejecutar como: vos.
6. Acceso: cualquier usuario / opción pública disponible.
7. Copiá la URL que termina en /exec.

PASO 2 · CONECTAR LA APP
1. Abrí app.js.
2. En la primera línea vas a ver:
   const API_URL = '';
3. Pegá entre las comillas tu URL /exec.
   Ejemplo:
   const API_URL = 'https://script.google.com/macros/s/XXXXXXXX/exec';

PASO 3 · GITHUB
1. Creá un repositorio, por ejemplo: dulce-mora-panel.
2. Subí:
   index.html
   styles.css
   app.js
   manifest.webmanifest
   sw.js
3. Settings > Pages.
4. Source: Deploy from a branch.
5. Branch: main / root.
6. Guardá.
7. GitHub te dará una URL pública.

IMPORTANTE
- No subas Code.gs a GitHub si preferís mantener el backend separado.
- El panel usa productos reales del Sheet cuando API_URL está configurado.
- Si todavía no configuraste API_URL, muestra productos de ejemplo para que la interfaz siga funcionando.
- El cálculo de salsas está preparado para 1 salsa gratis por pote de helado; las adicionales cuestan $1.500.
