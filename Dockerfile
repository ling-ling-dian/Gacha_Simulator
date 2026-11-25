FROM node:24-bookworm-slim
RUN apt-get update && apt-get install -y default-mysql-client && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["sh", "-c", "node node_modules/tsx/dist/cli.mjs sql/seed.ts && npm start"]
