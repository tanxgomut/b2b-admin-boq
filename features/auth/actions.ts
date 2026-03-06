'use server'

import { signIn, auth } from "@/auth"
import { loginSchema, LoginInput } from "./schemas"
import { AuthError } from "next-auth"
import { getUserLoginData } from "./queries"

export async function login(data: LoginInput) {
    const validated = loginSchema.safeParse(data)
    if (!validated.success) {
        return { error: "ข้อมูลไม่ถูกต้อง" }
    }
    const { email, password } = validated.data

    const user = await getUserLoginData(email, password)

    if (!user) {
        return { error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" }
    }

    try {
        await signIn("credentials", {
            email,
            password,
            redirect: false,
        })

        const firstOrg = user.orgs?.[0]
        const orgId = firstOrg?.org?.slug || firstOrg?.orgId
        const orgName = firstOrg?.org?.name || firstOrg?.org?.slug

        return {
            success: true,
            user: { org: { name: orgName, orgId } } // ส่ง structure ให้ตรงกับที่ client ใช้
        }
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return { error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" }
                default:
                    return { error: "เกิดข้อผิดพลาดบางอย่าง" }
            }
        }
        throw error
    }
}