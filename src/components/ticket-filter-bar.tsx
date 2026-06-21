import { IconFilter, IconSearch, IconUserCircle, IconX } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { TicketFilters } from "@/api/endpoints/tickets/tickets"
import { STATUS_LABEL } from "@/components/ticket-badges"
import {
  BOARD_STATUSES,
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  TICKET_SEVERITIES,
  type Profile,
} from "@/types"

const ALL = "__all__"

const SECONDARY_FILTER_KEYS: (keyof TicketFilters)[] = [
  "category",
  "severity",
  "reporterEmail",
  "label",
  "dateFrom",
  "dateTo",
  "hasScreenshot",
]

export function TicketFilterBar({
  filters,
  onChange,
  profiles,
  currentUserId,
}: {
  filters: TicketFilters
  onChange: (filters: TicketFilters) => void
  profiles: Profile[]
  currentUserId?: string
}) {
  const activeCount = Object.values(filters).filter((v) => v !== undefined && v !== "").length
  const secondaryActiveCount = SECONDARY_FILTER_KEYS.filter(
    (key) => filters[key] !== undefined && filters[key] !== ""
  ).length

  function set<K extends keyof TicketFilters>(key: K, value: TicketFilters[K]) {
    onChange({ ...filters, [key]: value })
  }

  return (
    <div className="flex flex-wrap items-center gap-2 border-b px-6 py-3">
      <InputGroup className="h-8 w-48">
        <InputGroupAddon>
          <IconSearch className="size-3.5" />
        </InputGroupAddon>
        <InputGroupInput
          value={filters.route ?? ""}
          onChange={(e) => set("route", e.target.value || undefined)}
          placeholder="Search route…"
        />
      </InputGroup>

      <Select
        value={filters.status ?? ALL}
        onValueChange={(v) => set("status", v === ALL ? undefined : (v as TicketFilters["status"]))}
      >
        <SelectTrigger size="sm" className="w-32">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All statuses</SelectItem>
          {[...BOARD_STATUSES, "wontfix" as const].map((s) => (
            <SelectItem key={s} value={s}>
              {STATUS_LABEL[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.priority ?? ALL}
        onValueChange={(v) => set("priority", v === ALL ? undefined : (v as TicketFilters["priority"]))}
      >
        <SelectTrigger size="sm" className="w-28">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All priorities</SelectItem>
          {TICKET_PRIORITIES.map((p) => (
            <SelectItem key={p} value={p}>
              {p.toUpperCase()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.assigneeId ?? ALL}
        onValueChange={(v) => set("assigneeId", v === ALL ? undefined : v)}
      >
        <SelectTrigger size="sm" className="w-36">
          <SelectValue placeholder="Assignee" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Anyone</SelectItem>
          <SelectItem value="unassigned">Unassigned</SelectItem>
          {profiles.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.email}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {currentUserId && (
        <Button
          variant={filters.assigneeId === currentUserId ? "secondary" : "outline"}
          size="sm"
          className="gap-1.5"
          onClick={() =>
            set("assigneeId", filters.assigneeId === currentUserId ? undefined : currentUserId)
          }
        >
          <IconUserCircle className="size-3.5" />
          My tickets
        </Button>
      )}

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5">
            <IconFilter className="size-3.5" />
            More filters
            {secondaryActiveCount > 0 && (
              <Badge variant="secondary" className="h-4 min-w-4 px-1">
                {secondaryActiveCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="flex w-72 flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">Category</Label>
            <Select
              value={filters.category ?? ALL}
              onValueChange={(v) => set("category", v === ALL ? undefined : v)}
            >
              <SelectTrigger size="sm" className="w-full">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All categories</SelectItem>
                {TICKET_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">Severity</Label>
            <Select
              value={filters.severity ?? ALL}
              onValueChange={(v) => set("severity", v === ALL ? undefined : (v as TicketFilters["severity"]))}
            >
              <SelectTrigger size="sm" className="w-full">
                <SelectValue placeholder="All severities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All severities</SelectItem>
                {TICKET_SEVERITIES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">Reporter email</Label>
            <Input
              value={filters.reporterEmail ?? ""}
              onChange={(e) => set("reporterEmail", e.target.value || undefined)}
              placeholder="name@company.com"
              className="h-8"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">Label</Label>
            <Input
              value={filters.label ?? ""}
              onChange={(e) => set("label", e.target.value || undefined)}
              placeholder="regression"
              className="h-8"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">From</Label>
              <Input
                type="date"
                value={filters.dateFrom?.slice(0, 10) ?? ""}
                onChange={(e) =>
                  set("dateFrom", e.target.value ? new Date(e.target.value).toISOString() : undefined)
                }
                className="h-8"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">To</Label>
              <Input
                type="date"
                value={filters.dateTo?.slice(0, 10) ?? ""}
                onChange={(e) =>
                  set("dateTo", e.target.value ? new Date(e.target.value).toISOString() : undefined)
                }
                className="h-8"
              />
            </div>
          </div>

          <label className="flex items-center gap-1.5 text-sm">
            <Checkbox
              checked={!!filters.hasScreenshot}
              onCheckedChange={(checked) => set("hasScreenshot", checked === true ? true : undefined)}
            />
            Has screenshot
          </label>
        </PopoverContent>
      </Popover>

      {activeCount > 0 && (
        <Button variant="ghost" size="sm" onClick={() => onChange({})} className="gap-1 text-muted-foreground">
          <IconX className="size-3.5" />
          Clear all
        </Button>
      )}
    </div>
  )
}
