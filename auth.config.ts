import type { NextAuthConfig } from "next-auth"

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: "jwt",
        maxAge: 10 * 60,
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user
            const pathname = nextUrl.pathname

            if (auth?.expires && new Date(auth.expires) < new Date()) {
                return false // Force logout
            }

            // Public paths - ไม่ต้อง login
            const isPublicPath = pathname === '/login' ||
                pathname.startsWith('/api/auth')

            if (isPublicPath) {
                // ถ้า login แล้วและอยู่หน้า login → redirect ไป dashboard
                if (isLoggedIn && pathname === '/login') {
                    const org = auth?.user?.orgs?.[0]?.org?.name

                    return Response.redirect(new URL(`/${org}/dashboard`, nextUrl))
                }
                return true
            }

            // ถ้าไม่ใช่หน้า public และยังไม่ login → redirect ไป /login
            if (!isLoggedIn) {
                return Response.redirect(new URL('/login', nextUrl))
            }

            // ทุกหน้าอื่นๆ ต้อง login
            return isLoggedIn
        },
        async jwt({ token, user }) {
            if (user) {
                // Slim down เพื่อป้องกัน JWT cookie เกิน 4KB
                // เก็บเฉพาะ org.name, role.name และ permission keys (string)
                token.orgs = (user.orgs as any[])?.map((o) => ({
                    org: { id: o.org.id, name: o.org.name },
                    role: o.role ? {
                        id: o.role.id,
                        name: o.role.name,
                        permissions: (o.role.permissions ?? []).map((p: any) => ({
                            permission: { key: p.permission.key }
                        }))
                    } : null
                })) ?? []

                token.teams = (user.teams as any[])?.map((t) => ({
                    team: { id: t.team.id, name: t.team.name },
                    role: t.role ? {
                        id: t.role.id,
                        name: t.role.name,
                        permissions: (t.role.permissions ?? []).map((p: any) => ({
                            permission: { key: p.permission.key }
                        }))
                    } : null
                })) ?? []
            }
            return token
        },
        async session({ session, token }) {
            if (token.orgs) {
                session.user.orgs = token.orgs as any
            }
            if (token.teams) {
                session.user.teams = token.teams as any
            }
            return session
        }
    },
    providers: [],
} satisfies NextAuthConfig