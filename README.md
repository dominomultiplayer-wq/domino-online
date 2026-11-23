# Dominó Online

Proyecto inicial de dominó doble-seis multijugador para navegador. Interfaz en HTML/CSS/JavaScript y sincronización con Firebase Realtime Database.

## Qué incluye
- Crear salas privadas con código de seis caracteres.
- Unirse a salas con hasta cuatro jugadores.
- Inicio de partida, reparto de fichas y turnos sincronizados.
- Colocar fichas, robar del pozo y pasar cuando el pozo esté vacío.
- Acceso anónimo con Firebase Authentication.

## 1. Crear Firebase
1. Abre https://console.firebase.google.com/ y crea un proyecto.
2. Añade una aplicación web y copia la configuración.
3. En Authentication > Sign-in method, activa **Anonymous**.
4. En Realtime Database, crea una base de datos.
5. Copia la configuración web en `js/firebase.js`, reemplazando todos los valores `TU-...` y `PEGA_AQUI...`.
6. En Realtime Database > Rules, publica el contenido de `database.rules.json`.

## 2. Probar localmente
Los módulos JavaScript no funcionan correctamente abriendo `index.html` como archivo local (`file://`). Usa un servidor local, por ejemplo:
- VS Code + extensión Live Server, o
- Firebase Hosting.

## 3. Publicar con Firebase Hosting
Instala Node.js y Firebase CLI en una computadora:
```bash
npm install -g firebase-tools
firebase login
firebase init
# Selecciona Hosting y Realtime Database; usa el proyecto existente.
firebase deploy
```
Cuando `firebase init` pregunte por el directorio público, usa `.`. Si ya tienes `firebase.json`, conserva la configuración de este repositorio.

## 4. Subir a GitHub
Descomprime el ZIP y sube las carpetas y archivos al repositorio. También puedes usar Git desde una computadora:
```bash
git init
git add .
git commit -m "Primera versión de Dominó Online"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/TU-REPOSITORIO.git
git push -u origin main
```

## Aviso importante de seguridad
Esta es una **base de prototipo para pruebas**, no una versión lista para producción con dinero, premios o torneos competitivos. Las reglas incluidas permiten a cualquier usuario autenticado leer y escribir datos de las salas; un jugador técnicamente avanzado podría alterar el estado o inspeccionar datos. Antes de abrirlo al público, hay que mover las operaciones críticas del juego a Cloud Functions/servidor confiable, separar las manos privadas por jugador, validar cada jugada en servidor, limitar abuso y endurecer las reglas de Realtime Database.

No publiques contraseñas, claves de servicio ni credenciales privadas. La configuración web de Firebase identifica el proyecto, pero no sustituye las reglas de seguridad.
