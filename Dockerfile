FROM alpine:3.6

RUN apk update && \
    apk add \
        wget \
        ca-certificates \
        nodejs \
        nodejs-npm \
        bash

ADD . /src

WORKDIR /src

RUN npm install