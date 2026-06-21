import * as React from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"
import { IconExternalLink, IconX } from "@tabler/icons-react"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { AssigneeAvatar } from "@/components/assignee-avatar"
import { CategoryBadge, SeverityBadge, STATUS_LABEL } from "@/components/ticket-badges"
import { useFetchTicket } from "@/api/hooks/tickets/useFetchTicket"
import { useFetchComments } from "@/api/hooks/comments/useFetchComments"
import { useFetchActivity } from "@/api/hooks/activity/useFetchActivity"
import { useFetchProfiles } from "@/api/hooks/profiles/useFetchProfiles"
import { useCreateComment } from "@/api/hooks/comments/useCreateComment"
import { useUpdateTicketStatus } from "@/api/hooks/tickets/useUpdateTicketStatus"
import { useUpdateTicketPriority } from "@/api/hooks/tickets/useUpdateTicketPriority"
import { useUpdateTicketAssignee } from "@/api/hooks/tickets/useUpdateTicketAssignee"
import { useUpdateTicketLinkedPr } from "@/api/hooks/tickets/useUpdateTicketLinkedPr"
import { useUpdateTicketLabels } from "@/api/hooks/tickets/useUpdateTicketLabels"
import { useAuth } from "@/lib/auth-context"
import { formatRelativeTime } from "@/lib/utils"
import { BOARD_STATUSES, TICKET_PRIORITIES, type TicketPriority, type TicketStatus } from "@/types"

export function TicketDetailSheet() {
  const { ticketId } = useParams<{ ticketId: string }>()
  const { ticket, isLoading: loading } = useFetchTicket(ticketId)
  const { comments } = useFetchComments(ticketId)
  const { activity } = useFetchActivity(ticketId)
  const { profiles } = useFetchProfiles()
  const { updateTicketStatusAsync } = useUpdateTicketStatus()
  const { updateTicketPriorityAsync } = useUpdateTicketPriority()
  const { updateTicketAssigneeAsync } = useUpdateTicketAssignee()
  const { updateTicketLinkedPrAsync } = useUpdateTicketLinkedPr()
  const { updateTicketLabelsAsync } = useUpdateTicketLabels()
  const { createCommentAsync } = useCreateComment()
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [commentBody, setCommentBody] = React.useState("")
  const [postingComment, setPostingComment] = React.useState(false)
  const [linkedPrDraft, setLinkedPrDraft] = React.useState(ticket?.linked_pr_url ?? "")
  const [labelDraft, setLabelDraft] = React.useState("")
  const [zoomedScreenshot, setZoomedScreenshot] = React.useState(false)

  const parentPath = location.pathname.startsWith("/list") ? "/list" : "/board"

  const [trackedLinkedPr, setTrackedLinkedPr] = React.useState(ticket?.linked_pr_url ?? "")
  if ((ticket?.linked_pr_url ?? "") !== trackedLinkedPr) {
    setTrackedLinkedPr(ticket?.linked_pr_url ?? "")
    setLinkedPrDraft(ticket?.linked_pr_url ?? "")
  }

  function close() {
    navigate(parentPath)
  }

  async function handleStatusChange(nextStatus: TicketStatus) {
    if (!ticket || !user) return
    if (ticket.status === "new" && nextStatus !== "new" && !ticket.priority) {
      toast.error("Set a priority before moving this ticket out of New.")
      return
    }
    try {
      await updateTicketStatusAsync({
        ticketId: ticket.id,
        oldStatus: ticket.status,
        newStatus: nextStatus,
        actorId: user.id,
      })
      toast.success("Status updated")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update status")
    }
  }

  async function handlePriorityChange(nextPriority: TicketPriority) {
    if (!ticket || !user) return
    try {
      await updateTicketPriorityAsync({
        ticketId: ticket.id,
        oldPriority: ticket.priority,
        newPriority: nextPriority,
        actorId: user.id,
      })
      toast.success("Priority updated")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update priority")
    }
  }

  async function handleAssigneeChange(nextAssigneeId: string) {
    if (!ticket || !user) return
    const resolved = nextAssigneeId === "unassigned" ? null : nextAssigneeId
    try {
      await updateTicketAssigneeAsync({
        ticketId: ticket.id,
        oldAssigneeId: ticket.assignee_id,
        newAssigneeId: resolved,
        actorId: user.id,
      })
      toast.success("Assignee updated")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update assignee")
    }
  }

  async function handleLinkedPrSave() {
    if (!ticket || !user) return
    const next = linkedPrDraft.trim() || null
    if (next === ticket.linked_pr_url) return
    try {
      await updateTicketLinkedPrAsync({
        ticketId: ticket.id,
        oldUrl: ticket.linked_pr_url,
        newUrl: next,
        actorId: user.id,
      })
      toast.success("Linked PR updated")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update linked PR")
    }
  }

  async function handleAddLabel() {
    const label = labelDraft.trim()
    if (!ticket || !user || !label || ticket.labels.includes(label)) {
      setLabelDraft("")
      return
    }
    setLabelDraft("")
    try {
      await updateTicketLabelsAsync({
        ticketId: ticket.id,
        oldLabels: ticket.labels,
        newLabels: [...ticket.labels, label],
        actorId: user.id,
      })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add label")
    }
  }

  async function handleRemoveLabel(label: string) {
    if (!ticket || !user) return
    try {
      await updateTicketLabelsAsync({
        ticketId: ticket.id,
        oldLabels: ticket.labels,
        newLabels: ticket.labels.filter((l) => l !== label),
        actorId: user.id,
      })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove label")
    }
  }

  async function handlePostComment() {
    if (!ticket || !user || !commentBody.trim()) return
    setPostingComment(true)
    try {
      await createCommentAsync({ ticketId: ticket.id, authorId: user.id, body: commentBody.trim() })
      setCommentBody("")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to post comment")
    } finally {
      setPostingComment(false)
    }
  }

  return (
    <Sheet open onOpenChange={(open) => !open && close()}>
      <SheetContent
        side="right"
        className="w-full gap-0 overflow-y-auto"
        style={{ width: "70vw", maxWidth: "70vw" }}
      >
        {loading || !ticket ? (
          <div className="flex flex-col gap-4 p-6">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <>
            <SheetHeader className="gap-3 border-b p-6">
              <div className="flex items-center gap-2">
                <CategoryBadge category={ticket.category} />
                <SeverityBadge severity={ticket.severity} />
              </div>
              <SheetTitle className="text-base leading-snug">{ticket.what_went_wrong}</SheetTitle>
              <SheetDescription className="sr-only">Ticket details</SheetDescription>
              <div className="flex flex-wrap items-center gap-2">
                <Select value={ticket.status} onValueChange={(v) => handleStatusChange(v as TicketStatus)}>
                  <SelectTrigger size="sm" className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[...BOARD_STATUSES, "wontfix" as const].map((status) => (
                      <SelectItem key={status} value={status}>
                        {STATUS_LABEL[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={ticket.priority ?? undefined}
                  onValueChange={(v) => handlePriorityChange(v as TicketPriority)}
                >
                  <SelectTrigger size="sm" className="w-28">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {TICKET_PRIORITIES.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={ticket.assignee_id ?? "unassigned"}
                  onValueChange={handleAssigneeChange}
                >
                  <SelectTrigger size="sm" className="w-56">
                    <div className="flex min-w-0 items-center gap-1.5">
                      <AssigneeAvatar profile={ticket.assignee} size="sm" className="size-4 shrink-0" />
                      <span className="min-w-0 flex-1 truncate text-left">
                        <SelectValue />
                      </span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {profiles.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </SheetHeader>

            <div className="flex flex-col gap-5 p-6">
              {ticket.screenshot_url && (
                <button
                  type="button"
                  onClick={() => setZoomedScreenshot(true)}
                  className="overflow-hidden rounded-md border"
                >
                  <img src={ticket.screenshot_url} alt="Screenshot" className="max-h-96 w-full object-cover" />
                </button>
              )}

              <div>
                <h3 className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                  What went wrong
                </h3>
                <p className="whitespace-pre-wrap text-sm">{ticket.what_went_wrong}</p>
              </div>

              {ticket.improvement && (
                <div>
                  <h3 className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                    Suggested improvement
                  </h3>
                  <p className="whitespace-pre-wrap text-sm">{ticket.improvement}</p>
                </div>
              )}

              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Metadata</h3>
                <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm">
                  <dt className="text-muted-foreground">URL</dt>
                  <dd className="truncate">
                    <a
                      href={ticket.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      {ticket.url}
                      <IconExternalLink className="size-3.5 shrink-0" />
                    </a>
                  </dd>
                  <dt className="text-muted-foreground">Route</dt>
                  <dd className="truncate font-mono text-xs">{ticket.route}</dd>
                  <dt className="text-muted-foreground">Reporter</dt>
                  <dd className="truncate">{ticket.reporter_email}</dd>
                  <dt className="text-muted-foreground">Browser</dt>
                  <dd className="truncate text-xs" title={ticket.user_agent}>
                    {ticket.user_agent}
                  </dd>
                  <dt className="text-muted-foreground">Created</dt>
                  <dd>{new Date(ticket.created_at).toLocaleString()}</dd>
                  {ticket.resolved_at && (
                    <>
                      <dt className="text-muted-foreground">Resolved</dt>
                      <dd>{new Date(ticket.resolved_at).toLocaleString()}</dd>
                    </>
                  )}
                </dl>
              </div>

              <div>
                <h3 className="mb-1 text-xs font-semibold uppercase text-muted-foreground">Linked PR</h3>
                <div className="flex gap-2">
                  <Input
                    value={linkedPrDraft}
                    onChange={(e) => setLinkedPrDraft(e.target.value)}
                    onBlur={handleLinkedPrSave}
                    onKeyDown={(e) => e.key === "Enter" && handleLinkedPrSave()}
                    placeholder="https://github.com/org/repo/pull/123"
                  />
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Labels</h3>
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {ticket.labels.map((label) => (
                    <Badge key={label} variant="secondary" className="gap-1 pr-1">
                      {label}
                      <button
                        type="button"
                        onClick={() => handleRemoveLabel(label)}
                        className="rounded-full hover:bg-foreground/10"
                      >
                        <IconX className="size-3" />
                      </button>
                    </Badge>
                  ))}
                  {ticket.labels.length === 0 && (
                    <span className="text-xs text-muted-foreground">No labels</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={labelDraft}
                    onChange={(e) => setLabelDraft(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddLabel()}
                    placeholder="Add label…"
                    className="h-8"
                  />
                  <Button size="sm" variant="outline" onClick={handleAddLabel}>
                    Add
                  </Button>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                  Comments
                </h3>
                <div className="mb-3 flex flex-col gap-3">
                  {comments.length === 0 && (
                    <p className="text-xs text-muted-foreground">No comments yet.</p>
                  )}
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-2">
                      <AssigneeAvatar profile={comment.author} size="sm" />
                      <div className="min-w-0 flex-1 rounded-md bg-muted/50 px-3 py-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-xs font-medium">
                            {comment.author?.email ?? "Unknown"}
                          </span>
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {formatRelativeTime(comment.created_at)}
                          </span>
                        </div>
                        <p className="mt-0.5 whitespace-pre-wrap text-sm">{comment.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-2">
                  <Textarea
                    value={commentBody}
                    onChange={(e) => setCommentBody(e.target.value)}
                    placeholder="Add an internal comment…"
                    rows={2}
                  />
                  <Button
                    size="sm"
                    className="self-end"
                    disabled={!commentBody.trim() || postingComment}
                    onClick={handlePostComment}
                  >
                    {postingComment ? "Posting…" : "Comment"}
                  </Button>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                  Activity
                </h3>
                <div className="flex flex-col gap-2">
                  {activity.length === 0 && (
                    <p className="text-xs text-muted-foreground">No activity yet.</p>
                  )}
                  {activity.map((entry) => (
                    <p key={entry.id} className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">
                        {entry.actor?.email ?? "Unknown"}
                      </span>{" "}
                      changed {entry.field.replace("_", " ")} from{" "}
                      <span className="font-medium text-foreground">{entry.old_value || "—"}</span> to{" "}
                      <span className="font-medium text-foreground">{entry.new_value || "—"}</span> ·{" "}
                      {formatRelativeTime(entry.created_at)}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </SheetContent>

      {ticket?.screenshot_url && (
        <Dialog open={zoomedScreenshot} onOpenChange={setZoomedScreenshot}>
          <DialogContent
            showCloseButton
            className="gap-0 p-2"
            style={{ width: "85vw", maxWidth: "85vw" }}
          >
            <DialogTitle className="sr-only">Screenshot</DialogTitle>
            <img
              src={ticket.screenshot_url}
              alt="Screenshot full size"
              className="max-h-[85vh] w-full rounded-md object-contain"
            />
          </DialogContent>
        </Dialog>
      )}
    </Sheet>
  )
}
