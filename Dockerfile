FROM node:18-alpine AS base

# ติดตั้ง pnpm ทั่วโลกใน container
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy เฉพาะไฟล์ที่ใช้ลงทะเบียน package
COPY package.json pnpm-lock.yaml* ./

# ติดตั้ง dependencies (ใช้ --frozen-lockfile เพื่อความแม่นยำ)
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# ปิดการส่งข้อมูล telemetry ของ Next.js และสั่ง Build
ENV NEXT_TELEMETRY_DISABLED 1
RUN pnpm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy ไฟล์ที่จำเป็นจาก stage builder (ใช้ standalone mode เพื่อลดขนาด)
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]