
/**
 * تعديل بواسطة الطالب
 * مكون عرض قائمة الكتب - Frontend React
 */
// هزا المكون مسؤول عن عرض الكتب المتاحة للحجز


import React, { useMemo, useState } from 'react'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import {
  AppBar, Box, Button, Divider, Drawer, IconButton, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, Toolbar, Typography
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import HomeIcon from '@mui/icons-material/Home'
import BookIcon from '@mui/icons-material/Book'
import AssignmentIcon from '@mui/icons-material/Assignment'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks'
import { useAuth } from '../state/AuthContext.jsx'

const drawerWidth = 260

export default function AppShell({ children }) {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const location = useLocation()

  const items = useMemo(() => {
    const base = [
      { to: '/', label: 'Home', icon: <HomeIcon /> },
      { to: '/books', label: 'Books', icon: <BookIcon /> },
    ]

    if (user) {
      base.push(
        { to: '/my/reservations', label: 'My Reservations', icon: <AssignmentIcon /> },
        { to: '/my/loans', label: 'My Loans', icon: <LibraryBooksIcon /> },
        { to: '/my/orders', label: 'My Orders', icon: <ShoppingCartIcon /> },
      )
    }

    if (user?.role === 'librarian' || user?.role === 'admin') {
      base.push({ to: '/librarian', label: 'Librarian', icon: <LibraryBooksIcon /> })
    }

    if (user?.role === 'admin') {
      base.push({ to: '/admin/users', label: 'Admin / Users', icon: <AdminPanelSettingsIcon /> })
    }

    return base
  }, [user])

  const drawer = (
    <Box sx={{ width: drawerWidth }} role="presentation" onClick={() => setOpen(false)}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6">Library System</Typography>
        <Typography variant="body2" color="text.secondary">
          {user ? `${user.name} (${user.role})` : 'Guest'}
        </Typography>
      </Box>
      <Divider />
      <List>
        {items.map((it) => (
          <ListItem key={it.to} disablePadding>
            <ListItemButton component={RouterLink} to={it.to} selected={location.pathname === it.to}>
              <ListItemIcon>{it.icon}</ListItemIcon>
              <ListItemText primary={it.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={() => setOpen(true)} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Library Reservation System
          </Typography>
          {user ? (
            <Button color="inherit" onClick={logout}>Logout</Button>
          ) : (
            <>
              <Button color="inherit" component={RouterLink} to="/login">Login</Button>
              <Button color="inherit" component={RouterLink} to="/register">Register</Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Drawer open={open} onClose={() => setOpen(false)}>
        {drawer}
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        {children}
      </Box>
    </Box>
  )
}
