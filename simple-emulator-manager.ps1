#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Simple Firebase Emulator Manager
.DESCRIPTION
    Basic emulator management with working PowerShell
.EXAMPLE
    .\simple-emulator-manager.ps1 start
    .\simple-emulator-manager.ps1 stop
    .\simple-emulator-manager.ps1 status
#>

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("start", "stop", "status", "restart")]
    [string]$Action
)

# Configuration
$BACKEND_DIR = "Timeout Backend"
$CONFIG_FILE = "emulator-config.json"

# Colors
$RED = "`e[31m"
$GREEN = "`e[32m" 
$YELLOW = "`e[33m"
$BLUE = "`e[34m"
$RESET = "`e[0m"

function Write-ColorLog {
    param([string]$Message, [string]$Level = "INFO")
    switch ($Level) {
        "ERROR" { Write-Host "${RED}[ERROR] $Message${RESET}" }
        "WARN"  { Write-Host "${YELLOW}[WARN] $Message${RESET}" }
        "SUCCESS" { Write-Host "${GREEN}[SUCCESS] $Message${RESET}" }
        "INFO"  { Write-Host "${BLUE}[INFO] $Message${RESET}" }
        default { Write-Host $Message }
    }
}

function Get-EmulatorPorts {
    if (Test-Path $CONFIG_FILE) {
        $config = Get-Content $CONFIG_FILE -Raw | ConvertFrom-Json
        return @{
            functions = $config.emulators.functions.port
            firestore = $config.emulators.firestore.port  
            auth = $config.emulators.auth.port
            hosting = $config.emulators.hosting.port
        }
    }
    
    # Fallback to current known ports
    return @{
        functions = 5002
        firestore = 8096
        auth = 9098
        hosting = 5003
    }
}

function Test-Port {
    param([int]$Port)
    try {
        $connection = Test-NetConnection -ComputerName "127.0.0.1" -Port $Port -InformationLevel Quiet -WarningAction SilentlyContinue
        return $connection
    } catch {
        return $false
    }
}

function Get-ProcessOnPort {
    param([int]$Port)
    try {
        $netstat = netstat -ano | Select-String ":$Port "
        if ($netstat) {
            $line = $netstat[0].ToString().Trim()
            $pid = ($line -split '\s+')[-1]
            if ($pid -match '^\d+$') {
                return [int]$pid
            }
        }
        return $null
    } catch {
        return $null
    }
}

function Stop-EmulatorProcesses {
    Write-ColorLog "Stopping emulator processes..."
    
    $ports = Get-EmulatorPorts
    $stoppedAny = $false
    
    foreach ($service in $ports.GetEnumerator()) {
        $port = $service.Value
        $pid = Get-ProcessOnPort -Port $port
        
        if ($pid) {
            try {
                Stop-Process -Id $pid -Force
                Write-ColorLog "Stopped $($service.Name) process (PID: $pid)" "SUCCESS"
                $stoppedAny = $true
            } catch {
                Write-ColorLog "Failed to stop process $pid" "ERROR"
            }
        }
    }
    
    if (-not $stoppedAny) {
        Write-ColorLog "No emulator processes found running"
    }
    
    Start-Sleep -Seconds 2
}

function Show-EmulatorStatus {
    Write-ColorLog "=== Firebase Emulator Status ==="
    
    $ports = Get-EmulatorPorts
    $allHealthy = $true
    
    foreach ($service in $ports.GetEnumerator()) {
        $name = $service.Name
        $port = $service.Value
        $isRunning = Test-Port -Port $port
        
        $status = if ($isRunning) { "${GREEN}RUNNING${RESET}" } else { "${RED}STOPPED${RESET}"; $allHealthy = $false }
        Write-Host "  $name : $status on 127.0.0.1:$port"
    }
    
    Write-Host ""
    if ($allHealthy) {
        Write-ColorLog "Overall Status: All services are healthy" "SUCCESS"
    } else {
        Write-ColorLog "Overall Status: Some services are down" "ERROR"
    }
    
    return $allHealthy
}

function Start-Emulators {
    Write-ColorLog "Starting Firebase emulators..."
    
    if (-not (Test-Path $BACKEND_DIR)) {
        Write-ColorLog "Backend directory not found: $BACKEND_DIR" "ERROR"
        exit 1
    }
    
    # Check if already running
    if (Show-EmulatorStatus) {
        Write-ColorLog "Emulators are already running!" "WARN"
        return
    }
    
    Write-ColorLog "Starting emulators in background..."
    Set-Location $BACKEND_DIR
    
    # Start Firebase emulators in background
    Start-Process -FilePath "firebase" -ArgumentList @("emulators:start") -NoNewWindow
    
    # Wait and check if they started
    Write-ColorLog "Waiting for emulators to start..."
    for ($i = 1; $i -le 10; $i++) {
        Start-Sleep -Seconds 3
        Set-Location ".."
        if (Show-EmulatorStatus) {
            Write-ColorLog "All emulators started successfully!" "SUCCESS"
            return
        }
        Write-ColorLog "Attempt $i/10 - Still starting..." "INFO"
    }
    
    Write-ColorLog "Emulators may still be starting. Check status manually." "WARN"
}

# Main execution
Write-ColorLog "=== Simple Firebase Emulator Manager ===" "INFO"
Write-ColorLog "Action: $Action" "INFO"

try {
    switch ($Action.ToLower()) {
        "start" {
            Start-Emulators
        }
        "stop" {
            Stop-EmulatorProcesses
        }
        "status" {
            Show-EmulatorStatus | Out-Null
        }
        "restart" {
            Stop-EmulatorProcesses
            Start-Sleep -Seconds 3
            Start-Emulators
        }
    }
    
    Write-ColorLog "Operation completed" "SUCCESS"
    
} catch {
    Write-ColorLog "Operation failed: $($_.Exception.Message)" "ERROR"
    exit 1
}