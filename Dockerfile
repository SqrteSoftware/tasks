FROM alpine:3.6

RUN apk update && \
    apk add \
        wget \
        ca-certificates \
        nodejs \
        nodejs-npm \
        bash

WORKDIR /src

# Only run npm install if package.json has changed
ADD ./package.json /src/
RUN npm install

# Add the rest of the source
ADD . /src

ENTRYPOINT "/src/entrypoint.sh"