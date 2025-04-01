FROM node:22

ARG DB_USER
ARG DB_PASSWORD
ARG DB_HOST
ARG DB_TARGET_NAME

ENV DB_USER=$DB_USER
ENV DB_PASSWORD=$DB_PASSWORD
ENV DB_HOST=$DB_HOST
ENV DB_TARGET_NAME=$DB_TARGET_NAME

WORKDIR /usr/app

COPY package*.json tsconfig*.json ./
COPY src ./src

RUN npm ci
RUN npm run compile

ENV NODE_ENV='production'
EXPOSE 8080

CMD ["node", "dist/index.js"]
