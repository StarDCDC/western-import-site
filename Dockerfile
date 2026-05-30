FROM node:22-slim

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install --production=false

COPY . .
RUN npx prisma generate
RUN npm run build
RUN chmod +x entrypoint.sh

EXPOSE 3000
ENV PORT=3000

CMD ["./entrypoint.sh"]
