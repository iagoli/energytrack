FROM node:20-alpine

WORKDIR /app

# Toolchain para compilar bindings nativas (bcrypt). Em Alpine não há prebuilts.
RUN apk add --no-cache python3 make g++ libc6-compat

COPY package*.json ./
RUN npm install --no-audit --no-fund

COPY . .

# 5173 = Vite dev | 3001 = Express API
EXPOSE 3001 5173

CMD ["node", "server/index.js"]
