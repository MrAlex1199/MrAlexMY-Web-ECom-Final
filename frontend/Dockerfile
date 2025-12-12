FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build React app for production
RUN npm run build

EXPOSE 3000

# Use our custom server to serve the build
CMD ["node", "server.js"]
