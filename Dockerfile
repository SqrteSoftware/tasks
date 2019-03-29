FROM alpine:3.9

RUN apk update && \
    apk add \
        wget \
        ca-certificates \
        nodejs \
        nodejs-npm \
        bash

WORKDIR /braindump/app

# Only run npm install if package.json has changed
ADD ./package.json /braindump/app
RUN npm install

# Add the rest of the source
ADD . /braindump/app

ENTRYPOINT "./entrypoint.sh"