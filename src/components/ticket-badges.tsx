import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import type { TicketPriority, TicketSeverity, TicketStatus } from "@/types"

const STATUS_LABEL: Record<TicketStatus, string> = {
  new: "New",
  triaged: "Triaged",
  in_progress: "In Progress",
  in_review: "In Review",
  done: "Done",
  wontfix: "Won't Fix",
}

const STATUS_CLASS: Record<TicketStatus, string> = {
  new: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  triaged: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  in_progress: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  in_review: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
  done: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  wontfix: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400",
}

export function StatusBadge({ status, className }: { status: TicketStatus; className?: string }) {
  return (
    <Badge variant="ghost" className={cn(STATUS_CLASS[status], className)}>
      {STATUS_LABEL[status]}
    </Badge>
  )
}

const SEVERITY_LABEL: Record<TicketSeverity, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
}

const SEVERITY_CLASS: Record<TicketSeverity, string> = {
  low: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
  medium: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  high: "bg-red-500/10 text-red-600 dark:text-red-400",
}

export function SeverityBadge({
  severity,
  className,
}: {
  severity: TicketSeverity
  className?: string
}) {
  return (
    <Badge variant="ghost" className={cn(SEVERITY_CLASS[severity], className)}>
      {SEVERITY_LABEL[severity]}
    </Badge>
  )
}

const PRIORITY_LABEL: Record<TicketPriority, string> = {
  p0: "P0",
  p1: "P1",
  p2: "P2",
  p3: "P3",
}

const PRIORITY_CLASS: Record<TicketPriority, string> = {
  p0: "bg-red-500/10 text-red-600 dark:text-red-400",
  p1: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  p2: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  p3: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
}

export function PriorityBadge({
  priority,
  className,
}: {
  priority: TicketPriority | null
  className?: string
}) {
  if (!priority) {
    return (
      <Badge variant="outline" className={cn("text-muted-foreground", className)}>
        No priority
      </Badge>
    )
  }
  return (
    <Badge variant="ghost" className={cn(PRIORITY_CLASS[priority], className)}>
      {PRIORITY_LABEL[priority]}
    </Badge>
  )
}

export function CategoryBadge({ category, className }: { category: string; className?: string }) {
  return (
    <Badge variant="outline" className={className}>
      {category}
    </Badge>
  )
}

export { STATUS_LABEL }
