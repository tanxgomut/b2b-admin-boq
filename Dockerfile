FROM node:22-alpine AS base

# ติดตั้ง pnpm
RUN npm install -g pnpm@latest

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy ไฟล์ package
COPY package.json pnpm-lock.yaml* ./

# --- จุดสำคัญ: สั่ง pnpm ให้รัน build scripts โดยไม่ต้องถาม ---
RUN pnpm config set only-allow-builds true
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# ตั้งค่า ENV สำหรับการ Build
ENV NEXT_TELEMETRY_DISABLED 1

# รัน Prisma Generate (ตอนนี้มันจะยอมให้รันแล้ว)
RUN npx prisma generate 

RUN pnpm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]