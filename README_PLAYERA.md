# Theme_Playera_Whatsapp

Tema personalizado para WhatsApp oficial de Microsoft Store en Windows x64.
Incluye fondo HD, paleta Playera, tipografia Child Hood, icono propio y sonidos.

## Instalacion

Descarga `Theme_Playera_Whatsapp-Instalar.exe` desde Releases de este repositorio.
El instalador incluye Node.js y crea accesos para modo normal, Ligero y restaurar.
Necesitas tener WhatsApp oficial instalado y una sesion iniciada.
El ejecutable no esta firmado digitalmente.

El acceso reinicia WhatsApp: termina llamadas y transferencias antes de usarlo.
El tema utiliza depuracion local de WebView2. Otros programas locales pueden
acceder a esa sesion mientras siga abierta. Usa `WhatsApp - Restaurar normal`
para abrir sin tema ni depuracion. No se modifican los archivos de WindowsApps.

## Personalizacion y compilacion

Consulta `PERSONALIZACION.md`. La fuente activa es `desktop/assets/Child Hood.otf`.
Los dos modos comparten el diseno; Ligero desactiva las animaciones del tema.
La busqueda automatica de actualizaciones sigue desactivada.

Para compilar en Windows:

```powershell
.\desktop\installer\Build-Installer.ps1 -NodePath .\desktop\runtime\node.exe
```

Se requiere Node.js oficial 24.17.0 x64, cuyo hash verifica el script.
La salida queda en `dist/`, incluye SHA256 y se comprueba con `--verify`.

Basado en https://github.com/Strike2911/Persona-5-Theme.
Se conserva LICENSE (GPL-3.0) y el historial del proyecto original.
Los recursos graficos y tipograficos conservan las condiciones de sus autores.
Proyecto no oficial, sin afiliacion con WhatsApp o Meta.
