FROM node AS builder
WORKDIR /app

# Do `npm i` or other node related stuffs so that we can copy them to `runner` image
# copy just package*.json stuff, for better caching since it doesnt change often
COPY package.json package-lock.json  ./

# Choose one of the below to install npm dependencies
RUN npm ci --omit=dev # install without `devDependencies` usually for `prod`
COPY . /app

# Copy source code and build

FROM gcr.io/distroless/nodejs18-debian12
WORKDIR /app
COPY --from=builder /app /app
EXPOSE 9871
CMD [ "server.js" ]