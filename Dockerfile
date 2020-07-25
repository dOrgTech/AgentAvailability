FROM keybaseio/client:nightly-node

## Install NVM
RUN rm /bin/sh && ln -s /bin/bash /bin/sh
RUN echo 'debconf debconf/frontend select Noninteractive' | debconf-set-selections
RUN apt-get update && apt-get install -y -q --no-install-recommends \
        apt-transport-https \
        build-essential \
        ca-certificates \
        curl \
        git \
        libssl-dev \
        wget \
    && rm -rf /var/lib/apt/lists/*
ENV NVM_DIR /root/.nvm
ENV NODE_VERSION 10.16.3
RUN curl https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh| bash \
    && . $NVM_DIR/nvm.sh \
    && nvm install $NODE_VERSION \
    && nvm alias default $NODE_VERSION \
    && nvm use default
ENV NODE_PATH $NVM_DIR/v$NODE_VERSION/lib/node_modules
ENV PATH      $NVM_DIR/v$NODE_VERSION/bin:$PATH

## Setup Keybase bot
RUN mkdir /app && chown keybase:keybase /app
WORKDIR /app
COPY . .
COPY src/.env src/.env
RUN yarn install --production=false
RUN npx tsc --project tsconfig.json
CMD node src/output/src/index.js