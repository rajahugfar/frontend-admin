# Build stage
FROM node:20-alpine AS builder

# Build arguments for environment variables
ARG VITE_API_URL=https://api.bicycle789.com
ARG VITE_API_BASE_PATH=/api/v1

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Set environment variables for build
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_API_BASE_PATH=$VITE_API_BASE_PATH

# Build for production
RUN npm run build

# Runtime stage - Nginx
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
