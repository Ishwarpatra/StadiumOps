# --- Stage 1: Build Stage ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency specifications
COPY package.json ./

# Install development dependencies
RUN npm install

# Copy application source code
COPY . .

# Run build to compile the client-side files and bundle the Express server (dist/server.cjs)
RUN npm run build

# --- Stage 2: Runtime Stage ---
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment flags
ENV NODE_ENV=production
ENV PORT=3000

# Copy package descriptors
COPY package.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy compiled build artifacts from builder stage
COPY --from=builder /app/dist ./dist

# Expose port 3000 (standard reverse proxy port for container ingress)
EXPOSE 3000

# Start production server
CMD ["npm", "run", "start"]
