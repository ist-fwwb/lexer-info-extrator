FROM registry.cn-shenzhen.aliyuncs.com/docker_wizlah/nodejs
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .
EXPOSE 4000
CMD [ "npm", "start" ]