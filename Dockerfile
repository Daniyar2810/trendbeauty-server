FROM ghcr.io/puppeteer/puppeteer:latest

# Uygulama klasörünü oluþtur
WORKDIR /usr/src/app

# Ýzinleri ayarla
USER root
CHOWN -R node:node /usr/src/app

# Package dosyalarýný kopyala
COPY package*.json ./

# Baðýmlýlýklarý kur
RUN npm install

# Tüm kodlarý kopyala
COPY . .

# Uygulamayý baþlat
CMD [ "node", "server.js" ]