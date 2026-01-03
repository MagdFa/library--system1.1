import React, { useEffect, useState } from 'react'
import { Alert, Box, Button, Card, CardContent, CircularProgress, Stack, Typography } from '@mui/material'
import { apiFetch } from '../api/http.js'

export default function MyReservationsPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    setError('')
    setLoading(true)
    try {
      const res = await apiFetch('/reservations')
      setData(res)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function cancel(id) {
    setError('')
    try {
      await apiFetch(`/reservations/${id}`, { method: 'DELETE' })
      await load()
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>My Reservations</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading && <CircularProgress />}

      <Stack spacing={2}>
        {data?.data?.map((r) => (
          <Card key={r.id}>
            <CardContent>
              <Typography variant="h6">{r.book?.title}</Typography>
              <Typography variant="body2" color="text.secondary">{r.book?.author}</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Status: <b>{r.status}</b> {r.reserved_until ? `(until ${new Date(r.reserved_until).toLocaleString()})` : ''}
              </Typography>
              {(r.status === 'pending' || r.status === 'approved') && (
                <Button sx={{ mt: 1 }} onClick={() => cancel(r.id)}>Cancel</Button>
              )}
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  )
}
