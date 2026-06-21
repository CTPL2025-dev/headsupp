import * as React from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { useFetchTickets } from "@/api/hooks/tickets/useFetchTickets"
import { now } from "@/lib/utils"
import { TICKET_PRIORITIES, TICKET_SEVERITIES } from "@/types"

const DAY_MS = 86400000

function dayKey(iso: string) {
  return iso.slice(0, 10)
}

const PRIORITY_COLORS: Record<string, string> = {
  p0: "var(--chart-1)",
  p1: "var(--chart-2)",
  p2: "var(--chart-3)",
  p3: "var(--chart-4)",
  none: "var(--chart-5)",
}

export function AnalyticsPage() {
  const { tickets, isLoading } = useFetchTickets()

  const stats = React.useMemo(() => {
    const total = tickets.length
    const closed = tickets.filter((t) => t.status === "done" || t.status === "wontfix").length
    const open = total - closed

    const nowMs = now()
    const last7 = tickets.filter((t) => nowMs - new Date(t.created_at).getTime() < 7 * DAY_MS).length
    const prev7 = tickets.filter((t) => {
      const age = nowMs - new Date(t.created_at).getTime()
      return age >= 7 * DAY_MS && age < 14 * DAY_MS
    }).length
    const trend = prev7 === 0 ? (last7 > 0 ? 100 : 0) : Math.round(((last7 - prev7) / prev7) * 100)

    const resolvedDurations = tickets
      .filter((t) => t.resolved_at)
      .map((t) => (new Date(t.resolved_at!).getTime() - new Date(t.created_at).getTime()) / 3600000)
    const avgResolutionHours =
      resolvedDurations.length > 0
        ? resolvedDurations.reduce((a, b) => a + b, 0) / resolvedDurations.length
        : null

    return { total, closed, open, last7, prev7, trend, avgResolutionHours }
  }, [tickets])

  const timeSeries = React.useMemo(() => {
    const days: { date: string; count: number }[] = []
    const nowMs = now()
    for (let i = 29; i >= 0; i--) {
      const date = new Date(nowMs - i * DAY_MS)
      days.push({ date: dayKey(date.toISOString()), count: 0 })
    }
    const map = new Map(days.map((d) => [d.date, d]))
    for (const t of tickets) {
      const key = dayKey(t.created_at)
      const entry = map.get(key)
      if (entry) entry.count += 1
    }
    return days
  }, [tickets])

  const byCategory = React.useMemo(() => {
    const counts = new Map<string, number>()
    for (const t of tickets) counts.set(t.category, (counts.get(t.category) ?? 0) + 1)
    return [...counts.entries()]
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
  }, [tickets])

  const bySeverityPriority = React.useMemo(() => {
    return TICKET_SEVERITIES.map((severity) => {
      const row: Record<string, string | number> = { severity }
      for (const p of [...TICKET_PRIORITIES, "none"]) row[p] = 0
      for (const t of tickets) {
        if (t.severity !== severity) continue
        const key = t.priority ?? "none"
        row[key] = (row[key] as number) + 1
      }
      return row
    })
  }, [tickets])

  const topRoutes = React.useMemo(() => {
    const counts = new Map<string, number>()
    for (const t of tickets) counts.set(t.route, (counts.get(t.route) ?? 0) + 1)
    return [...counts.entries()]
      .map(([route, count]) => ({ route, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
  }, [tickets])

  const resolutionByCategory = React.useMemo(() => {
    const byCat = new Map<string, number[]>()
    for (const t of tickets) {
      if (!t.resolved_at) continue
      const hours = (new Date(t.resolved_at).getTime() - new Date(t.created_at).getTime()) / 3600000
      const arr = byCat.get(t.category) ?? []
      arr.push(hours)
      byCat.set(t.category, arr)
    }
    return [...byCat.entries()]
      .map(([category, durations]) => ({
        category,
        avgHours: durations.reduce((a, b) => a + b, 0) / durations.length,
        count: durations.length,
      }))
      .sort((a, b) => b.avgHours - a.avgHours)
  }, [tickets])

  const reporterLeaderboard = React.useMemo(() => {
    const counts = new Map<string, number>()
    for (const t of tickets) counts.set(t.reporter_email, (counts.get(t.reporter_email) ?? 0) + 1)
    return [...counts.entries()]
      .map(([reporter, count]) => ({ reporter, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
  }, [tickets])

  const timeSeriesConfig: ChartConfig = { count: { label: "Tickets", color: "var(--chart-1)" } }
  const categoryConfig: ChartConfig = { count: { label: "Tickets", color: "var(--chart-2)" } }
  const severityConfig: ChartConfig = {
    p0: { label: "P0", color: PRIORITY_COLORS.p0 },
    p1: { label: "P1", color: PRIORITY_COLORS.p1 },
    p2: { label: "P2", color: PRIORITY_COLORS.p2 },
    p3: { label: "P3", color: PRIORITY_COLORS.p3 },
    none: { label: "No priority", color: PRIORITY_COLORS.none },
  }

  if (isLoading) {
    return (
      <div className="grid flex-1 grid-cols-2 gap-4 p-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-64 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Total tickets" value={stats.total} />
        <StatCard label="Open" value={stats.open} />
        <StatCard label="Closed" value={stats.closed} />
        <StatCard
          label="Avg time to resolution"
          value={stats.avgResolutionHours != null ? `${Math.round(stats.avgResolutionHours)}h` : "—"}
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tickets over time</CardTitle>
            <CardDescription>Daily volume, last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={timeSeriesConfig}>
              <LineChart data={timeSeries}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(v) => v.slice(5)}
                  tickLine={false}
                  axisLine={false}
                  minTickGap={24}
                />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="count" stroke="var(--color-count)" strokeWidth={2} dot={false} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Volume by category</CardTitle>
            <CardDescription>Which app sections generate the most reports</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={categoryConfig}>
              <BarChart data={byCategory} layout="vertical" margin={{ left: 16 }}>
                <CartesianGrid horizontal={false} />
                <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
                <YAxis
                  dataKey="category"
                  type="category"
                  width={110}
                  tickLine={false}
                  axisLine={false}
                  className="text-xs"
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="var(--color-count)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Severity by priority</CardTitle>
            <CardDescription>Reporter severity vs. PM-assigned priority</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={severityConfig}>
              <BarChart data={bySeverityPriority}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="severity" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={28} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                {[...TICKET_PRIORITIES, "none"].map((p) => (
                  <Bar key={p} dataKey={p} stackId="priority" fill={`var(--color-${p})`} radius={2} />
                ))}
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Open vs. closed</CardTitle>
            <CardDescription>
              {stats.last7} tickets this week ({stats.trend >= 0 ? "+" : ""}
              {stats.trend}% vs. last week)
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Progress value={stats.total > 0 ? (stats.closed / stats.total) * 100 : 0} />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{stats.closed} closed</span>
              <span>{stats.open} open</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top reported routes</CardTitle>
            <CardDescription>Pages generating the most friction</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Route</TableHead>
                  <TableHead className="text-right">Reports</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topRoutes.map((row) => (
                  <TableRow key={row.route}>
                    <TableCell className="max-w-48 truncate font-mono text-xs">{row.route}</TableCell>
                    <TableCell className="text-right">{row.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reporter leaderboard</CardTitle>
            <CardDescription>Most active beta testers</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reporter</TableHead>
                  <TableHead className="text-right">Tickets</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reporterLeaderboard.map((row) => (
                  <TableRow key={row.reporter}>
                    <TableCell className="max-w-48 truncate text-sm">{row.reporter}</TableCell>
                    <TableCell className="text-right">{row.count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Avg. time to resolution by category</CardTitle>
            <CardDescription>From created_at to resolved_at</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Resolved tickets</TableHead>
                  <TableHead className="text-right">Avg. hours to resolve</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resolutionByCategory.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-sm text-muted-foreground">
                      No resolved tickets yet.
                    </TableCell>
                  </TableRow>
                )}
                {resolutionByCategory.map((row) => (
                  <TableRow key={row.category}>
                    <TableCell>{row.category}</TableCell>
                    <TableCell className="text-right">{row.count}</TableCell>
                    <TableCell className="text-right">{Math.round(row.avgHours)}h</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl">{value}</CardTitle>
      </CardHeader>
    </Card>
  )
}
