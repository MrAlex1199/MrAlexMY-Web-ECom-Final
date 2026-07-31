# Stage 1: Build React Frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
ENV REACT_APP_API_URL=""
RUN npm run build

# Stage 2: Production Backend + Frontend
FROM node:18-alpine
WORKDIR /app

# Install build tools for native modules (bcrypt)
RUN apk add --no-cache python3 make g++

# Install backend dependencies
COPY backend/package*.json ./
RUN npm ci --only=production
RUN apk del python3 make g++

# Copy backend source
COPY backend/ ./

# Copy frontend build from Stage 1
COPY --from=frontend-build /app/frontend/build ./frontend/build

# Set production environment
ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

# Use node directly instead of nodemon for production
CMD ["node", "server/server.js"]
