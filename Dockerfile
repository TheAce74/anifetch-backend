FROM ghcr.io/puppeteer/puppeteer:24.3.1

ENV PUPPETEER_SKIP_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /usr/src/app

COPY package.json pnpm-lock.yaml ./
RUN pnpm ci
COPY . .
CMD ["pnpm", "start"]