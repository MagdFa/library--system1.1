import React, { useEffect, useState } from 'react'
import {
  Alert, Box, Button, Card, CardContent, Divider, Grid, Stack, TextField, Typography
} from '@mui/material'
import { apiFetch } from '../api/http.js'

export default function LibrarianDashboard() {
  const [pending, setPending] = useState(null)
  const [loans, setLoans] = useState(null)
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')

  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    is_digital: false,
    total_copies: 1,
    price: 0,
  })

  async function load() {
    setError('')
    setMsg('')
    try {
      const [p, l] = await Promise.all([
        apiFetch('/librarian/reservations/pending'),
        apiFetch('/librarian/loans/active'),
      ])
      setPending(p)
      setLoans(l)
    } catch (e) {
      setError(e.message)
    }
  }

  useEffect(() => { load() }, [])

  async function approve(reservationId) {
    setError('')
    try {
      await apiFetch(`/librarian/reservations/${reservationId}/approve`, { method: 'POST' })
      setMsg('Reservation approved and loan issued.')
      await load()
    } catch (e) {
      setError(e.message)
    }
  }

  async function returnLoan(loanId) {
    setError('')
    try {
      await apiFetch(`/librarian/loans/${loanId}/return`, { method: 'POST' })
      setMsg('Loan returned.')
      await load()
    } catch (e) {
      setError(e.message)
    }
  }

  async function createBook() {
    setError('')
    try {
      const payload = {
        title: newBook.title,
        author: newBook.author,
        is_digital: Boolean(newBook.is_digital),
        total_copies: Number(newBook.total_copies),
        price: Number(newBook.price),
      }
      await apiFetch('/librarian/books', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      setMsg('Book created.')
      setNewBook({ title: '', author: '', is_digital: false, total_copies: 1, price: 0 })
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Librarian Dashboard</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {msg && <Alert severity="success" sx={{ mb: 2 }}>{msg}</Alert>}

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Pending Reservations</Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={2}>
                {pending?.data?.map((r) => (
                  <Card key={r.id} variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1">{r.book?.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        User: {r.user?.name} ({r.user?.email})
                      </Typography>
                      <Button sx={{ mt: 1 }} variant="contained" onClick={() => approve(r.id)}>
                        Approve & Issue Loan
                      </Button>
                    </CardContent>
                  </Card>
                ))}
                {pending?.data?.length === 0 && <Typography variant="body2">No pending reservations.</Typography>}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Active Loans</Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={2}>
                {loans?.data?.map((l) => (
                  <Card key={l.id} variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1">{l.book?.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        User: {l.user?.name} ({l.user?.email})
                      </Typography>
                      <Typography variant="body2">
                        Due: {l.due_at ? new Date(l.due_at).toLocaleString() : '-'}
                      </Typography>
                      <Button sx={{ mt: 1 }} onClick={() => returnLoan(l.id)}>
                        Mark Returned
                      </Button>
                    </CardContent>
                  </Card>
                ))}
                {loans?.data?.length === 0 && <Typography variant="body2">No active loans.</Typography>}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Add Book</Typography>
              <Divider sx={{ mb: 2 }} />
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField label="Title" value={newBook.title} onChange={(e) => setNewBook({ ...newBook, title: e.target.value })} fullWidth />
                <TextField label="Author" value={newBook.author} onChange={(e) => setNewBook({ ...newBook, author: e.target.value })} fullWidth />
                <TextField label="Total copies" type="number" value={newBook.total_copies} onChange={(e) => setNewBook({ ...newBook, total_copies: e.target.value })} sx={{ minWidth: 140 }} />
                <TextField label="Price (digital)" type="number" value={newBook.price} onChange={(e) => setNewBook({ ...newBook, price: e.target.value })} sx={{ minWidth: 140 }} />
                <Button variant="contained" onClick={createBook}>Create</Button>
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Note: this simple form creates a physical book by default. To create a digital book, edit the payload in code or extend the form.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
