#ARG ECR_REPO
#FROM ${ECR_REPO}/base-images:20.11.1

# Stage 1: Build OpenSSL 3.5.4 from source
FROM alpine:3.20 AS openssl-builder

# Install build dependencies (disable SSL verification temporarily)
RUN apk add --no-cache --allow-untrusted \
    build-base \
    perl \
    linux-headers \
    wget \
    ca-certificates \
    zlib-dev || \
    # Fallback: use http instead of https for package repos
    (sed -i 's/https:/http:/g' /etc/apk/repositories && \
     apk update && \
     apk add --no-cache \
         build-base \
         perl \
         linux-headers \
         wget \
         ca-certificates \
         zlib-dev)

# Download and compile OpenSSL 3.5.4
RUN cd /tmp && \
    # Try HTTPS first, fallback to HTTP if SSL verification fails
    (wget --no-check-certificate https://github.com/openssl/openssl/releases/download/openssl-3.5.4/openssl-3.5.4.tar.gz || \
     wget http://github.com/openssl/openssl/releases/download/openssl-3.5.4/openssl-3.5.4.tar.gz || \
     wget --no-check-certificate https://www.openssl.org/source/openssl-3.5.4.tar.gz) && \
    tar -xzf openssl-3.5.4.tar.gz && \
    cd openssl-3.5.4 && \
    ./config --prefix=/usr/local/openssl --openssldir=/usr/local/openssl/ssl shared zlib && \
    make -j$(nproc) && \
    make install

# Stage 2: Final runtime image with Node.js 24.4.1+ and OpenSSL 3.5.4
FROM node:24-alpine3.20 AS fnl_base_image

# Copy the compiled OpenSSL 3.5.4 from builder stage
COPY --from=openssl-builder /usr/local/openssl /usr/local/openssl

# Update library paths to use the new OpenSSL
ENV LD_LIBRARY_PATH="/usr/local/openssl/lib:/usr/local/openssl/lib64"
ENV PATH="/usr/local/openssl/bin:${PATH}"
ENV PKG_CONFIG_PATH="/usr/local/openssl/lib/pkgconfig"

# Update system packages and ensure our OpenSSL is preferred
RUN ln -sf /usr/local/openssl/bin/openssl /usr/bin/openssl && \
    ln -sf /usr/local/openssl/lib/libssl.so.3 /usr/lib/libssl.so.3 && \
    ln -sf /usr/local/openssl/lib/libcrypto.so.3 /usr/lib/libcrypto.so.3 && \
    # Update library cache
    echo "/usr/local/openssl/lib" > /etc/ld-musl-x86_64.path

ENV PORT=4030
ENV NODE_ENV=production
WORKDIR /usr/src/app

# Verify OpenSSL version (should show 3.5.4)
RUN /usr/local/openssl/bin/openssl version

# Remove vulnerable cross-spawn
RUN rm -rf /usr/local/lib/node_modules/npm/node_modules/cross-spawn || true
COPY package*.json ./
#RUN npm ci --only=production
RUN npm install
COPY  --chown=node:node . .
EXPOSE 4030
CMD [ "node", "./bin/www" ]
