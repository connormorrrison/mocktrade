import { Skeleton } from "@/components/ui/skeleton"

export function CustomSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 rounded-full w-[250px]" />
          <Skeleton className="h-4 rounded-full w-[200px]" />
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 rounded-full w-[250px]" />
          <Skeleton className="h-4 rounded-full w-[200px]" />
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 rounded-full w-[250px]" />
          <Skeleton className="h-4 rounded-full w-[200px]" />
        </div>
      </div>
    </div>
  )
}