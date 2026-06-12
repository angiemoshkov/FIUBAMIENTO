FROM node:24

WORKDIR /app

COPY app/package*.json ./

RUN npm install

COPY app .

CMD ["node", "app.js"]