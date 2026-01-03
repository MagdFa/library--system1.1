import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import AppShell from './components/AppShell.jsx'
import { ProtectedRoute, RoleRoute } from './components/RouteGuards.jsx'

import HomePage from './pages/HomePage.jsx'
import BooksPage from './pages/BooksPage.jsx'
import BookDetailsPage from './pages/BookDetailsPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import MyReservationsPage from './pages/MyReservationsPage.jsx'
import MyLoansPage from './pages/MyLoansPage.jsx'
import MyOrdersPage from './pages/MyOrdersPage.jsx'
import ReaderPage from './pages/ReaderPage.jsx'
import LibrarianDashboard from './pages/LibrarianDashboard.jsx'
import AdminUsersPage from './pages/AdminUsersPage.jsx'

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/books" element={<BooksPage />} />
        <Route path="/books/:id" element={<BookDetailsPage />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/my/reservations" element={
          <ProtectedRoute><MyReservationsPage /></ProtectedRoute>
        } />
        <Route path="/my/loans" element={
          <ProtectedRoute><MyLoansPage /></ProtectedRoute>
        } />
        <Route path="/my/orders" element={
          <ProtectedRoute><MyOrdersPage /></ProtectedRoute>
        } />

        <Route path="/reader/:id" element={
          <ProtectedRoute><ReaderPage /></ProtectedRoute>
        } />

        <Route path="/librarian" element={
          <RoleRoute roles={['librarian','admin']}><LibrarianDashboard /></RoleRoute>
        } />

        <Route path="/admin/users" element={
          <RoleRoute roles={['admin']}><AdminUsersPage /></RoleRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  )
}
