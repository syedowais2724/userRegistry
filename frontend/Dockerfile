# Stage 1: Build React application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package configurations
COPY package.json package-lock.json* ./
RUN npm install

# Copy source code
COPY . .

# Set dynamic API URL argument
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build the bundle
RUN npm run build

# Stage 2: Serve using Nginx
FROM nginx:1.25-alpine

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
