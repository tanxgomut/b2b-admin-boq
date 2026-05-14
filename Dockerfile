# 1. ขยับมาใช้ Node 22 (LTS) เพื่อรองรับ pnpm รุ่นล่าสุด
FROM node:22-alpine AS base

# ติดตั้ง pnpm รุ่นล่าสุด
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

# ปิด Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED 1

# สร้าง Prisma Client ให้ตรงกับ Alpine Linux
RUN npx prisma generate 

# สั่ง Build Next.js
RUN pnpm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# ดึงไฟล์จาก stage builder มาเฉพาะที่จำเป็น
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]