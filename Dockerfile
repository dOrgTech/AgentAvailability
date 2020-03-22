FROM keybaseio/client:nightly-node
WORKDIR /app
COPY . /app
RUN yarn install
CMD node /app/index.js
