"use client"

import { useEffect, useTransition, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import {
    Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetDescription
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff, KeyRound } from "lucide-react"
import { createUser, updateUser, changePassword } from "@/features/user/actions"
import type { UserRow } from "@/features/user/types"

type UserFormValues = { email: string; name: string; image: string; password: string; confirmPassword: string }
type PasswordFormValues = { password: string; confirmPassword: string }

type Props = {
    open: boolean
    onOpenChange: (open: boolean) => void
    user?: UserRow | null
    onSuccess: () => void
}

export function UserSheet({ open, onOpenChange, user, onSuccess }: Props) {
    const isEdit = !!user
    const [isPending, startTransition] = useTransition()
    const [showPass, setShowPass] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [showChangePass, setShowChangePass] = useState(false)

    const { register, handleSubmit, reset, formState: { errors } } = useForm<UserFormValues>({
        defaultValues: { email: "", name: "", image: "", password: "", confirmPassword: "" },
    })

    const passForm = useForm<PasswordFormValues>({
        defaultValues: { password: "", confirmPassword: "" },
    })

    useEffect(() => {
        if (open) {
            reset(user ? { email: user.email, name: user.name ?? "", image: user.image ?? "", password: "", confirmPassword: "" } : { email: "", name: "", image: "", password: "", confirmPassword: "" })
            setShowChangePass(false)
            passForm.reset()
        }
    }, [open, user, reset, passForm])

    const onSubmit = (data: UserFormValues) => {
        startTransition(async () => {
            const fd = new FormData()
            fd.append("email", data.email)
            fd.append("name", data.name)
            fd.append("image", data.image)
            if (!isEdit) {
                fd.append("password", data.password)
                fd.append("confirmPassword", data.confirmPassword)
            }
            const result = isEdit ? await updateUser(user!.id, fd) : await createUser(fd)
            if (result.success) {
                toast.success(isEdit ? "อัปเดตผู้ใช้สำเร็จ" : "สร้างผู้ใช้สำเร็จ")
                onOpenChange(false)
                onSuccess()
            } else {
                toast.error(result.error)
            }
        })
    }

    const onChangePassword = (data: PasswordFormValues) => {
        if (!user) return
        startTransition(async () => {
            const fd = new FormData()
            fd.append("password", data.password)
            fd.append("confirmPassword", data.confirmPassword)
            const result = await changePassword(user.id, fd)
            if (result.success) {
                toast.success("เปลี่ยนรหัสผ่านสำเร็จ")
                setShowChangePass(false)
                passForm.reset()
            } else {
                toast.error(result.error)
            }
        })
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-md overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>{isEdit ? "แก้ไขผู้ใช้" : "สร้างผู้ใช้ใหม่"}</SheetTitle>
                    <SheetDescription>
                        {isEdit ? `แก้ไขข้อมูล ${user?.email}` : "กรอกข้อมูลผู้ใช้ใหม่"}
                    </SheetDescription>
                </SheetHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-4 py-4">
                    <div className="space-y-1">
                        <Label htmlFor="user-email">อีเมล</Label>
                        <Input id="user-email" type="email" placeholder="email@example.com"
                            {...register("email", { required: "กรุณาระบุอีเมล" })} />
                        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="user-name">ชื่อ (optional)</Label>
                        <Input id="user-name" placeholder="ชื่อ-นามสกุล" {...register("name")} />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="user-image">รูปโปรไฟล์ URL (optional)</Label>
                        <Input id="user-image" placeholder="https://..." {...register("image")} />
                    </div>

                    {!isEdit && (
                        <>
                            <Separator />
                            <div className="space-y-1">
                                <Label htmlFor="user-pass">รหัสผ่าน</Label>
                                <div className="relative">
                                    <Input id="user-pass" type={showPass ? "text" : "password"} placeholder="อย่างน้อย 8 ตัวอักษร"
                                        {...register("password", { required: "กรุณาตั้งรหัสผ่าน", minLength: { value: 8, message: "ต้องมีอย่างน้อย 8 ตัวอักษร" } })} />
                                    <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1 h-7 w-7" onClick={() => setShowPass(!showPass)}>
                                        {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                                {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="user-confirm">ยืนยันรหัสผ่าน</Label>
                                <div className="relative">
                                    <Input id="user-confirm" type={showConfirm ? "text" : "password"} placeholder="กรอกรหัสผ่านอีกครั้ง"
                                        {...register("confirmPassword", { required: "กรุณายืนยันรหัสผ่าน" })} />
                                    <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1 h-7 w-7" onClick={() => setShowConfirm(!showConfirm)}>
                                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                </div>
                                {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
                            </div>
                        </>
                    )}

                    <SheetFooter className="pt-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>ยกเลิก</Button>
                        <Button type="submit" disabled={isPending}>{isPending ? "กำลังบันทึก..." : "บันทึก"}</Button>
                    </SheetFooter>
                </form>

                {/* Change Password section (edit mode) */}
                {isEdit && (
                    <>
                        <Separator className="mx-4" />
                        <div className="px-4 py-4 space-y-3">
                            <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => setShowChangePass(!showChangePass)}>
                                <KeyRound className="h-4 w-4" />
                                {showChangePass ? "ซ่อน" : "เปลี่ยนรหัสผ่าน"}
                            </Button>
                            {showChangePass && (
                                <form onSubmit={passForm.handleSubmit(onChangePassword)} className="space-y-3">
                                    <div className="space-y-1">
                                        <Label>รหัสผ่านใหม่</Label>
                                        <Input type="password" placeholder="อย่างน้อย 8 ตัวอักษร"
                                            {...passForm.register("password", { required: true, minLength: 8 })} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label>ยืนยันรหัสผ่านใหม่</Label>
                                        <Input type="password" placeholder="กรอกอีกครั้ง"
                                            {...passForm.register("confirmPassword", { required: true })} />
                                        {passForm.formState.errors.confirmPassword && <p className="text-sm text-destructive">กรุณายืนยันรหัสผ่าน</p>}
                                    </div>
                                    <Button type="submit" size="sm" className="w-full" disabled={isPending}>
                                        {isPending ? "กำลังเปลี่ยน..." : "บันทึกรหัสผ่านใหม่"}
                                    </Button>
                                </form>
                            )}
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    )
}
