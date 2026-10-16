# Organizador de cajas · MVP 0.1

Organizador básico de cajas para la coordinadora de la tienda de Herminio. Web estática, instalable y gratuita. No utiliza una API generativa, cuentas ni servidor de pago. El OCR y el análisis de píxeles se ejecutan localmente.

## Qué incluye

- Dos fotos: parte delantera y trasera del MOT.
- OCR local de nombres y marcas AM; propuesta de tramos a partir de casillas grises.
- Revisión individual junto a la fila de origen; edición por medias horas o por rangos.
- Añadir personas omitidas y eliminar falsos positivos.
- Orden por horas asignadas a caja y selección del primer cajero.
- Cajas configurables, caja fija opcional y continuidad de asignación cuando es posible.
- Horario 09:00–21:30, HD/HM y bloques solo cuando hay cambios.
- Comprobación opcional de necesidad MOT, sin completar déficits con personas inventadas.
- Hoja imprimible (guardar como PDF desde el navegador), copiar texto y guardar/abrir proyectos.
- Ejemplo con personas ficticias e informe de prueba sin nombres ni fotos.
- Recuperación de la sesión local e instalación en la pantalla de inicio.

## Estado real del lector

**Es experimental; todavía necesita revisión manual.** En las fotografías privadas del 13/10, el OCR reconoce buena parte de los nombres, pero comete errores ortográficos y puede omitir personas. La perspectiva, el pliegue del papel y las sombras desplazan casillas y alteran horas. La detección de AM también puede fallar.

El texto completo y los colores NO equivalen a una interpretación semántica de todos los formatos posibles de MOT. El gris se propone como caja; hay que contrastarlo con la leyenda. Una casilla blanca no basta para reconocer un descanso. No hay evidencia para prometer una transcripción automática fiable todavía. Los nombres y las horas detectados quedan pendientes de revisión. La hoja se marca PROVISIONAL mientras existan personas sin contrastar o incidencias.

El lector detecta filas con etiqueta de empleado A/B y posibles tramos grises; no conoce por sí solo la elegibilidad de todas las secciones. Eliminar cualquier falso positivo y añadir las omisiones es parte de esta prueba. No se añaden apoyos ni reservas a la hoja.

Las cajas adicionales a 10, 19 y 14 son configurables y deben verificarse para la tienda. Las asignaciones escritas a mano en ejemplos anteriores no se consideran reglas permanentes. Esta versión no aprende automáticamente de correcciones entre distintos usuarios.

## Cómo probar en el ordenador

1. Descomprime esta carpeta.
2. En Mac con Python 3 instalado: abre `abrir-mac.command` (puede ser necesario permitir su apertura desde el Finder). En Windows con Python instalado: ejecuta `abrir-windows.bat`.
3. Abre `http://localhost:8080` si el navegador no se abre automáticamente.
4. Prueba primero el ejemplo ficticio; después carga las dos fotos.

No abrir `site/index.html` con doble clic: el lector necesita un origen HTTP/HTTPS para sus módulos y trabajadores. El servidor local solo escucha en el propio equipo. No requiere instalar paquetes de JavaScript.

## Publicar gratis en GitHub Pages

Repositorio: `herminiocastro/organizador-cajas`. La publicación se realiza mediante el workflow de GitHub Pages.

- Subir el contenido completo de esta carpeta, incluida `.github/workflows/pages.yml`.
- En GitHub: Settings → Pages → Source → GitHub Actions.
- El workflow instala las versiones fijadas en package-lock.json, ejecuta las pruebas, prepara los recursos OCR verificados y publica exclusivamente `site/`. El idioma se descarga solo al construir, nunca se envían fotos para leerlas.
- Tras publicarse, se podrá compartir la URL y añadirla a la pantalla de inicio de iPhone o Android.
- No subir fotos reales, proyectos JSON con nombres, archivos de pruebas privadas ni horarios personales al repositorio público.

La aplicación incluye todos los archivos del lector y el idioma inglés distribuido con Tesseract. No hace falta descargar un modelo desde un tercero al analizar. El alfabeto español se reconoce con limitaciones (revisar acentos y nombres). Los recursos se guardan en la caché del navegador para poder reutilizarlos. Las mejoras futuras deben cambiar la versión de `site/sw.js` para renovar la caché.

## Privacidad

No hay analítica ni peticiones a una API de lectura. Fotos solo en memoria de la sesión. Los nombres y horarios del proyecto se guardan en `localStorage` en el navegador del usuario, y en los JSON que el usuario descarga. El informe de prueba contiene cifras y tipos de incidencia, sin nombres ni fotos. «Borrar sesión» elimina el proyecto del navegador, no los archivos ya descargados.

## Verificación

- `npm test` ejecuta las pruebas del motor puro (sin instalar dependencias).
- Se ha comprobado sintaxis de JavaScript y las referencias de archivos locales.
- El lector se ha ejecutado con Tesseract.js 7 y el motor de píxeles en Node sobre dos fotografías reales. Estas fotos no están en el paquete.
- El editor visual y la instalación en Safari/iPhone y Chrome/Android requieren prueba interactiva en los dispositivos de destino. No se han verificado todavía en un navegador real en esta sesión.

## Dependencias y licencias

Tesseract.js 7.0.0, tesseract.js-core 7.0.0 y datos `eng.traineddata` de la instalación de Tesseract. Avisos de licencia en `site/vendor/*LICENSE*` y `eng-traineddata-COPYRIGHT.txt`. El programa OCR usa aprendizaje automático internamente, pero no utiliza un servicio de IA generativa ni cobra por lectura.

## Primera prueba recomendada

Usar un día ya resuelto, revisar los nombres, comprobar cada media hora y cada descanso, comparar la hoja con la de la coordinadora y anotar las diferencias. No usar la salida automática sin revisión para dirigir el trabajo.

## Cambio de cajas principales · 16/10/2026

Las cajas principales son 10 (primera) y 19 (segunda); 14 mantiene la tercera prioridad y 18 pasa al grupo de cajas adicionales. La configuración es editable por proyecto/día. Las sesiones del 16/10/2026 o posteriores que conservan exactamente la configuración predeterminada antigua se actualizan una vez; los días anteriores y las configuraciones personalizadas se conservan.
