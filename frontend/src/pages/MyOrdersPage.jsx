import React, { useEffect, useState } from 'react'
import { Alert, Box, Card, CardContent, CircularProgress, Stack, Typography } from '@mui/material'
import { apiFetch } from '../api/http.js'

export default function MyOrdersPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    setError('')
    setLoading(true)
    try {
      const res = await apiFetch('/orders')
      setData(res)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <Box>
      <Typography variant="h4" gutterBottom>My Orders</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading && <CircularProgress />}

      <Stack spacing={2}>
        {data?.data?.map((o) => (
          <Card key={o.id}>
            <CardContent>
              <Typography variant="h6">Order #{o.id}</Typography>
              <Typography variant="body2">Status: <b>{o.status}</b></Typography>
              <Typography variant="body2">Total: ${o.total_amount}</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>Items:</Typography>
              <ul>
                {o.items?.map((it) => (
                  <li key={it.id}>
                    {it.book?.title} (${it.unit_price})
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  )
}
