import React, { useEffect, useState } from 'react'
import { Alert, Box, Card, CardContent, CircularProgress, Stack, Typography } from '@mui/material'
import { apiFetch } from '../api/http.js'

export default function MyLoansPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    setError('')
    setLoading(true)
    try {
      const res = await apiFetch('/loans')
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
      <Typography variant="h4" gutterBottom>My Loans</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading && <CircularProgress />}

      <Stack spacing={2}>
        {data?.data?.map((l) => (
          <Card key={l.id}>
            <CardContent>
              <Typography variant="h6">{l.book?.title}</Typography>
              <Typography variant="body2" color="text.secondary">{l.book?.author}</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Status: <b>{l.status}</b>
              </Typography>
              <Typography variant="body2">
                Borrowed: {l.borrowed_at ? new Date(l.borrowed_at).toLocaleString() : '-'}
              </Typography>
              <Typography variant="body2">
                Due: {l.due_at ? new Date(l.due_at).toLocaleString() : '-'}
              </Typography>
              {l.returned_at && (
                <Typography variant="body2">
                  Returned: {new Date(l.returned_at).toLocaleString()}
                </Typography>
              )}
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  )
}
