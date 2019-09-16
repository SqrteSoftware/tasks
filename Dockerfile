############################################################
# Build the base container used for other stages
############################################################
FROM alpine:3.9 as base

RUN apk update && \
    apk add \
        wget \
        ca-certificates \
        nodejs \
        nodejs-npm \
        bash

WORKDIR /tasks/app


############################################################
# The develop stage is used to run the app duing development
############################################################
FROM base as develop

# Only run npm install if package.json has changed
ADD ./package.json /tasks/app
RUN npm install

# Add the rest of the source
ADD . /tasks/app

ENTRYPOINT "./entrypoint.sh"


############################################################
# The deploy stage is used to deploy the app to S3
############################################################
FROM base as deploy

RUN apk update && \
    apk add \
    groff \
    less \
    python3 \
    py-pip

RUN pip install awscli
