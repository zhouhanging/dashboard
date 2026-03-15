FROM node:18

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm install

COPY . .

RUN mkdir -p uploads

EXPOSE 8080

CMD ["node", "src/app.js"]