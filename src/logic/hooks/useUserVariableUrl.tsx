import { useLocation } from 'react-router-dom'
import { useCallback } from 'react'
import { sanitizeUrl } from 'src/utils/sanitizeUrl'

type VariableUrlReturnType = {
  getVariableUrl: () => string
}

export const useUserVariableUrl = (): VariableUrlReturnType => {
  const { search } = useLocation()

  const getVariableUrl = useCallback(() => {
    const query = new URLSearchParams(search)
    try {
      const url = query.get('variableUrl')

      return sanitizeUrl(url)
    } catch {
      throw new Error('Detected javascript injection in the URL. Check the variableUrl parameter')
    }
  }, [search])

  return {
    getVariableUrl,
  }
}
