import React, { useEffect, useState } from 'react'
import {
  Alert, Box, Button, Card, CardContent, Divider, MenuItem, Stack, TextField, Typography
} from '@mui/material'
import { apiFetch } from '../api/http.js'

export default function AdminUsersPage() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
  })

  async function load() {
    setError('')
    setMsg('')
    try {
      const res = await apiFetch('/admin/users')
      setData(res)
    } catch (e) {
      setError(e.message)
    }
  }

  useEffect(() => { load() }, [])

  async function create() {
    setError('')
    setMsg('')
    try {
      await apiFetch('/admin/users', {
        method: 'POST',
        body: JSON.stringify(form),
      })
      setMsg('User created.')
      setForm({ name: '', email: '', password: '', role: 'user' })
      await load()
    } catch (e) {
      setError(e.message)
    }
  }

  async function remove(id) {
    setError('')
    setMsg('')
    try {
      await apiFetch(`/admin/users/${id}`, { method: 'DELETE' })
      setMsg('User deleted.')
      await load()
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Admin: Users</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {msg && <Alert severity="success" sx={{ mb: 2 }}>{msg}</Alert>}

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Create user</Typography>
          <Divider sx={{ mb: 2 }} />
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} fullWidth />
            <TextField label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} fullWidth />
            <TextField label="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} fullWidth />
            <TextField select label="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} sx={{ minWidth: 160 }}>
              <MenuItem value="user">user</MenuItem>
              <MenuItem value="librarian">librarian</MenuItem>
              <MenuItem value="admin">admin</MenuItem>
            </TextField>
            <Button variant="contained" onClick={create}>Create</Button>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Existing users</Typography>
          <Divider sx={{ mb: 2 }} />
          <Stack spacing={1}>
            {data?.data?.map((u) => (
              <Box key={u.id} sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="subtitle1">{u.name} ({u.role})</Typography>
                  <Typography variant="body2" color="text.secondary">{u.email}</Typography>
                </Box>
                <Button color="error" onClick={() => remove(u.id)}>Delete</Button>
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}
