export const TICKET_STATUSES = [
  "new",
  "triaged",
  "in_progress",
  "in_review",
  "done",
  "wontfix",
] as const
export type TicketStatus = (typeof TICKET_STATUSES)[number]

export const TICKET_PRIORITIES = ["p0", "p1", "p2", "p3"] as const
export type TicketPriority = (typeof TICKET_PRIORITIES)[number]

export const TICKET_SEVERITIES = ["low", "medium", "high"] as const
export type TicketSeverity = (typeof TICKET_SEVERITIES)[number]

export const TICKET_CATEGORIES = [
  "Analytics",
  "Articles",
  "Campaigns",
  "Site Optimization",
  "Brand Assets",
  "Dashboard",
  "Workspace",
  "Onboarding",
  "Integrations",
  "Preferences",
  "Auth",
  "Backend Issue",
  "Other",
] as const
export type TicketCategory = (typeof TICKET_CATEGORIES)[number]

export const BOARD_STATUSES: TicketStatus[] = [
  "new",
  "triaged",
  "in_progress",
  "in_review",
  "done",
]

export interface Profile {
  id: string
  email: string
  role: "pm" | "developer"
  created_at: string
}

export interface Ticket {
  id: string
  url: string
  route: string
  category: string
  screenshot_url: string | null
  what_went_wrong: string
  improvement: string | null
  severity: TicketSeverity
  reporter_email: string
  user_agent: string
  created_at: string
  status: TicketStatus
  priority: TicketPriority | null
  assignee_id: string | null
  labels: string[]
  linked_pr_url: string | null
  resolved_at: string | null
  updated_at: string
  // joined
  assignee?: Profile | null
}

export interface TicketComment {
  id: string
  ticket_id: string
  author_id: string
  body: string
  created_at: string
  author?: Profile | null
}

export interface TicketActivity {
  id: string
  ticket_id: string
  actor_id: string
  field: string
  old_value: string | null
  new_value: string | null
  created_at: string
  actor?: Profile | null
}
