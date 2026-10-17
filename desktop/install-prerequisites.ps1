<#
.SYNOPSIS
    Installs prerequisites for building the EduSphere AI Tauri 2 Desktop Application on Windows.

.DESCRIPTION
    Checks for and installs:
    - Node.js & npm (if missing)
    - Rust & Cargo via rustup-init
    - Microsoft Visual Studio C++ Build Tools (required by rustc for MSVC target)
    - Tauri CLI (@tauri-apps/cli)
#>

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  EduSphere AI — Desktop Prerequisites Setup (Windows)     " -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

# 1. Check Node.js
Write-Host "`n[1/4] Checking Node.js runtime..." -ForegroundColor Yellow
if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVer = node --version
    Write-Host "  ✓ Node.js detected: $nodeVer" -ForegroundColor Green
} else {
    Write-Host "  ✗ Node.js not found. Please install Node.js 18+ from https://nodejs.org/" -ForegroundColor Red
}

# 2. Check Rust & Cargo
Write-Host "`n[2/4] Checking Rust toolchain..." -ForegroundColor Yellow
if (Get-Command cargo -ErrorAction SilentlyContinue) {
    $rustVer = rustc --version
    Write-Host "  ✓ Rust toolchain detected: $rustVer" -ForegroundColor Green
} else {
    Write-Host "  ! Rust is not installed or not in PATH." -ForegroundColor Yellow
    Write-Host "  Downloading and launching rustup installer..." -ForegroundColor Cyan
    
    $rustupUrl = "https://win.rustup.rs/x86_64"
    $installerPath = "$env:TEMP\rustup-init.exe"
    
    Invoke-WebRequest -Uri $rustupUrl -OutFile $installerPath
    Write-Host "  Running rustup-init.exe (Default profile: MSVC x86_64)..." -ForegroundColor Cyan
    Start-Process -FilePath $installerPath -ArgumentList "-y" -Wait
    
    # Add to current process PATH
    $env:PATH += ";$env:USERPROFILE\.cargo\bin"
    
    if (Get-Command cargo -ErrorAction SilentlyContinue) {
        Write-Host "  ✓ Rust installed successfully: $(rustc --version)" -ForegroundColor Green
    } else {
        Write-Host "  ! Please restart your terminal after installation to refresh your PATH." -ForegroundColor Yellow
    }
}

# 3. Check C++ Build Tools
Write-Host "`n[3/4] Checking Visual C++ Build Tools..." -ForegroundColor Yellow
$vsWherePath = "${env:ProgramFiles(x86)}\Microsoft Visual Studio\Installer\vswhere.exe"
if (Test-Path $vsWherePath) {
    $vsInstall = & $vsWherePath -latest -products * -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property installationPath
    if ($vsInstall) {
        Write-Host "  ✓ Visual Studio C++ Build Tools found at: $vsInstall" -ForegroundColor Green
    } else {
        Write-Host "  ! C++ Build Tools may be missing. Ensure 'Desktop development with C++' is checked in VS Installer." -ForegroundColor Yellow
    }
} else {
    Write-Host "  ! If build fails with link.exe error, install Build Tools from https://visualstudio.microsoft.com/visual-cpp-build-tools/" -ForegroundColor Yellow
}

# 4. Install Desktop Dependencies
Write-Host "`n[4/4] Installing Desktop NPM Dependencies..." -ForegroundColor Yellow
$desktopDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Push-Location $desktopDir
npm install
Pop-Location
Write-Host "  ✓ Node dependencies installed in desktop/ directory." -ForegroundColor Green

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "  Setup Complete! You can now run:                          " -ForegroundColor Green
Write-Host "    cd desktop                                              " -ForegroundColor White
Write-Host "    npm run tauri:dev     # Launch live desktop window      " -ForegroundColor White
Write-Host "    npm run tauri:build   # Build Windows installer (.msi)  " -ForegroundColor White
Write-Host "============================================================" -ForegroundColor Cyan
