import type * as React from "react"
import { IconPhoto } from "@tabler/icons-react"

import { Card } from "@/components/ui/card"
import { AssigneeAvatar } from "@/components/assignee-avatar"
import { CategoryBadge, PriorityBadge, SeverityBadge } from "@/components/ticket-badges"
import { formatRelativeTime, titleFromTicket } from "@/lib/utils"
import type { Ticket } from "@/types"

export function TicketCard({
  ticket,
  draggable,
  onDragStart,
  onClick,
}: {
  ticket: Ticket
  draggable?: boolean
  onDragStart?: (event: React.DragEvent<HTMLDivElement>) => void
  onClick?: () => void
}) {
  return (
    <Card
      draggable={draggable}
      onDragStart={onDragStart}
      onClick={onClick}
      className="cursor-pointer gap-2 p-3 transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <CategoryBadge category={ticket.category} />
        {ticket.priority ? (
          <PriorityBadge priority={ticket.priority} />
        ) : (
          <SeverityBadge severity={ticket.severity} />
        )}
      </div>
      <p className="line-clamp-2 text-sm font-medium leading-snug">
        {titleFromTicket(ticket.what_went_wrong)}
      </p>
      {ticket.screenshot_url && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <IconPhoto className="size-3.5" />
          Screenshot attached
        </div>
      )}
      <div className="mt-1 flex items-center justify-between">
        <span className="truncate text-xs text-muted-foreground" title={ticket.reporter_email}>
          {ticket.reporter_email}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {formatRelativeTime(ticket.created_at)}
          </span>
          <AssigneeAvatar profile={ticket.assignee} size="sm" />
        </div>
      </div>
    </Card>
  )
}
