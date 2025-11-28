# Dockerfile для IT-Grads Frontend
FROM node:18-alpine AS builder

WORKDIR /app

# Копирование package.json
COPY package*.json ./

# Установка зависимостей
RUN npm ci

# Копирование кода и .env.production
COPY . .

# Установка переменных окружения для production сборки
ENV VITE_API_URL=/api
ENV VITE_DOMAIN=itgrads.ru

# Сборка production билда
RUN npm run build

# Production stage с Nginx
FROM nginx:alpine

# Копирование собранного приложения
COPY --from=builder /app/dist /usr/share/nginx/html

# Копирование конфигурации Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Открытие порта
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
