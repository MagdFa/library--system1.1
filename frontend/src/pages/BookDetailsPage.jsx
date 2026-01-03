import React, { useEffect, useState } from 'react'
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom'
import { Alert, Box, Button, Card, CardActions, CardContent, Chip, CircularProgress, Stack, Typography } from '@mui/material'
import { apiFetch } from '../api/http.js'
import { useAuth } from '../state/AuthContext.jsx'

export default function BookDetailsPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    setError('')
    setLoading(true)
    try {
      const data = await apiFetch(`/books/${id}`)
      setBook(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  async function reserve() {
    setError('')
    try {
      await apiFetch('/reservations', { method: 'POST', body: JSON.stringify({ book_id: Number(id) }) })
      alert('Reservation created.')
    } catch (e) {
      setError(e.message)
    }
  }

  async function buy() {
    setError('')
    try {
      const order = await apiFetch('/orders', { method: 'POST', body: JSON.stringify({ items: [{ book_id: Number(id) }] }) })
      await apiFetch('/payments/checkout', { method: 'POST', body: JSON.stringify({ order_id: order.id, provider: 'mock' }) })
      alert('Purchase successful (mock).')
    } catch (e) {
      setError(e.message)
    }
  }

  async function download() {
    setError('')
    try {
      const res = await apiFetch(`/books/${id}/download`, { method: 'GET' })
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${book?.title || 'ebook'}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (e) {
      setError(e.message)
    }
  }

  if (loading) return <CircularProgress />
  if (error) return <Alert severity="error">{error}</Alert>
  if (!book) return null

  return (
    <Box sx={{ maxWidth: 900 }}>
      <Card>
        <CardContent>
          <Typography variant="h5">{book.title}</Typography>
          <Typography variant="body1" color="text.secondary">{book.author}</Typography>

          <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap' }}>
            {book.categories?.map((c) => <Chip key={c.id} label={c.name} size="small" />)}
            {book.is_digital ? <Chip label="Digital" size="small" /> : <Chip label="Physical" size="small" />}
            {!book.is_digital && <Chip label={`Available: ${book.available_copies}`} size="small" />}
            {book.is_digital && <Chip label={`Price: $${book.price}`} size="small" />}
          </Stack>

          {book.description && (
            <Typography variant="body2" sx={{ mt: 2 }}>{book.description}</Typography>
          )}
        </CardContent>

        <CardActions>
          <Button component={RouterLink} to="/books">Back</Button>

          {user && !book.is_digital && (
            <Button variant="contained" onClick={reserve} disabled={book.available_copies <= 0}>
              Reserve
            </Button>
          )}

          {user && book.is_digital && (
            <>
              <Button variant="contained" onClick={buy}>Buy (Mock)</Button>
              <Button onClick={() => navigate(`/reader/${book.id}`)}>Read</Button>
              <Button onClick={download}>Download</Button>
            </>
          )}

          {!user && (
            <Button component={RouterLink} to="/login" variant="contained">
              Login to continue
            </Button>
          )}
        </CardActions>
      </Card>
    </Box>
  )
}
