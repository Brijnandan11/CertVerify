FROM node:20-alpine AS backend-build
WORKDIR /app
COPY backend/package.json backend/package-lock.json ./
RUN npm ci
COPY backend/ ./
RUN npm run build

FROM node:20-alpine AS frontend-build
WORKDIR /frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV FRONTEND_DIST_PATH=/app/public
COPY --from=backend-build /app/package.json ./
COPY --from=backend-build /app/node_modules ./node_modules
COPY --from=backend-build /app/dist ./dist
# .sql migrations aren't compiled to dist — copy them so auto-migration on boot works
COPY --from=backend-build /app/src/db/migrations ./dist/db/migrations
COPY --from=frontend-build /frontend/dist ./public
EXPOSE 4000
CMD ["node", "dist/server.js"]
