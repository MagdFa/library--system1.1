import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Button, Card, CardContent, TextField, Typography } from '@mui/material'

export default function HomePage() {
  const [q, setQ] = useState('')
  const navigate = useNavigate()

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Card>
        <CardContent>
          <Typography variant="h4" gutterBottom>Search the library</Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Browse books as a guest, or sign in to reserve, borrow, and purchase digital books.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Search by title, author, ISBN"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') navigate(`/books?q=${encodeURIComponent(q)}`) }}
            />
            <Button variant="contained" onClick={() => navigate(`/books?q=${encodeURIComponent(q)}`)}>
              Search
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
