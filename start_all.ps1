# Start backend services
docker-compose up -d

Write-Host "Waiting 12 seconds for MySQL, Redis, and RabbitMQ containers to initialize..."
Start-Sleep -Seconds 12

# Start microservices in separate windows
Start-Process -FilePath "node" -ArgumentList "api-gateway\index.js" -WorkingDirectory "$PSScriptRoot" -WindowStyle Normal
Start-Process -FilePath "node" -ArgumentList "auth-service\index.js" -WorkingDirectory "$PSScriptRoot" -WindowStyle Normal
Start-Process -FilePath "node" -ArgumentList "expense-service\index.js" -WorkingDirectory "$PSScriptRoot" -WindowStyle Normal
Start-Process -FilePath "node" -ArgumentList "group-service\index.js" -WorkingDirectory "$PSScriptRoot" -WindowStyle Normal
Start-Process -FilePath "node" -ArgumentList "notification-service\index.js" -WorkingDirectory "$PSScriptRoot" -WindowStyle Normal
Start-Process -FilePath "node" -ArgumentList "settlement-service\index.js" -WorkingDirectory "$PSScriptRoot" -WindowStyle Normal
Start-Process -FilePath "node" -ArgumentList "user-service\index.js" -WorkingDirectory "$PSScriptRoot" -WindowStyle Normal

# Start frontend
Start-Process -FilePath "npm" -ArgumentList "run dev" -WorkingDirectory "$PSScriptRoot\frontend" -WindowStyle Normal

Write-Host "All services started!"
