# stop_all.ps1
Write-Host "Stopping Node microservices on ports 3000-3006..."
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

Write-Host "Bringing down Docker containers..."
docker-compose down

Write-Host "All services stopped!"
