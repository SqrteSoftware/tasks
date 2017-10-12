FROM alpine:3.6

RUN apk update && \
    apk add wget ca-certificates nodejs nodejs-npm

RUN npm install -g create-react-app

ADD . /src

WORKDIR /src