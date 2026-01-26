# Node.js පාවිච්චි කරමු
FROM node:18-slim

# WhatsApp එකට අවශ්‍ය කරන Chromium සහ dependencies install කිරීම
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-ipafont-gothic \
    fonts-wqy-zenhei \
    fonts-thai-tlwg \
    fonts-kacst \
    fonts-freefont-ttf \
    libxss1 \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Bot එකේ වැඩ කරන Folder එක
WORKDIR /usr/src/app

# Files copy කරගෙන install කිරීම
COPY package*.json ./
RUN npm install --production

COPY . .

# Chromium එක වැඩ කරන පාර පෙන්වීම
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Bot එක පණගැන්වීම
CMD ["node", "index.js"]
