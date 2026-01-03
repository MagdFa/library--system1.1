const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

export function getApiBaseUrl() {
  return API_BASE_URL
}

function getToken() {
  return localStorage.getItem('token')
}

export async function apiFetch(path, options = {}) {
  const token = getToken()
  const headers = {
    'Accept': 'application/json',
    ...(options.headers || {}),
  }

  // Only set JSON header if body is plain object/string, not FormData
  const isFormData = options.body instanceof FormData
  if (!isFormData && options.body !== undefined && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })

  const contentType = res.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')

  if (!res.ok) {
    const errBody = isJson ? await res.json().catch(() => ({})) : await res.text().catch(() => '')
    const message =
      (errBody && (errBody.message || errBody.error)) ||
      (errBody && errBody.errors && Object.values(errBody.errors).flat().join(' ')) ||
      `Request failed (${res.status})`
    const error = new Error(message)
    error.status = res.status
    error.body = errBody
    throw error
  }

  if (isJson) return res.json()
  return res
}
