import { Skeleton } from "@/components/ui/skeleton"

export default function ThemeSkeleton() {
    return (
        <div className="flex flex-1 flex-col gap-4 pt-0">
            <div className="hidden sm:grid auto-rows-min gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                <Skeleton className="aspect-square sm:aspect-video rounded-xl " />
                <Skeleton className="aspect-square sm:aspect-video rounded-xl " />
                <Skeleton className="aspect-square sm:aspect-video rounded-xl " />
            </div>
            <Skeleton className="flex-1 rounded-xl min-h-min" />
        </div>
    )
}
