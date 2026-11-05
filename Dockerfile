# Render / Docker build for Kodex.sbs
FROM node:20.15.1

WORKDIR /app

ENV HOST=0.0.0.0
ENV NODE_ENV=production

RUN npm install -g pnpm@9.4.0

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build

EXPOSE 3000

CMD ["pnpm", "run", "start"]
