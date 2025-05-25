FROM node:lts
WORKDIR /app
COPY . .
RUN cd backend && npm install
RUN cd frontend && npm install --include=dev && npm run build
CMD node backend/server/index.js
