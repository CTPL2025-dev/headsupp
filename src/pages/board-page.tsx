import * as React from "react"
import { useNavigate, Outlet } from "react-router-dom"
import { toast } from "sonner"

import { TicketCard } from "@/components/ticket-card"
import { Skeleton } from "@/components/ui/skeleton"
import { STATUS_LABEL } from "@/components/ticket-badges"
import { TicketFilterBar } from "@/components/ticket-filter-bar"
import { useFetchTickets } from "@/api/hooks/tickets/useFetchTickets"
import { useUpdateTicketStatus } from "@/api/hooks/tickets/useUpdateTicketStatus"
import { useFetchProfiles } from "@/api/hooks/profiles/useFetchProfiles"
import type { TicketFilters } from "@/api/endpoints/tickets/tickets"
import { useAuth } from "@/lib/auth-context"
import { BOARD_STATUSES, type Ticket, type TicketStatus } from "@/types"

export function BoardPage() {
  const [filters, setFilters] = React.useState<TicketFilters>({})
  const { tickets, isLoading } = useFetchTickets(filters)
  const { profiles } = useFetchProfiles()
  const { updateTicketStatus } = useUpdateTicketStatus()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [dragOverStatus, setDragOverStatus] = React.useState<TicketStatus | null>(null)

  const columns = React.useMemo(() => {
    const grouped: Record<TicketStatus, Ticket[]> = {
      new: [],
      triaged: [],
      in_progress: [],
      in_review: [],
      done: [],
      wontfix: [],
    }
    for (const ticket of tickets) {
      grouped[ticket.status]?.push(ticket)
    }
    return grouped
  }, [tickets])

  function handleDrop(status: TicketStatus) {
    return (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      setDragOverStatus(null)
      const ticketId = event.dataTransfer.getData("text/plain")
      const ticket = tickets.find((t) => t.id === ticketId)
      if (!ticket || ticket.status === status || !user) return

      if (ticket.status === "new" && !ticket.priority) {
        toast.error("Set a priority before moving this ticket out of New.")
        navigate(`/board/${ticket.id}`)
        return
      }

      updateTicketStatus(
        { ticketId, oldStatus: ticket.status, newStatus: status, actorId: user.id },
        { onError: (err) => toast.error(err.message || "Failed to update status.") }
      )
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <TicketFilterBar
        filters={filters}
        onChange={setFilters}
        profiles={profiles}
        currentUserId={user?.id}
      />
      <div className="flex min-h-0 flex-1">
        <div className="flex min-h-0 flex-1 gap-3 overflow-x-auto p-6">
          {BOARD_STATUSES.map((status) => (
            <div
              key={status}
              onDragOver={(event) => {
                event.preventDefault()
                setDragOverStatus(status)
              }}
              onDragLeave={() => setDragOverStatus((current) => (current === status ? null : current))}
              onDrop={handleDrop(status)}
              className={`flex w-72 shrink-0 flex-col rounded-lg border bg-muted/30 transition-colors ${
                dragOverStatus === status ? "border-primary bg-primary/5" : ""
              }`}
            >
              <div className="flex items-center justify-between px-3 py-2.5">
                <span className="text-sm font-semibold">{STATUS_LABEL[status]}</span>
                <span className="text-xs text-muted-foreground">{columns[status].length}</span>
              </div>
              <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-2 pb-2">
                {isLoading &&
                  Array.from({ length: 2 }).map((_, i) => (
                    <Skeleton key={i} className="h-28 w-full rounded-lg" />
                  ))}
                {!isLoading && columns[status].length === 0 && (
                  <p className="px-2 py-4 text-center text-xs text-muted-foreground">No tickets</p>
                )}
                {columns[status].map((ticket) => (
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                    draggable
                    onDragStart={(event) => {
                      event.dataTransfer.setData("text/plain", ticket.id)
                      event.dataTransfer.effectAllowed = "move"
                    }}
                    onClick={() => navigate(`/board/${ticket.id}`)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        <Outlet />
      </div>
    </div>
  )
}
