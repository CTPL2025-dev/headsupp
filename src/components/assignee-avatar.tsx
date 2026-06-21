import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn, initials } from "@/lib/utils"
import type { Profile } from "@/types"

export function AssigneeAvatar({
  profile,
  size = "default",
  className,
}: {
  profile: Profile | null | undefined
  size?: "sm" | "default" | "lg"
  className?: string
}) {
  return (
    <Avatar size={size} className={cn(className)} title={profile?.email ?? "Unassigned"}>
      <AvatarFallback>{profile ? initials(profile.email) : "?"}</AvatarFallback>
    </Avatar>
  )
}
