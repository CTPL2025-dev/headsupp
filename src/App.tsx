import { Navigate, Route, Routes } from "react-router-dom"

import { AppShell } from "@/components/app-shell"
import { ProtectedRoute } from "@/components/protected-route"
import { LoginPage } from "@/pages/login-page"
import { BoardPage } from "@/pages/board-page"
import { ListPage } from "@/pages/list-page"
import { AnalyticsPage } from "@/pages/analytics-page"
import { TicketDetailSheet } from "@/pages/ticket-detail-sheet"

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route index element={<Navigate to="/board" replace />} />
          <Route path="board" element={<BoardPage />}>
            <Route path=":ticketId" element={<TicketDetailSheet />} />
          </Route>
          <Route path="list" element={<ListPage />}>
            <Route path=":ticketId" element={<TicketDetailSheet />} />
          </Route>
          <Route path="analytics" element={<AnalyticsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
