FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache build-base python3
COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

RUN npm rebuild bcrypt --build-from-source

EXPOSE 3000

CMD ["npm", "run", "start:prod"]

