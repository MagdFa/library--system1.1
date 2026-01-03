import React, { useState } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import { Alert, Box, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material'
import { useAuth } from '../state/AuthContext.jsx'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('user@library.local')
  const [password, setPassword] = useState('Password123!')
  const [error, setError] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      await login(email, password)
      navigate('/')
    } catch (e2) {
      setError(e2.message)
    }
  }

  return (
    <Box sx={{ maxWidth: 520, mx: 'auto' }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>Login</Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Box component="form" onSubmit={onSubmit}>
            <Stack spacing={2}>
              <TextField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <Button type="submit" variant="contained">Login</Button>
              <Button component={RouterLink} to="/register">Create an account</Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
