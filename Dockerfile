FROM node:12.6.0-buster-slim

RUN echo '#!/bin/bash\n~/bin/run "$@"' >> /usr/bin/azure-pipelines && \
    chmod +x /usr/bin/azure-pipelines

RUN useradd -m cli-runner
USER cli-runner
WORKDIR /home/cli-runner

COPY --chown=cli-runner ./package*.json .
COPY --chown=cli-runner ./yarn.lock .
RUN yarn

RUN mkdir src lib
COPY --chown=cli-runner . .



RUN yarn pack


