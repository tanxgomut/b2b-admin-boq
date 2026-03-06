// app/not-found.tsx
import Link from "next/link"
import { Button } from "@/components/ui/button" // ใช้ Button ของ shadcn

export default function NotFound() {
    return (
        <div className="flex h-screen flex-col items-center justify-center space-y-4">
            <h2 className="text-4xl font-bold">404 - Not Found</h2>
            <p className="text-muted-foreground">
                ไม่พบหน้าที่คุณกำลังค้นหา หรือคุณอาจไม่มีสิทธิ์เข้าถึง
            </p>
            <Button asChild>
                <Link href="/">กลับสู่หน้าหลัก</Link>
            </Button>
        </div>
    )
}