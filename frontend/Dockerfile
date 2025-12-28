FROM node:18 AS build
WORKDIR /app
COPY package*.json ./

RUN npm i --legacy-peer-deps
COPY . .

RUN npm install -g vite
RUN vite build
