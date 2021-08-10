FROM node:14-alpine
ENV NODE_ENV=dev \
    env=dev \
    port=3000
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "index.js"]
