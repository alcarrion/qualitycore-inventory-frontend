# --- Build
FROM node:18-alpine AS build
WORKDIR /app

# Instalar deps con lockfile
COPY package*.json ./
RUN npm ci

# Copiar el resto
COPY . .

# <-- IMPORTANTE: API URL en build-time
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Construir
RUN npm run build

# --- Runtime
FROM node:18-alpine
WORKDIR /app
RUN npm i -g serve

# Copiar estáticos ya compilados
COPY --from=build /app/build ./build

# Railway asigna un puerto dinámico
ENV PORT=3000
EXPOSE 3000

# SPA fallback
CMD ["sh", "-c", "serve -s build -l ${PORT}"]
