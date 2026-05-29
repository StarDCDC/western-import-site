FROM node:22-slim

WORKDIR /app

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy everything first so postinstall (prisma generate) works
COPY . .

# Install dependencies (postinstall runs prisma generate)
RUN npm install

# Build Next.js
RUN npm run build

# Expose and start
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD npx prisma migrate deploy && npm start
