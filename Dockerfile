# Use Node.js LTS base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy project files
COPY . .

# Expose frontend and backend ports
EXPOSE 5173
EXPOSE 3000

# Start both frontend (Vite) and backend (Express)
CMD ["npm", "run", "dev:all"]
