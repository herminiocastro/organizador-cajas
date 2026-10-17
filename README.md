# Organizador de cajas · MVP 0.3

Organizador básico de cajas para la coordinadora de la tienda de Herminio. Web estática, instalable y gratuita. No utiliza una API generativa, cuentas ni servidor de pago. El OCR y el análisis de píxeles se ejecutan localmente.

## Qué incluye

- Dos fotos: parte delantera y trasera del MOT.
- OCR local de nombres y marcas AM; propuesta de tramos a partir de casillas grises.
- Resumen legible del turno, con horas de caja y descansos. Corrección opcional por rangos, sin casillas para pintar.
- Añadir personas omitidas y eliminar falsos positivos.
- Orden por horas asignadas a caja y selección del primer cajero.
- Cajas configurables, caja fija opcional y continuidad de asignación cuando es posible.
- Selección de mañana (09:00–14:30), tarde (14:00–21:30) o día completo; horas ajustables de media en media.
- Prioridad por horas reales de caja dentro del turno seleccionado.
- Cambios puntuales de primer cajero, caja o intercambio, acotados por horas y sin añadir personal fuera de caja.
- Comprobación opcional de necesidad MOT, sin completar déficits con personas inventadas.
- Descarga directa de PDF, impresión, copiar texto y guardar/abrir proyectos.
- Ejemplo con personas ficticias e informe de prueba sin nombres ni fotos.
- Recuperación de la sesión local e instalación en la pantalla de inicio.

## Estado real del lector

**Es experimental; todavía necesita revisión manual.** En las fotografías privadas del 13/10, el OCR reconoce buena parte de los nombres, pero comete errores ortográficos y puede omitir personas. La perspectiva, el pliegue del papel y las sombras desplazan casillas y alteran horas. La detección de AM también puede fallar.

El texto completo y los colores NO equivalen a una interpretación semántica de todos los formatos posibles de MOT. El gris se propone como caja; hay que contrastarlo con la leyenda. Una casilla blanca no basta para reconocer un descanso. No hay evidencia para prometer una transcripción automática fiable todavía. Los nombres y las horas detectados quedan pendientes de revisión. La hoja se marca PROVISIONAL mientras existan personas sin contrastar o incidencias.

El lector mide las escalas horarias y las filas a partir de la imagen. Reconoce los nombres sobre filas enderezadas; una A/B mal leída ya no excluye a la persona. No conoce por sí solo la formación de cada trabajador para cubrir una sección. Eliminar cualquier falso positivo y añadir las omisiones es parte de esta prueba. No se añaden apoyos ni reservas a la hoja.

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

La aplicación incluye todos los archivos del lector y los idiomas inglés y español distribuidos con Tesseract. No hace falta descargar un modelo desde un tercero al analizar. El lector de producción usa español; siguen siendo necesarias comprobaciones de acentos y nombres. Los recursos se guardan en la caché del navegador para poder reutilizarlos. Las mejoras futuras deben cambiar la versión de `site/sw.js` para renovar la caché.

## Privacidad

No hay analítica ni peticiones a una API de lectura. Fotos solo en memoria de la sesión. Los nombres y horarios del proyecto se guardan en `localStorage` en el navegador del usuario, y en los JSON que el usuario descarga. El informe de prueba contiene cifras y tipos de incidencia, sin nombres ni fotos. «Borrar sesión» elimina el proyecto del navegador, no los archivos ya descargados.

## Verificación

- `npm ci --ignore-scripts` y `npm test` ejecutan las pruebas del motor y del PDF.
- Se ha comprobado sintaxis de JavaScript y las referencias de archivos locales.
- El lector se ha ejecutado con Tesseract.js 7 y el motor de píxeles en Node sobre dos fotografías reales. Estas fotos no están en el paquete.
- El editor visual y la instalación en Safari/iPhone y Chrome/Android requieren prueba interactiva en los dispositivos de destino. No se han verificado todavía en un navegador real en esta sesión.

## Dependencias y licencias

Tesseract.js 7.0.0, tesseract.js-core 7.0.0 y datos `eng.traineddata` / `spa.traineddata` de la instalación de Tesseract. Avisos de licencia en `site/vendor/*LICENSE*` y `eng-traineddata-COPYRIGHT.txt`. El programa OCR usa aprendizaje automático internamente, pero no utiliza un servicio de IA generativa ni cobra por lectura.

## Primera prueba recomendada

Usar un día ya resuelto, revisar los nombres, comprobar cada media hora y cada descanso, comparar la hoja con la de la coordinadora y anotar las diferencias. No usar la salida automática sin revisión para dirigir el trabajo.

## Cambio de cajas principales · 16/10/2026

Las cajas principales son 10 (primera) y 19 (segunda); 14 mantiene la tercera prioridad y 18 pasa al grupo de cajas adicionales. La configuración es editable por proyecto/día. Las sesiones del 16/10/2026 o posteriores que conservan exactamente la configuración predeterminada antigua se actualizan una vez; los días anteriores y las configuraciones personalizadas se conservan.

## Interfaz simplificada · 16/10/2026

La pantalla inicial muestra las dos fotos y la fecha, sin presentación superior ni campo de tienda. El botón Descargar PDF genera el archivo localmente con los tramos de media hora del turno y los descansos a la derecha.

## Formato de referencia y flujo · 16/10/2026

La hoja de referencia se traslada a A4 con dos columnas de lectura: arriba a abajo en la izquierda y luego en la derecha. Cada bloque muestra la media hora, el número de cajeros rodeado, los nombres uno por línea con su caja y los descansos a la derecha. Los bloques nunca se parten entre columnas. Si los nombres completos o la carga del turno requieren más espacio, el PDF continúa en otra página. Se repite cada media hora para que la hoja no dependa de signos como «+» o de recordar el bloque anterior.

El turno de tarde predeterminado comienza a las 14:00, como en la referencia aportada. La mañana se propone de 09:00 a 14:30, ajustable; no se considera una regla de plantilla confirmada. La selección de turno filtra la hoja y recalcula la prioridad sin volver a analizar las fotos. Las fotos y las notas manuscritas de referencia no se publican. Las anotaciones en recuadros no tienen una interpretación automática asumida.

El paso 2 muestra un resumen; la edición avanzada queda cerrada bajo «Corregir un dato leído». Una comprobación del resumen confirma solo ese intervalo de horas. Cambiar las horas no confirma automáticamente otro turno. Los cambios puntuales del paso 3 no se interpretan como lenguaje libre: son controles explícitos que validan la disponibilidad. Una excepción caduca al terminar su intervalo.

La mejora de interfaz y formato no resuelve la precisión del OCR: la prueba sobre la foto delantera del 16/10 todavía omite filas y desplaza algunos tramos. No se considera validada una transcripción automática de extremo a extremo.

## Lector geométrico · 17/10/2026

El lector anterior dependía de coordenadas proporcionales fijas y de que el OCR reconociese la etiqueta A/B. El recorte de nombres incluía círculos y pliegues; algunas filas se descartaban por ese ruido. El gris de una letra o una sombra podía confundirse con un bloque de caja. El resultado podía omitir el bloque principal casi completo.

`site/mot-reader.js` sustituye esa ruta de producción: detecta las escalas multicolores, sigue su curvatura, localiza las filas y los círculos de horas, alinea sus nombres, mide las marcas de cada hora, comprueba el relleno de las casillas y reconoce las marcas AM sobre recortes rectificados. Se usa el modelo español gratuito de tessdata_fast 4.1.0 con SHA-256 verificado. La lectura en Node y en navegador comparte el mismo módulo. Si no se sitúa una escala o sus filas, se informa del fallo en lugar de generar una lista mínima como si fuera válida.

Una lectura guardada con la versión anterior no se transforma ni se valida automáticamente: se pide volver a analizar las dos fotos. El PDF y su formato aprobado no se modifican.

Verificación: 22 pruebas automáticas de motor, PDF y geometría; comparación privada de ambas caras del MOT de referencia y reconocimiento de geometría sobre otras tomas. En el ejemplo de tarde, el recuento recuperado coincide con 13 de los 15 tramos de la hoja manuscrita; siguen existiendo errores de escritura en algunos nombres y diferencias de personas/asignaciones. Coincidir en recuento NO valida toda la organización. No se han codificado nombres ni horarios del ejemplo en el producto ni en las pruebas públicas.

Los relevos que no estén pintados en el MOT no se pueden deducir automáticamente: el cambio puntual «Sustituir a quien sale a cubrir una sección» mantiene el número y la caja, retira al saliente sin marcarlo de descanso y exige que el sustituto esté en otra tarea, nunca de descanso ni fuera de turno. Al finalizar el intervalo, se recupera la asignación del MOT.

La prueba en la web detectó además que Tesseract.js 7 selecciona Relaxed SIMD en algunos navegadores. La preparación de recursos incluye todas las variantes LSTM WASM del paquete fijado, incluida Relaxed SIMD, y la caché las precarga. Un fallo de arranque se mantiene visible en el estado de lectura.

La asignación automática reserva las dos primeras cajas prioritarias para los dos primeros cajeros activos del tramo, antes de intentar conservar cajas auxiliares. Esto corrige que el segundo prioritario mantuviera una caja secundaria al incorporarse o volver de su descanso. Las cajas fijadas expresamente conservan precedencia.
