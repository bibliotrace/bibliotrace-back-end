FROM node:22

WORKDIR /usr/app

COPY package*.json tsconfig*.json ./
COPY src ./src

RUN npm ci
RUN npm run compile

ENV NODE_ENV='production'
EXPOSE 8080

CMD ["node", "dist/index.js"]
