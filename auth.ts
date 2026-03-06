import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { authConfig } from "@/auth.config"
import { getUserLoginData } from "./features/auth/queries"

export const { auth, signIn, signOut, handlers } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            async authorize(credentials) {
                const { email, password } = credentials as { email: string; password: string }

                const user = await getUserLoginData(email, password)

                if (!user) return null

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    image: user.image,
                    orgs: user.orgs,
                    teams: user.teams
                }
            },
        }),
    ],

})