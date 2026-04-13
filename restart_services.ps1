# restart_services.ps1
Write-Host "Finding and killing node microservices on ports 3000-3006..."
(3000..3006) | ForEach-Object {
    $port = $_
    $conn = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($conn) {
        $conn.OwningProcess | ForEach-Object { 
            Write-Host "Killing process $_ on port $port"
            Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue 
        }
    }
}

Write-Host "Starting microservices..."
Start-Process node "index.js" -WorkingDirectory .\api-gateway
Start-Process node "index.js" -WorkingDirectory .\auth-service
Start-Process node "index.js" -WorkingDirectory .\expense-service
Start-Process node "index.js" -WorkingDirectory .\group-service
Start-Process node "index.js" -WorkingDirectory .\notification-service
Start-Process node "index.js" -WorkingDirectory .\settlement-service
Start-Process node "index.js" -WorkingDirectory .\user-service

Write-Host "Done!"
