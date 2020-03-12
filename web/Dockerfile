FROM node:8
WORKDIR /web
COPY package*.json ./
RUN npm update && npm install -g typescript@next && npm install --save underscore && npm install --save @types/underscore && npm install 
COPY . /web

