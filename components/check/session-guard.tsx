'use client'
import { useSession } from 'next-auth/react'
import { useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export function SessionGuard({ children }: { children: React.ReactNode }) {
    const { status } = useSession()
    const router = useRouter()
    const pathname = usePathname()
    const hasChecked = useRef(false)
    const publicPaths = ['/login']

    useEffect(() => {
        // ถ้า session หมดอายุ และอยู่ในหน้า protected
        // และไม่ใช่การโหลดครั้งแรก

        if (status === 'unauthenticated' && !publicPaths.includes(pathname)) {
            if (hasChecked.current) {
                // เฉพาะเมื่อ session หมดอายุหลังจากที่เคย authenticated แล้ว
                router.push('/login')
            }
        }
        if (status === 'authenticated') {
            hasChecked.current = true
        }
    }, [status, pathname, router])

    // ถ้ากำลังโหลด session
    if (status === 'loading') {
        return null
    }

    return <>{children}</>
}