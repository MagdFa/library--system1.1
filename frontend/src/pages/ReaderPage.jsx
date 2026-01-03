import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Alert, Box, CircularProgress, Typography } from '@mui/material'
import { apiFetch } from '../api/http.js'

export default function ReaderPage() {
  const { id } = useParams()
  const [blobUrl, setBlobUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let revoked = false
    async function load() {
      setError('')
      setLoading(true)
      try {
        // First check permissions via read endpoint
        await apiFetch(`/books/${id}/read`, { method: 'POST' })

        // Then stream the file as a blob (Bearer token is required)
        const res = await apiFetch(`/books/${id}/download?stream=1`, { method: 'GET' })
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        if (!revoked) setBlobUrl(url)
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()

    return () => {
      revoked = true
      if (blobUrl) URL.revokeObjectURL(blobUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  if (loading) return <CircularProgress />
  if (error) return <Alert severity="error">{error}</Alert>
  if (!blobUrl) return null

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Reader</Typography>
      <Box sx={{ border: '1px solid', borderColor: 'divider', height: '80vh' }}>
        <iframe title="ebook-reader" src={blobUrl} style={{ width: '100%', height: '100%', border: 0 }} />
      </Box>
    </Box>
  )
}
