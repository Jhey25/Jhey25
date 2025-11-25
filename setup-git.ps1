<#
setup-git.ps1
Script para inicializar un repositorio Git local, crear el commit inicial y opcionalmente añadir un remote y pushear.
Uso:
  - Ejecuta desde PowerShell en la carpeta del proyecto o proporciona la ruta al script.
  - Ejemplos:
      .\setup-git.ps1
      .\setup-git.ps1 -RemoteUrl "https://github.com/USUARIO/REPO.git" -UserName "Mi Nombre" -UserEmail "mi@correo.com"
      .\setup-git.ps1 -UseGH

Parámetros:
  -RemoteUrl : URL del remote (https) para añadir y pushear (opcional).
  -UserName  : Nombre a configurar en git (opcional).
  -UserEmail : Email a configurar en git (opcional).
  -UseGH     : Usar la CLI `gh` para crear el repo en GitHub y pushear (requiere gh autenticado).
#>

[CmdletBinding()]
param (
    [string]$RemoteUrl = "",
    [string]$UserName = "",
    [string]$UserEmail = "",
    [switch]$UseGH
)

function Write-Info { param($m) Write-Host "[INFO] $m" -ForegroundColor Cyan }
function Write-Ok   { param($m) Write-Host "[OK]   $m" -ForegroundColor Green }
function Write-Warn { param($m) Write-Host "[WARN] $m" -ForegroundColor Yellow }
function Write-Err  { param($m) Write-Host "[ERROR] $m" -ForegroundColor Red }

# Detectar git
$gitCmd = Get-Command git -ErrorAction SilentlyContinue
if (-not $gitCmd) {
    Write-Err "Git no está instalado o no está en PATH. Instálalo desde https://git-scm.com/download/win o usa winget."
    exit 1
}

# Si el script está dentro de la carpeta del proyecto, navegar al root (one level up si está en scripts/)
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
# si el archivo está directamente en la raíz del proyecto, $projectRoot es la carpeta que contiene el script
# Para asegurarnos, preguntamos al usuario si quiere usar el directorio actual
$cwd = Get-Location
Write-Info "Directorio actual: $cwd"
$useCurrent = Read-Host "¿Usar este directorio como repo Git? (S/n)"
if ($useCurrent -eq '' -or $useCurrent -match '^[sS]') {
    $projectDir = (Get-Location).Path
} else {
    $projectDir = Read-Host "Ruta absoluta al directorio del proyecto"
    if (-not (Test-Path $projectDir)) {
        Write-Err "La ruta proporcionada no existe."; exit 1
    }
}

Set-Location $projectDir
Write-Info "Trabajando en: $projectDir"

# Configuración de usuario (opcional)
if ($UserName -ne '') {
    git config user.name "$UserName"
    Write-Ok "git user.name configurado a '$UserName'"
}
if ($UserEmail -ne '') {
    git config user.email "$UserEmail"
    Write-Ok "git user.email configurado a '$UserEmail'"
}

# Inicializar repo si no existe
if (-not (Test-Path (Join-Path $projectDir ".git"))) {
    git init
    Write-Ok "Repositorio Git inicializado."
} else {
    Write-Warn "Ya existe un repositorio Git en esta carpeta. Se usará el existente."
}

# Añadir archivos y commit inicial
try {
    git add -A
    git commit -m "Initial commit (web-creciendo-sano-app)" -q
    Write-Ok "Commit inicial creado."
} catch {
    Write-Warn "No se creó commit (posible que no haya cambios o ya exista un commit).";
}

# Usar gh para crear repo remoto si se pidió
if ($UseGH) {
    $ghCmd = Get-Command gh -ErrorAction SilentlyContinue
    if (-not $ghCmd) {
        Write-Err "La GitHub CLI 'gh' no está instalada o no está en PATH. Instálala desde https://cli.github.com/"
        exit 1
    }
    $repoName = Read-Host "Nombre del repo en GitHub (sin usuario). Por defecto usa el nombre del directorio"
    if ($repoName -eq '') { $repoName = Split-Path -Leaf $projectDir }
    $publicOrPrivate = Read-Host "¿Privado o público? (privado/publico) [publico]"
    $isPrivate = $false
    if ($publicOrPrivate -match 'priv') { $isPrivate = $true }
    $visibility = if ($isPrivate) { '--private' } else { '--public' }

    Write-Info "Creando repositorio en GitHub con nombre: $repoName"
    gh repo create $repoName $visibility --source=. --remote=origin --push
    if ($LASTEXITCODE -eq 0) { Write-Ok "Repositorio creado en GitHub y push realizado." } else { Write-Err "No se pudo crear el repo con gh." }
    exit 0
}

# Si se proporcionó remote, añadir y pushear
if ($RemoteUrl -ne '') {
    try {
        git branch -M main
        git remote remove origin 2>$null | Out-Null
        git remote add origin $RemoteUrl
        git push -u origin main
        Write-Ok "Remote añadido y push realizado a $RemoteUrl"
    } catch {
        Write-Err "Error al añadir remote o hacer push: $_"
        exit 1
    }
} else {
    $ask = Read-Host "¿Quieres añadir un remote ahora? (S/n)"
    if ($ask -eq '' -or $ask -match '^[sS]') {
        $remote = Read-Host "Introduce la URL del remote (ej: https://github.com/USUARIO/REPO.git)"
        if ($remote -ne '') {
            git branch -M main
            git remote add origin $remote
            git push -u origin main
            Write-Ok "Remote añadido y push realizado a $remote"
        } else { Write-Warn "No se añadió remote." }
    } else {
        Write-Info "Saltar añadir remote."
    }
}

Write-Ok "Proceso terminado."
exit 0
