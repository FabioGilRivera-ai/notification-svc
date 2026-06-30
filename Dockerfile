FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --silent
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev --silent
COPY --from=builder /app/dist ./dist
EXPOSE 8082
HEALTHCHECK --interval=15s --timeout=5s CMD wget -qO- http://localhost:8082/health || exit 1
CMD ["node", "dist/server.js"]
