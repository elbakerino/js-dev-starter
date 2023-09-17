FROM node:18-alpine

RUN mkdir /home/node/app/ && \
    mkdir /home/node/app/node_modules && \
    chown -R node:node /home/node/app && \
    mkdir /home/node/shared-data/ && \
    chown -R node:node /home/node/shared-data && \
    mkdir /home/node/.npm && \
    chown -R node:node /home/node/.npm && \
    chown -R node:node /usr/local/lib/node_modules

WORKDIR /home/node/app

RUN npm i -g nodemon

USER node

ENV NODE_OPTIONS="--experimental-vm-modules --experimental-fetch --unhandled-rejections=strict --no-deprecation"

# todo: check why since ~2022-11-01 polling is required again on windows, even without WSL2,
#       seems to come as soon as two container use e.g. `_npm`/app-build volume concurrently
CMD [ "nodemon", "--legacy-watch", "server.js"]
