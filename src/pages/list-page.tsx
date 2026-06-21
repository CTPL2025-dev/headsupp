import * as React from "react"
import { Outlet, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { IconChevronDown, IconPhoto } from "@tabler/icons-react"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AssigneeAvatar } from "@/components/assignee-avatar"
import { CategoryBadge, PriorityBadge, SeverityBadge, StatusBadge, STATUS_LABEL } from "@/components/ticket-badges"
import { TicketFilterBar } from "@/components/ticket-filter-bar"
import { useFetchTickets } from "@/api/hooks/tickets/useFetchTickets"
import { useFetchProfiles } from "@/api/hooks/profiles/useFetchProfiles"
import { useUpdateTicketStatus } from "@/api/hooks/tickets/useUpdateTicketStatus"
import { useUpdateTicketPriority } from "@/api/hooks/tickets/useUpdateTicketPriority"
import { useUpdateTicketAssignee } from "@/api/hooks/tickets/useUpdateTicketAssignee"
import type { TicketFilters } from "@/api/endpoints/tickets/tickets"
import { useAuth } from "@/lib/auth-context"
import { formatRelativeTime, titleFromTicket } from "@/lib/utils"
import { BOARD_STATUSES, TICKET_PRIORITIES, type Ticket } from "@/types"

type SortKey = "created_at" | "category" | "severity" | "priority" | "status" | "reporter_email"

export function ListPage() {
  const [filters, setFilters] = React.useState<TicketFilters>({})
  const { tickets, isLoading } = useFetchTickets(filters)
  const { profiles } = useFetchProfiles()
  const { updateTicketStatusAsync } = useUpdateTicketStatus()
  const { updateTicketPriorityAsync } = useUpdateTicketPriority()
  const { updateTicketAssigneeAsync } = useUpdateTicketAssignee()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [sortKey, setSortKey] = React.useState<SortKey>("created_at")
  const [sortAsc, setSortAsc] = React.useState(false)

  const sorted = React.useMemo(() => {
    const copy = [...tickets]
    copy.sort((a, b) => {
      const av = a[sortKey] ?? ""
      const bv = b[sortKey] ?? ""
      const cmp = String(av).localeCompare(String(bv))
      return sortAsc ? cmp : -cmp
    })
    return copy
  }, [tickets, sortKey, sortAsc])

  function toggleSort(key: SortKey) {
    if (key === sortKey) setSortAsc((asc) => !asc)
    else {
      setSortKey(key)
      setSortAsc(false)
    }
  }

  function toggleSelected(id: string) {
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    setSelected((current) =>
      current.size === sorted.length ? new Set() : new Set(sorted.map((t) => t.id))
    )
  }

  async function bulkUpdate(apply: (ticket: Ticket) => Promise<void>) {
    if (!user) return
    const targets = sorted.filter((t) => selected.has(t.id))
    try {
      await Promise.all(targets.map(apply))
      toast.success(`Updated ${targets.length} ticket${targets.length === 1 ? "" : "s"}`)
      setSelected(new Set())
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Bulk update failed")
    }
  }

  function bulkSetStatus(status: Ticket["status"]) {
    bulkUpdate((t) =>
      updateTicketStatusAsync({ ticketId: t.id, oldStatus: t.status, newStatus: status, actorId: user!.id })
    )
  }

  function bulkSetPriority(priority: Ticket["priority"]) {
    if (!priority) return
    bulkUpdate((t) =>
      updateTicketPriorityAsync({
        ticketId: t.id,
        oldPriority: t.priority,
        newPriority: priority,
        actorId: user!.id,
      })
    )
  }

  function bulkSetAssignee(assigneeId: string | null) {
    bulkUpdate((t) =>
      updateTicketAssigneeAsync({
        ticketId: t.id,
        oldAssigneeId: t.assignee_id,
        newAssigneeId: assigneeId,
        actorId: user!.id,
      })
    )
  }

  const sortableHeader = (label: string, key: SortKey) => (
    <button
      type="button"
      onClick={() => toggleSort(key)}
      className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
    >
      {label}
      {sortKey === key && (
        <IconChevronDown className={`size-3 transition-transform ${sortAsc ? "rotate-180" : ""}`} />
      )}
    </button>
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <TicketFilterBar
        filters={filters}
        onChange={setFilters}
        profiles={profiles}
        currentUserId={user?.id}
      />

      {selected.size > 0 && (
        <div className="flex items-center gap-3 border-b bg-muted/40 px-3 py-2">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline">
                Bulk actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Set status</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {[...BOARD_STATUSES, "wontfix" as const].map((s) => (
                    <DropdownMenuItem key={s} onSelect={() => bulkSetStatus(s)}>
                      {STATUS_LABEL[s]}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Set priority</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  {TICKET_PRIORITIES.map((p) => (
                    <DropdownMenuItem key={p} onSelect={() => bulkSetPriority(p)}>
                      {p.toUpperCase()}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Assign to</DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onSelect={() => bulkSetAssignee(null)}>Unassigned</DropdownMenuItem>
                  {profiles.map((p) => (
                    <DropdownMenuItem key={p.id} onSelect={() => bulkSetAssignee(p.id)}>
                      {p.email}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-auto p-6">
        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={sorted.length > 0 && selected.size === sorted.length}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>Title</TableHead>
                <TableHead>{sortableHeader("Category", "category")}</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>{sortableHeader("Severity", "severity")}</TableHead>
                <TableHead>{sortableHeader("Priority", "priority")}</TableHead>
                <TableHead>{sortableHeader("Status", "status")}</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>{sortableHeader("Reporter", "reporter_email")}</TableHead>
                <TableHead>{sortableHeader("Created", "created_at")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading &&
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={10}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  </TableRow>
                ))}
              {!isLoading && sorted.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="py-10 text-center text-sm text-muted-foreground">
                    No tickets match these filters.
                  </TableCell>
                </TableRow>
              )}
              {sorted.map((ticket) => (
                <TableRow
                  key={ticket.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/list/${ticket.id}`)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selected.has(ticket.id)}
                      onCheckedChange={() => toggleSelected(ticket.id)}
                    />
                  </TableCell>
                  <TableCell className="max-w-64 truncate font-medium">
                    <span className="inline-flex items-center gap-1.5">
                      {titleFromTicket(ticket.what_went_wrong)}
                      {ticket.screenshot_url && (
                        <IconPhoto className="size-3.5 shrink-0 text-muted-foreground" />
                      )}
                    </span>
                  </TableCell>
                  <TableCell>
                    <CategoryBadge category={ticket.category} />
                  </TableCell>
                  <TableCell className="max-w-40 truncate font-mono text-xs text-muted-foreground">
                    {ticket.route}
                  </TableCell>
                  <TableCell>
                    <SeverityBadge severity={ticket.severity} />
                  </TableCell>
                  <TableCell>
                    <PriorityBadge priority={ticket.priority} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={ticket.status} />
                  </TableCell>
                  <TableCell>
                    <AssigneeAvatar profile={ticket.assignee} size="sm" />
                  </TableCell>
                  <TableCell className="max-w-40 truncate text-sm text-muted-foreground">
                    {ticket.reporter_email}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatRelativeTime(ticket.created_at)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      <Outlet />
    </div>
  )
}
