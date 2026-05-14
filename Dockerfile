FROM node:22-alpine AS base

# ติดตั้ง pnpm
RUN npm install -g pnpm@latest

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy ไฟล์ package
COPY package.json pnpm-lock.yaml* ./

# --- แก้ตาม Error: ใช้ชื่อ Flag ใหม่ที่ pnpm แนะนำ ---
RUN pnpm install --frozen-lockfile --dangerously-allow-all-builds

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# --- แก้ตาม Warning: ใช้รูปแบบ ENV key=value ---
ENV NEXT_TELEMETRY_DISABLED=1

# สร้าง Prisma Client
RUN npx prisma generate 

# สั่ง Build Next.js
RUN pnpm run build

FROM base AS runner
WORKDIR /app

# --- แก้ตาม Warning: ใช้รูปแบบ ENV key=value ---
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]