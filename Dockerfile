# เปลี่ยนจาก 18 เป็น 20
FROM node:20-alpine AS base

# ติดตั้ง pnpm
RUN npm install -g pnpm@latest 

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy ไฟล์ package
COPY package.json pnpm-lock.yaml* ./

# ติดตั้ง dependencies
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# ปิดการส่งข้อมูล telemetry และ Build
ENV NEXT_TELEMETRY_DISABLED 1

# ถ้ามีการใช้ Prisma ต้องรัน generate ก่อน build เสมอ
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