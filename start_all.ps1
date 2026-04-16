# Start backend services
docker-compose up -d

Write-Host "Waiting 25 seconds for MySQL, Redis, and RabbitMQ containers to initialize..."
Start-Sleep -Seconds 25

# Start microservices in separate windows
Start-Process -FilePath "node" -ArgumentList "api-gateway\index.js" -WorkingDirectory "$PSScriptRoot" -WindowStyle Normal
Start-Process -FilePath "node" -ArgumentList "auth-service\index.js" -WorkingDirectory "$PSScriptRoot" -WindowStyle Normal
Start-Process -FilePath "node" -ArgumentList "expense-service\index.js" -WorkingDirectory "$PSScriptRoot" -WindowStyle Normal
Start-Process -FilePath "node" -ArgumentList "group-service\index.js" -WorkingDirectory "$PSScriptRoot" -WindowStyle Normal
Start-Process -FilePath "node" -ArgumentList "notification-service\index.js" -WorkingDirectory "$PSScriptRoot" -WindowStyle Normal
Start-Process -FilePath "node" -ArgumentList "settlement-service\index.js" -WorkingDirectory "$PSScriptRoot" -WindowStyle Normal
# user-service is DEPRECATED (Logic moved to auth-service)

# Start frontend
Write-Host "Starting frontend dev server..."
Start-Process -FilePath "npm.cmd" -ArgumentList "run dev" -WorkingDirectory "$PSScriptRoot\frontend" -WindowStyle Normal

Write-Host "All services started!"
