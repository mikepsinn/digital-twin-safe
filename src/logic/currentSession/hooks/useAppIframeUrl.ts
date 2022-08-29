import { useSelector } from 'react-redux'
import { currentSession } from '../store/selectors'
import { generateSafeRoute, SAFE_ROUTES } from '../../../routes/routes'

const useAppIframeUrl = (iframeUrl: string): string => {
  const { currentShortName, currentSafeAddress } = useSelector(currentSession)
  const appsPath = generateSafeRoute(SAFE_ROUTES.APPS, {
    shortName: currentShortName,
    safeAddress: currentSafeAddress,
  })
  return `${appsPath}?appUrl=` + encodeURIComponent(iframeUrl)
}

export default useAppIframeUrl
