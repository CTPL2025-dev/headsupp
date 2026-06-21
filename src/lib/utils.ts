import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const RELATIVE_TIME_UNITS: { unit: Intl.RelativeTimeFormatUnit; ms: number }[] = [
  { unit: "year", ms: 31536000000 },
  { unit: "month", ms: 2628000000 },
  { unit: "week", ms: 604800000 },
  { unit: "day", ms: 86400000 },
  { unit: "hour", ms: 3600000 },
  { unit: "minute", ms: 60000 },
]

const relativeTimeFormatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" })

export function now(): number {
  return Date.now()
}

export function formatRelativeTime(isoDate: string): string {
  const diffMs = new Date(isoDate).getTime() - Date.now()
  for (const { unit, ms } of RELATIVE_TIME_UNITS) {
    if (Math.abs(diffMs) >= ms) {
      return relativeTimeFormatter.format(Math.round(diffMs / ms), unit)
    }
  }
  return relativeTimeFormatter.format(Math.round(diffMs / 1000), "second")
}

export function initials(label: string): string {
  const name = label.split("@")[0]
  const parts = name.split(/[.\s_-]+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export function titleFromTicket(whatWentWrong: string): string {
  const firstLine = whatWentWrong.split("\n")[0].trim()
  return firstLine.length > 80 ? `${firstLine.slice(0, 80)}…` : firstLine
}
