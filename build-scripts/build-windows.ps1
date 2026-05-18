param(
    [string]$NodeVersion = "v20.20.2",
    [string]$OutputName = "health-mall-windows-x64.zip"
)

$ErrorActionPreference = "Stop"

function Write-Step {
    param([string]$Message)
    Write-Host ""
    Write-Host "[$Message]" -ForegroundColor Cyan
}

function Invoke-NpmInstall {
    param(
        [string]$Directory,
        [switch]$ProductionOnly
    )

    Push-Location $Directory
    try {
        if (Test-Path "package-lock.json") {
            if ($ProductionOnly) {
                & $script:NpmCmd ci --omit=dev
            } else {
                & $script:NpmCmd ci
            }
        } else {
            if ($ProductionOnly) {
                & $script:NpmCmd install --omit=dev
            } else {
                & $script:NpmCmd install
            }
        }
    } finally {
        Pop-Location
    }
}

function Invoke-Robocopy {
    param(
        [string]$Source,
        [string]$Destination
    )

    robocopy $Source $Destination /E /NFL /NDL /NJH /NJS /NP `
        /XD node_modules .git build-scripts miniprogram `
        /XF *.db *.db-shm *.db-wal health-mall-*.zip health-mall-*.tar.gz CLAUDE.md .env .env.*

    if ($LASTEXITCODE -gt 7) {
        throw "robocopy failed with exit code $LASTEXITCODE"
    }
}

if ($env:OS -ne "Windows_NT") {
    throw "This script must run on Windows. Use Windows, a Windows VM, or GitHub Actions windows-latest."
}

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectDir = Resolve-Path (Join-Path $ScriptDir "..")
$BuildRoot = Join-Path $env:TEMP "health-mall-build-win"
$AppDir = Join-Path $BuildRoot "health-mall"
$NodeDist = "node-$NodeVersion-win-x64"
$NodeUrl = "https://nodejs.org/dist/$NodeVersion/$NodeDist.zip"
$NodeZip = Join-Path $env:TEMP "$NodeDist.zip"
$NodeExtractDir = Join-Path $BuildRoot $NodeDist
$NodeDir = Join-Path $AppDir "node"
$Output = Join-Path $ProjectDir $OutputName

Write-Host "============================================"
Write-Host "  Build health-mall Windows x64 package"
Write-Host "============================================"

Write-Step "1/7 Clean build directory"
Remove-Item $BuildRoot -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force -Path $AppDir | Out-Null

Write-Step "2/7 Copy project files"
Invoke-Robocopy -Source "$ProjectDir" -Destination $AppDir

Write-Step "3/7 Download portable Node.js $NodeVersion"
if (-not (Test-Path $NodeZip)) {
    Invoke-WebRequest -Uri $NodeUrl -OutFile $NodeZip
} else {
    Write-Host "Using cached Node.js: $NodeZip"
}
Expand-Archive -Path $NodeZip -DestinationPath $BuildRoot -Force
New-Item -ItemType Directory -Force -Path $NodeDir | Out-Null
Copy-Item -Path (Join-Path $NodeExtractDir "*") -Destination $NodeDir -Recurse -Force

$script:NpmCmd = Join-Path $NodeDir "npm.cmd"
$NodeCmd = Join-Path $NodeDir "node.exe"
$env:PATH = "$NodeDir;$env:PATH"

Write-Step "4/6 Install Windows dependencies"
Invoke-NpmInstall -Directory $AppDir
Invoke-NpmInstall -Directory (Join-Path $AppDir "server") -ProductionOnly
Invoke-NpmInstall -Directory (Join-Path $AppDir "client")

Write-Step "5/6 Create launcher scripts"
$StartBat = @(
    "@echo off",
    "setlocal",
    "set `"PATH=%~dp0node;%PATH%`"",
    "cd /d `"%~dp0`"",
    "echo ============================================",
    "echo   Health Mall",
    "echo ============================================",
    "echo.",
    "echo   Frontend: http://localhost:5173",
    "echo   Backend:  http://localhost:3001",
    "echo   Admin: admin / admin123",
    "echo   User: user1 / 123456",
    "echo.",
    "echo   Close this window to stop the service.",
    "echo ============================================",
    "echo.",
    "powershell -NoProfile -WindowStyle Hidden -Command `"Start-Sleep -Seconds 4; Start-Process 'http://localhost:5173'`"",
    "call npm run dev",
    "pause"
)
Set-Content -Path (Join-Path $AppDir "start.bat") -Value $StartBat -Encoding ASCII

$StopBat = @(
    "@echo off",
    "echo Stopping Health Mall...",
    "for /f `"tokens=5`" %%a in ('netstat -aon ^| findstr `":3001`" ^| findstr `"LISTENING`"') do taskkill /PID %%a /F >nul 2>&1",
    "for /f `"tokens=5`" %%a in ('netstat -aon ^| findstr `":5173`" ^| findstr `"LISTENING`"') do taskkill /PID %%a /F >nul 2>&1",
    "echo Done.",
    "pause"
)
Set-Content -Path (Join-Path $AppDir "stop.bat") -Value $StopBat -Encoding ASCII

$Readme = @(
    "Health Mall Windows x64",
    "",
    "Usage:",
    "1. Unzip $OutputName",
    "2. Open the health-mall folder",
    "3. Double-click start.bat",
    "4. Visit http://localhost:5173",
    "",
    "Services:",
    "Frontend: http://localhost:5173",
    "Backend: http://localhost:3001",
    "",
    "Default accounts:",
    "Admin: admin / admin123",
    "User: user1 / 123456"
)
Set-Content -Path (Join-Path $AppDir "README.txt") -Value $Readme -Encoding UTF8

Write-Step "6/6 Verify and zip"
Push-Location $AppDir
try {
    & $NodeCmd -e "require('./server/node_modules/better-sqlite3'); console.log('better-sqlite3 ok')"
    & $NodeCmd -e "require('./node_modules/concurrently'); console.log('concurrently ok')"
} finally {
    Pop-Location
}

Remove-Item $Output -Force -ErrorAction SilentlyContinue
Compress-Archive -Path $AppDir -DestinationPath $Output -Force
Remove-Item $BuildRoot -Recurse -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "============================================"
Write-Host "  Build complete"
Write-Host "  File: $Output"
Write-Host "============================================"
Write-Host ""
Write-Host "Customer usage:"
Write-Host "  Unzip $OutputName"
Write-Host "  Open health-mall"
Write-Host "  Double-click start.bat"
