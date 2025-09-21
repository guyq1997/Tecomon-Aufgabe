FROM node:18-alpine AS base
WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

COPY src ./src

ENV NODE_ENV=production
ENV PORT=5050
EXPOSE 5050

CMD ["node", "src/server.js"]


