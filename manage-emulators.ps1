#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Firebase Emulator Management Script
.DESCRIPTION
    Provides comprehensive emulator lifecycle management including:
    - Configuration validation
    - Process detection and cleanup
    - Health checks
    - Proper startup/shutdown
.PARAMETER Action
    Action to perform: start, stop, restart, status, cleanup, health
.PARAMETER Force
    Force kill processes without graceful shutdown
.PARAMETER Config
    Path to emulator configuration file
.EXAMPLE
    .\manage-emulators.ps1 start
    .\manage-emulators.ps1 restart -Force
    .\manage-emulators.ps1 health
#>

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("start", "stop", "restart", "status", "cleanup", "health")]
    [string]$Action,
    
    [switch]$Force,
    
    [string]$Config = "emulator-config.json"
)

# Error handling
$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

# Configuration
$SCRIPT_DIR = $PSScriptRoot
$BACKEND_DIR = Join-Path $SCRIPT_DIR "Timeout Backend"
$CONFIG_PATH = Join-Path $SCRIPT_DIR $Config
$LOG_FILE = Join-Path $SCRIPT_DIR "emulator-manager.log"

# Colors for output
$RED = "`e[31m"
$GREEN = "`e[32m"
$YELLOW = "`e[33m"
$BLUE = "`e[34m"
$RESET = "`e[0m"

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] [$Level] $Message"
    
    # Console output with colors
    switch ($Level) {
        "ERROR" { Write-Host "${RED}[ERROR] $Message${RESET}" }
        "WARN"  { Write-Host "${YELLOW}[WARN] $Message${RESET}" }
        "SUCCESS" { Write-Host "${GREEN}[SUCCESS] $Message${RESET}" }
        "INFO"  { Write-Host "${BLUE}[INFO] $Message${RESET}" }
        default { Write-Host $Message }
    }
    
    # File logging
    Add-Content -Path $LOG_FILE -Value $logEntry
}

function Load-Config {
    Write-Log "Loading configuration from: $CONFIG_PATH"
    
    if (-not (Test-Path $CONFIG_PATH)) {
        throw "Configuration file not found: $CONFIG_PATH"
    }
    
    try {
        $configContent = Get-Content $CONFIG_PATH -Raw
        $config = $configContent | ConvertFrom-Json
        Write-Log "Configuration loaded successfully" "SUCCESS"
        
        # Debug output
        Write-Log "Config type after loading: $($config.GetType().Name)"
        Write-Log "Config has emulators: $(if ($config.PSObject.Properties.Name -contains 'emulators') { 'Yes' } else { 'No' })"
        if ($config.PSObject.Properties.Name -contains 'emulators') {
            Write-Log "Emulator count: $($config.emulators.PSObject.Properties.Name.Count)"
        }
        
        return $config
    } catch {
        throw "Failed to parse configuration file: $($_.Exception.Message)"
    }
}

function Test-PortAvailable {
    param([int]$Port, [string]$Host = "127.0.0.1")
    
    try {
        $connection = Test-NetConnection -ComputerName $Host -Port $Port -InformationLevel Quiet -WarningAction SilentlyContinue
        return -not $connection
    } catch {
        return $true  # Assume available if test fails
    }
}

function Get-ProcessOnPort {
    param([int]$Port)
    
    try {
        $netstat = netstat -ano | Select-String ":$Port\s"
        if ($netstat) {
            $line = $netstat[0].ToString().Trim()
            $pid = ($line -split '\s+')[-1]
            
            if ($pid -match '^\d+$') {
                $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
                return @{
                    PID = [int]$pid
                    ProcessName = if ($process) { $process.ProcessName } else { "Unknown" }
                    CommandLine = if ($process) { $process.Path } else { "Unknown" }
                }
            }
        }
        return $null
    } catch {
        return $null
    }
}

function Stop-EmulatorProcesses {
    param([object]$Config, [bool]$ForceKill = $false)
    
    Write-Log "Stopping emulator processes..."
    
    $ports = @()
    
    if (-not $Config.emulators) {
        Write-Log "No emulator configuration found" "WARN"
        return
    }
    
    $emulators = $Config.emulators
    foreach ($emulatorName in $emulators.PSObject.Properties.Name) {
        $emulatorConfig = $emulators.$emulatorName
        if ($emulatorConfig.port) {
            $ports += $emulatorConfig.port
        }
    }
    
    $stoppedProcesses = @()
    
    foreach ($port in $ports) {
        $process = Get-ProcessOnPort -Port $port
        if ($process) {
            Write-Log "Found process $($process.ProcessName) (PID: $($process.PID)) on port $port"
            
            try {
                if ($ForceKill) {
                    Stop-Process -Id $process.PID -Force
                    Write-Log "Force killed process $($process.PID)" "SUCCESS"
                } else {
                    # Try graceful shutdown first
                    Stop-Process -Id $process.PID
                    Start-Sleep -Seconds 2
                    
                    # Check if still running
                    if (Get-Process -Id $process.PID -ErrorAction SilentlyContinue) {
                        Write-Log "Graceful shutdown failed, force killing..." "WARN"
                        Stop-Process -Id $process.PID -Force
                    }
                    Write-Log "Stopped process $($process.PID)" "SUCCESS"
                }
                $stoppedProcesses += $process
            } catch {
                Write-Log "Failed to stop process $($process.PID): $($_.Exception.Message)" "ERROR"
            }
        }
    }
    
    if ($stoppedProcesses.Count -eq 0) {
        Write-Log "No emulator processes found running"
    }
    
    # Wait for ports to be released
    Start-Sleep -Seconds 3
}

function Test-EmulatorHealth {
    param([PSCustomObject]$Config)
    
    Write-Log "Performing emulator health check..."
    
    $healthStatus = @{}
    $allHealthy = $true
    
    # Debug the config object
    Write-Log "Config type: $($Config.GetType().Name)"
    Write-Log "Has emulators property: $(if ($Config.PSObject.Properties.Name -contains 'emulators') { 'Yes' } else { 'No' })"
    
    # Access emulators property safely
    if (-not ($Config.PSObject.Properties.Name -contains 'emulators')) {
        throw "Configuration missing 'emulators' section"
    }
    
    $emulators = $Config.emulators
    Write-Log "Emulators type: $($emulators.GetType().Name)"
    
    foreach ($emulatorName in $emulators.PSObject.Properties.Name) {
        $emulatorConfig = $emulators.$emulatorName
        
        if (-not ($emulatorConfig.PSObject.Properties.Name -contains 'port')) {
            continue
        }
        
        $port = $emulatorConfig.port
        $host = if ($emulatorConfig.PSObject.Properties.Name -contains 'host') { $emulatorConfig.host } else { "127.0.0.1" }
        
        Write-Log "Checking $emulatorName emulator on ${host}:${port}..."
        
        $isRunning = -not (Test-PortAvailable -Port $port -Host $host)
        $healthStatus[$emulatorName] = @{
            Port = $port
            Host = $host
            Running = $isRunning
            Status = if ($isRunning) { "HEALTHY" } else { "DOWN" }
        }
        
        if ($isRunning) {
            Write-Log "$emulatorName emulator is running on ${host}:${port}" "SUCCESS"
        } else {
            Write-Log "$emulatorName emulator is not running on ${host}:${port}" "ERROR"
            $allHealthy = $false
        }
    }
    
    return @{
        AllHealthy = $allHealthy
        Services = $healthStatus
    }
}

function Start-Emulators {
    param([object]$Config)
    
    Write-Log "Starting Firebase emulators..."
    
    # Validate backend directory
    if (-not (Test-Path $BACKEND_DIR)) {
        throw "Backend directory not found: $BACKEND_DIR"
    }
    
    # Check if firebase.json exists and is valid
    $firebaseJsonPath = Join-Path $BACKEND_DIR "firebase.json"
    if (-not (Test-Path $firebaseJsonPath)) {
        Write-Log "firebase.json not found, creating from config..." "WARN"
        Update-FirebaseConfig -Config $Config
    }
    
    # Pre-flight checks
    Write-Log "Running pre-flight checks..."
    
    $portsToCheck = @()
    if ($Config.emulators) {
        $emulators = $Config.emulators
        foreach ($emulatorName in $emulators.PSObject.Properties.Name) {
            $emulatorConfig = $emulators.$emulatorName
            if ($emulatorConfig.port) {
                $portsToCheck += $emulatorConfig.port
            }
        }
    }
    
    $conflictingPorts = @()
    foreach ($port in $portsToCheck) {
        if (-not (Test-PortAvailable -Port $port)) {
            $process = Get-ProcessOnPort -Port $port
            $conflictingPorts += @{
                Port = $port
                Process = $process
            }
        }
    }
    
    if ($conflictingPorts.Count -gt 0) {
        Write-Log "Port conflicts detected:" "ERROR"
        foreach ($conflict in $conflictingPorts) {
            Write-Log "  Port $($conflict.Port): $($conflict.Process.ProcessName) (PID: $($conflict.Process.PID))" "ERROR"
        }
        throw "Cannot start emulators due to port conflicts. Use 'cleanup' action first."
    }
    
    # Start emulators
    Write-Log "All ports are available, starting emulators..."
    
    Set-Location $BACKEND_DIR
    
    try {
        $process = Start-Process -FilePath "firebase" -ArgumentList @("emulators:start") -NoNewWindow -PassThru
        
        # Wait for startup with timeout
        $timeout = 60  # seconds
        $startTime = Get-Date
        
        Write-Log "Waiting for emulators to start (timeout: ${timeout}s)..."
        
        do {
            Start-Sleep -Seconds 2
            $health = Test-EmulatorHealth -Config $Config
            
            if ($health.AllHealthy) {
                Write-Log "All emulators started successfully!" "SUCCESS"
                return $process
            }
            
            $elapsed = (Get-Date) - $startTime
        } while ($elapsed.TotalSeconds -lt $timeout)
        
        throw "Emulators failed to start within timeout period"
        
    } catch {
        Write-Log "Failed to start emulators: $($_.Exception.Message)" "ERROR"
        throw
    }
}

function Update-FirebaseConfig {
    param([object]$Config)
    
    Write-Log "Updating firebase.json with current configuration..."
    
    $firebaseJsonPath = Join-Path $BACKEND_DIR "firebase.json"
    
    if (Test-Path $firebaseJsonPath) {
        $firebaseConfig = Get-Content $firebaseJsonPath | ConvertFrom-Json
    } else {
        $firebaseConfig = @{}
    }
    
    # Update emulator configuration
    $firebaseConfig.emulators = @{}
    
    if ($Config.emulators) {
        $emulators = $Config.emulators
        foreach ($emulatorName in $emulators.PSObject.Properties.Name) {
            $emulatorConfig = $emulators.$emulatorName
            
            if ($emulatorName -eq "ui") {
                $firebaseConfig.emulators.ui = @{
                    enabled = $emulatorConfig.enabled
                }
                if ($emulatorConfig.port) {
                    $firebaseConfig.emulators.ui.port = $emulatorConfig.port
                }
            } else {
                $firebaseConfig.emulators.$emulatorName = @{
                    port = $emulatorConfig.port
                    host = $emulatorConfig.host
                }
            }
        }
    }
    
    # Add other required firebase.json properties
    if (-not $firebaseConfig.firestore) {
        $firebaseConfig.firestore = @{
            rules = "firestore.rules"
            indexes = "firestore.indexes.json"
        }
    }
    
    if (-not $firebaseConfig.functions) {
        $firebaseConfig.functions = @(
            @{
                source = "functions"
                codebase = "default"
                ignore = @("node_modules", ".git", "firebase-debug.log", "firebase-debug.*.log", "*.local")
                predeploy = @('npm --prefix "$RESOURCE_DIR" run build')
            }
        )
    }
    
    if (-not $firebaseConfig.hosting) {
        $firebaseConfig.hosting = @{
            public = "public"
            ignore = @("firebase.json", "**/.*", "**/node_modules/**")
            rewrites = @(
                @{
                    source = "/api/**"
                    function = "api"
                }
            )
        }
    }
    
    # Add logging and project mode
    if ($Config.singleProjectMode) {
        $firebaseConfig.emulators.singleProjectMode = $Config.singleProjectMode
    }
    if ($Config.logging) {
        $firebaseConfig.emulators.logging = $Config.logging
    }
    
    # Save updated configuration
    $firebaseConfig | ConvertTo-Json -Depth 10 | Set-Content $firebaseJsonPath
    Write-Log "Updated firebase.json successfully" "SUCCESS"
}

function Show-Status {
    param([PSCustomObject]$Config)
    
    Write-Log "=== Firebase Emulator Status ===" "INFO"
    
    # Debug the config object at this level too
    Write-Log "Show-Status Config type: $($Config.GetType().Name)"
    
    $health = Test-EmulatorHealth -Config $Config
    
    foreach ($service in $health.Services.GetEnumerator()) {
        $name = $service.Key
        $info = $service.Value
        $status = if ($info.Running) { "${GREEN}RUNNING${RESET}" } else { "${RED}STOPPED${RESET}" }
        
        Write-Host "  $name : $status on $($info.Host):$($info.Port)"
    }
    
    Write-Host ""
    if ($health.AllHealthy) {
        Write-Log "Overall Status: All services are healthy" "SUCCESS"
    } else {
        Write-Log "Overall Status: Some services are down" "ERROR"
    }
}

# Main execution
try {
    Write-Log "=== Firebase Emulator Manager ===" "INFO"
    Write-Log "Action: $Action"
    
    $config = Load-Config
    
    switch ($Action.ToLower()) {
        "start" {
            Write-Log "Starting emulators..."
            $health = Test-EmulatorHealth -Config $config
            if ($health.AllHealthy) {
                Write-Log "Emulators are already running!" "WARN"
                Show-Status -Config $config
            } else {
                Start-Emulators -Config $config
            }
        }
        
        "stop" {
            Write-Log "Stopping emulators..."
            Stop-EmulatorProcesses -Config $config -ForceKill $Force
        }
        
        "restart" {
            Write-Log "Restarting emulators..."
            Stop-EmulatorProcesses -Config $config -ForceKill $Force
            Start-Sleep -Seconds 2
            Start-Emulators -Config $config
        }
        
        "status" {
            Show-Status -Config $config
        }
        
        "cleanup" {
            Write-Log "Cleaning up emulator processes..."
            Stop-EmulatorProcesses -Config $config -ForceKill $true
        }
        
        "health" {
            $health = Test-EmulatorHealth -Config $config
            if ($health.AllHealthy) {
                Write-Log "All emulators are healthy" "SUCCESS"
                exit 0
            } else {
                Write-Log "Some emulators are unhealthy" "ERROR"
                Show-Status -Config $config
                exit 1
            }
        }
    }
    
    Write-Log "Operation completed successfully" "SUCCESS"
    
} catch {
    Write-Log "Operation failed: $($_.Exception.Message)" "ERROR"
    Write-Log "Stack trace: $($_.ScriptStackTrace)" "ERROR"
    exit 1
}