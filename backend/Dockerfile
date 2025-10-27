# === Build stage ===
FROM node:20-alpine AS build

# Director de lucru
WORKDIR /app

# Copiem package.json și package-lock.json
COPY package*.json ./

# Instalăm toate dependențele
RUN npm install

# Copiem restul codului sursă
COPY . .

# Build TypeScript → JS în /dist
RUN npm run build

# === Runtime stage (pentru dev cu hot reload) ===
FROM node:20-alpine AS runtime

WORKDIR /app

# Copiem build-ul și package.json
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./

# Instalăm doar dependențele de producție
RUN npm install --production

# Instalăm Nest CLI global pentru start:dev
RUN npm install -g @nestjs/cli

# Expunem portul NestJS
EXPOSE 3000

# Comandă pentru dezvoltare (hot reload)
CMD ["nest", "start", "--watch"]
