FROM registry.cn-shenzhen.aliyuncs.com/pipipan/node:1.0
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .
EXPOSE 4000
CMD [ "npm", "start" ]