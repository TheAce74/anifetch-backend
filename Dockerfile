FROM ghcr.io/puppeteer/puppeteer:24.3.1

# Set environment variables
ENV PUPPETEER_SKIP_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# Use a user-writable directory for global npm installs
ENV NPM_CONFIG_PREFIX=/home/pptruser/.npm-global
ENV PATH=$NPM_CONFIG_PREFIX/bin:$PATH

# Install pnpm as the non-root user
USER pptruser
RUN npm install -g pnpm

# Set working directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package.json pnpm-lock.yaml tsconfig.json ./
RUN pnpm install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Compile TypeScript before running
RUN pnpm build  # Ensure TypeScript compiles

# Start the application
CMD ["pnpm", "start"]
