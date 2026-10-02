param(
    [string]$DesktopDirectory = [Environment]::GetFolderPath('DesktopDirectory'),
    [string]$ProgramsDirectory = [Environment]::GetFolderPath('Programs')
)
$ErrorActionPreference = 'Stop'
if (!$ProgramsDirectory) { throw 'No se encontro el menu Inicio de este usuario.' }
$startMenu = Join-Path $ProgramsDirectory 'Theme_Playera_Whatsapp'
New-Item -ItemType Directory -Path $startMenu -Force | Out-Null
$shell = New-Object -ComObject WScript.Shell
try {
    $package = Get-AppxPackage 5319275A.WhatsAppDesktop
    foreach ($entry in @(
        @{Name='Theme_Playera_Whatsapp';Args='';Description='WhatsApp oficial con tema Theme_Playera_Whatsapp y efectos breves'},
        @{Name='Theme_Playera_Whatsapp - Ligero';Args=' -Lite';Description='WhatsApp oficial con tema Theme_Playera_Whatsapp sin transiciones'},
        @{Name='WhatsApp - Restaurar normal';Args=' -Normal';Description='Reinicia WhatsApp sin tema ni depuracion local'},
        @{Name='Theme_Playera_Whatsapp - Buscar actualizaciones';Args=' -Force';Script='Update-WhatsApp.ps1';Description='Busca nuevas versiones del tema en GitHub'}
    )) {
        # Inicio es independiente del escritorio: este puede faltar o estar protegido.
        $link = Join-Path $startMenu ($entry.Name + '.lnk')
        $shortcut = $shell.CreateShortcut($link)
        try {
            $shortcut.TargetPath = "$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe"
            $scriptName = if ($entry.Script) { $entry.Script } else { 'Start-WhatsApp.ps1' }
            $shortcut.Arguments = '-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "' + (Join-Path $PSScriptRoot $scriptName) + '"' + $entry.Args
            $shortcut.WorkingDirectory = $PSScriptRoot
            $shortcut.Description = $entry.Description
            $shortcut.WindowStyle = 7
            if ($entry.Args -ne ' -Normal') { $shortcut.IconLocation = (Join-Path $PSScriptRoot 'assets\playera.ico') + ',0' }
            elseif ($package) { $shortcut.IconLocation = (Join-Path $package.InstallLocation 'WhatsApp.Root.exe') + ',0' }
            $shortcut.Save()
        } finally { [void][Runtime.InteropServices.Marshal]::ReleaseComObject($shortcut) }
        Write-Output $link
        try {
            if (!$DesktopDirectory) { throw 'Windows no proporciona una carpeta de escritorio.' }
            New-Item -ItemType Directory -Path $DesktopDirectory -Force | Out-Null
            Copy-Item -LiteralPath $link -Destination (Join-Path $DesktopDirectory ($entry.Name + '.lnk')) -Force
        } catch { Write-Warning ('No se pudo crear el acceso en el escritorio. Disponible en Inicio: ' + $entry.Name) }
    }
} finally { [void][Runtime.InteropServices.Marshal]::ReleaseComObject($shell) }
