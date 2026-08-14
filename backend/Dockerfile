# Base Node.js image with build tools for SQLite compilation
FROM node:20-alpine AS base

# Install Python and build essentials for better-sqlite3 native bindings
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm install

# Copy source files
COPY . .

# Expose HTTP & WebSocket port
EXPOSE 5000

ENV PORT=5000
ENV NODE_ENV=production

# Start backend server
CMD ["npm", "start"]
