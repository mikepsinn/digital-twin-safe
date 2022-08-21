export function getAccessToken(): string | null {
  const queryParams = new URLSearchParams(window.location.search)
  let accessToken = queryParams.get('accessToken')
  if (accessToken) {
    localStorage.setItem('accessToken', accessToken)
  } else {
    accessToken = localStorage.getItem('accessToken')
  }
  return accessToken && accessToken.length > 0 ? accessToken : null
}

function getUrl(path: string, params?: any) {
  const urlObj = new URL('https://app.quantimo.do' + path)
  urlObj.searchParams.append('clientId', 'quantimodo')
  if (params) {
    for (const key in params) {
      urlObj.searchParams.append(key, params[key])
    }
  }
  return urlObj.href
}

export const getRequest = async (path: string, params?: any) => {
  debugger
  const options = {
    method: 'GET',
    headers: { Accept: 'application/json' },
  }
  const accessToken = getAccessToken()
  if (accessToken) {
    options.headers['Authorization'] = `Bearer ${accessToken}`
  }
  const response = await fetch(getUrl(path, params), options)
  if (!response.ok) {
    return { status: 0, result: [] }
  }
  return response.json()
}

export const getDataSources = async (): Promise<any> => {
  return getRequest('/api/v3/connectors/list', { final_callback_url: window.location.href })
}
