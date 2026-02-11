# Dockerfile for Clara Dashboard
FROM node:20-alpine

WORKDIR /app

# Copy server package files
COPY server/package*.json ./
RUN npm install

# Copy server source
COPY server/ ./

# Create client dist directory (static files will be served from here)
RUN mkdir -p /app/client/dist

# Copy pre-built client files if they exist
COPY client/dist/ /app/client/dist/ 2>/dev/null || true

# Create backup volume mount point
RUN mkdir -p /backups

# Expose port
EXPOSE 3000

# Environment
ENV NODE_ENV=production
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget -q -O- http://localhost:3000/api/health || exit 1

# Start the server
CMD ["node", "index.js"]
