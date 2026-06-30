FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --silent
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 8082
HEALTHCHECK --interval=15s --timeout=5s CMD wget -qO- http://localhost:8082/health || exit 1
CMD ["node", "dist/server.js"]
