import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom"
import { IconLayoutKanban, IconList, IconChartBar, IconLogout, IconClipboardList } from "@tabler/icons-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { initials } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { useRealtimeTicketsSync } from "@/api/hooks/useRealtimeTicketsSync"

const NAV_ITEMS = [
  { to: "/board", label: "Board", icon: IconLayoutKanban },
  { to: "/list", label: "List", icon: IconList },
  { to: "/analytics", label: "Analytics", icon: IconChartBar },
]

export function AppShell() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  useRealtimeTicketsSync()

  async function handleSignOut() {
    await signOut()
    navigate("/login", { replace: true })
  }

  const email = profile?.email ?? user?.email ?? ""
  const activeItem = NAV_ITEMS.find((item) => location.pathname.startsWith(item.to))

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <div>
                  <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                    <IconClipboardList className="size-4" />
                  </div>
                  <span className="text-sm font-semibold tracking-tight">Heads Up</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {NAV_ITEMS.map((item) => (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname.startsWith(item.to)}
                      tooltip={item.label}
                    >
                      <NavLink to={item.to}>
                        <item.icon />
                        <span>{item.label}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton size="lg">
                    <Avatar size="sm">
                      <AvatarFallback>{email ? initials(email) : "?"}</AvatarFallback>
                    </Avatar>
                    <span className="truncate text-sm">{email}</span>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" side="top" className="w-56">
                  <DropdownMenuLabel className="truncate font-normal text-muted-foreground">
                    {email}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={handleSignOut}>
                    <IconLogout className="size-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset className="min-h-svh">
        <header className="flex h-12 shrink-0 items-center gap-2 border-b px-3">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-4" />
          <span className="text-sm font-medium">{activeItem?.label ?? "Heads Up"}</span>
        </header>
        <div className="flex min-h-0 flex-1 flex-col">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
