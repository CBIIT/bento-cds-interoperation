# Build stage: compile OpenSSL 3.6.1 from source
FROM node:25.3.0-alpine3.22 AS openssl-builder
RUN apk add --no-cache build-base linux-headers perl wget
WORKDIR /tmp
RUN wget https://github.com/openssl/openssl/releases/download/openssl-3.6.1/openssl-3.6.1.tar.gz && \
    tar -xzf openssl-3.6.1.tar.gz && \
    cd openssl-3.6.1 && \
    ./Configure --prefix=/usr --openssldir=/etc/ssl --libdir=lib no-tests && \
    make -j$(nproc) && \
    make install DESTDIR=/openssl-install

# Final stage
FROM node:25.3.0-alpine3.22 AS fnl_base_image
ENV PORT 4030
ENV NODE_ENV production
WORKDIR /usr/src/app

# Remove existing OpenSSL and copy compiled OpenSSL 3.6.1
RUN apk del openssl libssl3 libcrypto3 2>/dev/null || true
COPY --from=openssl-builder /openssl-install/usr/lib/libssl.so* /usr/lib/
COPY --from=openssl-builder /openssl-install/usr/lib/libcrypto.so* /usr/lib/
COPY --from=openssl-builder /openssl-install/usr/bin/openssl /usr/bin/
COPY --from=openssl-builder /openssl-install/etc/ssl /etc/ssl
COPY --from=openssl-builder /openssl-install/usr/include/openssl /usr/include/openssl

# Update other packages (but not OpenSSL) and remove gnupg (CVE-2026-24882 has no fix)
RUN apk update && apk upgrade --no-cache --ignore openssl --ignore libssl3 --ignore libcrypto3 && \
    apk del gnupg 2>/dev/null || true

RUN npm install -g npm@11.7.0
RUN rm -rf /usr/local/lib/node_modules/npm/node_modules/cross-spawn
COPY package*.json ./
#RUN npm ci --only=production
RUN npm install --omit=dev \
  && npm cache clean --force \
  && rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx
COPY  --chown=node:node . .
EXPOSE 4030
CMD [ "node", "./bin/www" ]
