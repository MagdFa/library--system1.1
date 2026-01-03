import React, { useEffect, useMemo, useState } from 'react'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import {
  Alert, Box, Button, Card, CardActions, CardContent, Chip, CircularProgress,
  FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography
} from '@mui/material'
import { apiFetch } from '../api/http.js'
import { useAuth } from '../state/AuthContext.jsx'

function useQueryParams() {
  const { search } = useLocation()
  return useMemo(() => new URLSearchParams(search), [search])
}

export default function BooksPage() {
  const params = useQueryParams()
  const { user } = useAuth()

  const [categories, setCategories] = useState([])
  const [books, setBooks] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [q, setQ] = useState(params.get('q') || '')
  const [categoryId, setCategoryId] = useState(params.get('category_id') || '')
  const [availableOnly, setAvailableOnly] = useState(params.get('available_only') === 'true')
  const [digitalOnly, setDigitalOnly] = useState(params.get('digital_only') === 'true')

  async function load() {
    setError('')
    setLoading(true)
    try {
      const [cats, data] = await Promise.all([
        apiFetch('/categories'),
        apiFetch(`/books?${new URLSearchParams({
          ...(q ? { q } : {}),
          ...(categoryId ? { category_id: categoryId } : {}),
          ...(availableOnly ? { available_only: 'true' } : {}),
          ...(digitalOnly ? { digital_only: 'true' } : {}),
        }).toString()}`),
      ])
      setCategories(cats)
      setBooks(data)
    } catch (e) {
      setError(e.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, []) // initial load

  async function reserve(bookId) {
    setError('')
    try {
      await apiFetch('/reservations', {
        method: 'POST',
        body: JSON.stringify({ book_id: bookId }),
      })
      setError('')
      alert('Reservation created.')
    } catch (e) {
      setError(e.message)
    }
  }

  async function buy(bookId) {
    setError('')
    try {
      const order = await apiFetch('/orders', {
        method: 'POST',
        body: JSON.stringify({ items: [{ book_id: bookId }] }),
      })
      await apiFetch('/payments/checkout', {
        method: 'POST',
        body: JSON.stringify({ order_id: order.id, provider: 'mock' }),
      })
      alert('Purchase successful (mock). You can now download the ebook.')
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Books</Typography>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="Search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <FormControl sx={{ minWidth: 220 }}>
              <InputLabel>Category</InputLabel>
              <Select label="Category" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <MenuItem value="">All</MenuItem>
                {categories.map((c) => (
                  <MenuItem key={c.id} value={String(c.id)}>{c.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 180 }}>
              <InputLabel>Availability</InputLabel>
              <Select label="Availability" value={availableOnly ? 'available' : 'all'} onChange={(e) => setAvailableOnly(e.target.value === 'available')}>
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="available">Available only</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 180 }}>
              <InputLabel>Type</InputLabel>
              <Select label="Type" value={digitalOnly ? 'digital' : 'all'} onChange={(e) => setDigitalOnly(e.target.value === 'digital')}>
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="digital">Digital only</MenuItem>
              </Select>
            </FormControl>
            <Button variant="contained" onClick={load}>Apply</Button>
          </Stack>
        </CardContent>
      </Card>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading && <CircularProgress />}

      {books?.data?.length === 0 && (
        <Alert severity="info">No books found.</Alert>
      )}

      <Stack spacing={2}>
        {books?.data?.map((b) => (
          <Card key={b.id}>
            <CardContent>
              <Typography variant="h6">{b.title}</Typography>
              <Typography variant="body2" color="text.secondary">{b.author}</Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
                {b.categories?.map((c) => <Chip key={c.id} label={c.name} size="small" />)}
                {b.is_digital ? <Chip label="Digital" size="small" /> : <Chip label="Physical" size="small" />}
                {!b.is_digital && <Chip label={`Available: ${b.available_copies}`} size="small" />}
                {b.is_digital && <Chip label={`Price: $${b.price}`} size="small" />}
              </Stack>
            </CardContent>
            <CardActions>
              <Button component={RouterLink} to={`/books/${b.id}`}>Details</Button>
              {user && !b.is_digital && (
                <Button variant="contained" onClick={() => reserve(b.id)} disabled={b.available_copies <= 0}>
                  Reserve
                </Button>
              )}
              {user && b.is_digital && (
                <Button variant="contained" onClick={() => buy(b.id)}>
                  Buy (Mock)
                </Button>
              )}
            </CardActions>
          </Card>
        ))}
      </Stack>
    </Box>
  )
}
