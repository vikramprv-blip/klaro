FROM node:20-alpine

RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
COPY patch-voyageai.js ./

RUN npm install

RUN npm install voyageai@latest

RUN node patch-voyageai.js

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
