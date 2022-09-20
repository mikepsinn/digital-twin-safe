import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { logError, Errors } from 'src/logic/exceptions/CodedException'
import { showNotification } from 'src/logic/notifications/store/notifications'
import { NOTIFICATIONS } from 'src/logic/notifications'
import { FETCH_STATUS } from 'src/utils/requests'
import { fetchDataGemsList } from 'src/logic/safe/api/fetchDataGems'
import { NFTToken } from 'src/logic/collectibles/sources/collectibles'

type ReturnType = {
  dataGemNftTokens: NFTToken[]
  status: FETCH_STATUS
}

// Memoize the fetch request so that simulteneous calls
// to this function return the same promise
let fetchPromise: Promise<NFTToken[]> | null = null
const memoizedFetchDataGems = (): Promise<NFTToken[]> => {
  if (!fetchPromise) {
    fetchPromise = fetchDataGemsList()
  }
  fetchPromise.finally(() => (fetchPromise = null))
  return fetchPromise
}

const useDataGemNftTokens = (): ReturnType => {
  const [dataGemNftTokens, setDataGemNftTokens] = useState<NFTToken[]>([])
  const [status, setStatus] = useState<FETCH_STATUS>(FETCH_STATUS.NOT_ASKED)
  const dispatch = useDispatch()

  useEffect(() => {
    const loadDataGemsList = async () => {
      setStatus(FETCH_STATUS.LOADING)
      try {
        const result = await memoizedFetchDataGems()

        if (result?.length) {
          setDataGemNftTokens(result)
          setStatus(FETCH_STATUS.SUCCESS)
        } else {
          throw new Error('Empty dataGemNftTokens array 🤬')
        }
      } catch (e) {
        setStatus(FETCH_STATUS.ERROR)
        logError(Errors._902, e.message)
        dispatch(showNotification(NOTIFICATIONS.SAFE_DATA_GEMS_FETCH_ERROR_MSG))
      }
    }

    loadDataGemsList()
  }, [dispatch])

  return { dataGemNftTokens: dataGemNftTokens, status }
}

export { useDataGemNftTokens }
