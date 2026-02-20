#!/bin/bash

# Set environment variables for development
export NODE_ENV=development
export PORT=3001
export DATABASE_HOST=localhost
export DATABASE_PORT=5432
export DATABASE_NAME=inventory_enterprise
export DATABASE_USER=inventory_user
export DATABASE_PASSWORD=inventory_pass
export FRONTEND_URL=http://localhost:3000

# Start the server
echo "Starting Inventory Monitoring Backend..."
npm run start:dev 