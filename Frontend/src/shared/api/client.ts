type ApiClientOptions = RequestInit

export async function apiClient<T = unknown>(path: string, options: ApiClientOptions = {}): Promise<T | string> {
  const response = await fetch(path, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`)
  }

  const contentType = response.headers.get('content-type') || ''
  return contentType.includes('application/json') ? ((await response.json()) as T) : response.text()
}