#!/bin/bash
echo "🔧 正在构建并启动 Dashboard..."
docker compose up -d --build
echo "✅ 启动完成，请访问：http://localhost:3000/"
