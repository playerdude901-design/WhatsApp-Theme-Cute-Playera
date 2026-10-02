# Theme_Playera_Whatsapp

## Assets activos y paleta

- `desktop/assets/playera-fullscreen_HD.png`: fondo del chat, centrado con cover.
- `desktop/assets/wordmark.png`: logo en la cabecera de la lista.
- `desktop/assets/sidebar-dude.png`: ilustracion inferior de la barra de navegacion.
- `desktop/assets/comic-edge_soft.png`: franja debajo del compositor.
- Lista de contactos: `#EBEBEB`. Bordes y hover: `#F45B69`.
- Contactos y acciones: `#4062BB`. Acentos secundarios: `#52489C`.
- Mensajes enviados: `#59C3C3`, con texto oscuro.

Estos PNG sustituyen la carga de los SVG decorativos originales. El ajuste
Playera > Oscurecer fondo se conserva. El icono ICO y los sonidos siguen
siendo los anteriores. La tabla historica inferior describe otros recursos
disponibles; para los cuatro recursos visuales usa los nombres de esta seccion.

Base clonada de https://github.com/Strike2911/Persona-5-Theme.git.
El instalador, los accesos y los controles usan el nombre del nuevo proyecto.
La interfaz usa una base clara: bordes rosas, mensajes azules y verdes pastel,
paneles blancos rosados y fondo beige. El icono y sonidos originales siguen
siendo provisionales. Los SVG originales se conservan, pero el nuevo CSS no los muestra.
Se conserva la licencia GPL-3.0 y la documentacion historica del original.

## Recursos que necesitas

| Recurso | Archivo actual | Recomendacion |
| --- | --- | --- |
| Fondo de conversaciones | `desktop/assets/playera-wallpaper.png` | PNG. Copia de la imagen proporcionada; se incrusta directamente sin el limite de las variables CSS. |
| Icono de accesos e instalador | `desktop/assets/playera.ico` | ICO con tamanos 16, 32, 48 y 256 px. Puedes entregar un PNG transparente de 512 x 512 para convertirlo. |
| Logotipo | `desktop/assets/wordmark.svg` | SVG, proporcion aproximada 340 x 100; texto convertido a trazados. |
| Decoracion lateral | `desktop/assets/sidebar-city.svg` | SVG con fondo transparente. |
| Franja decorativa | `desktop/assets/comic-edge.svg` | SVG, conservar el viewBox o adaptar su CSS. |
| Insignia CHAT | `desktop/assets/chat-badge.svg` | SVG, proporcion aproximada 150 x 130. |
| Ilustraciones adicionales | `icons/img.svg`, `icons/img2.svg`, `icons/imgBGW.svg` | Sustituir tambien para retirar completamente el arte original. |
| Sonido dentro del chat | `desktop/assets/pop-5.mp3` | MP3 breve; opcional para tu diseno, pero el archivo debe existir. |
| Sonido de notificacion | `desktop/assets/message-other.mp3` | MP3 breve; el archivo debe existir aunque silencies los sonidos. |

Ademas: define colores HEX para fondo, paneles, acento, texto, mensajes enviados
y recibidos; indica tipografia, bordes, estilo de marcos y frases de portada.
Una captura de referencia ayuda a concretar el resultado. Entrega recursos propios
o con permiso de uso. Las fotos de los contactos se conservan.

## Como reemplazar el tema

1. Sustituye los recursos de la tabla conservando nombres y formatos. No basta
   con cambiar la extension de un PNG a SVG o JPG.
2. Edita `desktop/playera.css`: sustituye los estilos visuales originales y se
   carga despues de los efectos y recursos. Usa selectores bajo `html[data-p5-desktop]` y conserva
   los atributos internos `data-p5-*`, que controlan la aplicacion y el modo Ligero.
3. Para cambiar la imagen, reemplaza `desktop/assets/playera-wallpaper.png`.
   Se muestra centrada, sin repetir, cubriendo el chat; puede recortarse segun
   la proporcion de la ventana. El archivo original se conserva sin cambios.
   Los SVG decorativos son opcionales; solo hacen falta si decides agregar
   ilustraciones o un logo al diseno. `persona.css`, `persona-v2.css`,
   `comic.css` y `contrast.css` quedan como referencia y ya no se cargan.
4. Los avisos nativos se dibujan en `desktop/NotificationPopup.cs` y la interfaz
   del instalador en `desktop/installer/Setup.cs`: sus colores se personalizan
   aparte. Los textos del panel de sonido estan en `desktop/effects.mjs`.
5. Ejecuta las pruebas desde la raiz:

   ```powershell
   node --test desktop/theme.test.mjs desktop/updater.test.mjs desktop/effects.test.mjs desktop/native-notifications.test.mjs
   ```

6. Para probar en WhatsApp oficial de Microsoft Store, con Node.js 22 o posterior:

   ```powershell
   .\desktop\Start-WhatsApp.ps1 -Lite
   # Volver al funcionamiento normal:
   .\desktop\Start-WhatsApp.ps1 -Normal
   ```

   El lanzador reinicia WhatsApp. Termina antes llamadas y transferencias.
   El tema habilita depuracion local hasta cerrar el proceso o restaurar normal.
   No cambia los archivos firmados de WhatsApp. Una actualizacion de WhatsApp
   puede requerir adaptar selectores; hay que revisar visualmente el resultado.

## Instalador y versiones

- Normal: tema con efectos. Ligero: mismo tema sin sus animaciones; no garantiza
  menor consumo global ni corrige bloqueos internos de WhatsApp.
- `desktop/installer/Build-Installer.ps1 -NodePath RUTA_AL_NODE_EXE` construye
  `dist/Theme_Playera_Whatsapp-Instalar.exe`. Exige el runtime oficial Node.js
  24.17.0 x64 con el SHA256 fijado en el script; no acepta cualquier node.exe.
- `playera.css` se incluye automaticamente en el paquete. Si agregas otros
  recursos, modifica el listado de assets en `Build-Installer.ps1` y su carga
  en `apply-theme.mjs`.
- La instalacion usa `%LOCALAPPDATA%\Programs\Theme_Playera_Whatsapp`.
- La busqueda de actualizaciones esta desactivada hasta configurar un repositorio
  propio. El motor `updater.mjs` y sus pruebas conservan la referencia original
  para una futura adaptacion; no se consultan desde `Update-WhatsApp.ps1`.
- La extension web de la raiz (`manifest.json`, `styles/`, `scripts/`) es una
  variante separada. Esta preparacion se concentra en el instalador de Windows.

No se ha instalado ni activado el tema en WhatsApp durante esta preparacion.
