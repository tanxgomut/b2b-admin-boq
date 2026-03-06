import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { cache } from "react"

export const getUserLoginData = cache(async (email: string, password?: string) => {
    const user = await prisma.user.findUnique({
        where: { email },
        include: {
            credentials: true,
            orgs: {
                include: {
                    org: true,
                    role: {
                        include: {
                            permissions: {
                                include: {
                                    permission: true
                                }
                            }
                        }
                    },
                }
            },
            teams: {
                include: {
                    team: true,
                    role: {
                        include: {
                            permissions: {
                                include: {
                                    permission: true
                                }
                            }
                        }
                    },
                }
            }
        }
    })

    if (password && user && user.credentials) {
        const passwordsMatch = await bcrypt.compare(password, user.credentials.password)
        if (!passwordsMatch) return null
    }

    return user
})