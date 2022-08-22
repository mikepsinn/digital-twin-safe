import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { logError, Errors } from 'src/logic/exceptions/CodedException'
import { showNotification } from 'src/logic/notifications/store/notifications'
import { NOTIFICATIONS } from 'src/logic/notifications'
import { FETCH_STATUS } from 'src/utils/requests'
import { UserVariable } from 'src/logic/safe/api/digitalTwinApi'
import { fetchUserVariablesList } from 'src/logic/safe/api/fetchUserVariables'

type ReturnType = {
  remoteUserVariables: UserVariable[]
  status: FETCH_STATUS
}

// Memoize the fetch request so that simulteneous calls
// to this function return the same promise
let fetchPromise: Promise<UserVariable[]> | null = null
const memoizedFetchUserVariables = (): Promise<UserVariable[]> => {
  if (!fetchPromise) {
    fetchPromise = fetchUserVariablesList()
  }
  fetchPromise.finally(() => (fetchPromise = null))
  return fetchPromise
}

const useRemoteUserVariables = (): ReturnType => {
  const [remoteUserVariables, setRemoteUserVariables] = useState<UserVariable[]>([])
  const [status, setStatus] = useState<FETCH_STATUS>(FETCH_STATUS.NOT_ASKED)
  const dispatch = useDispatch()

  useEffect(() => {
    const loadVariablesList = async () => {
      setStatus(FETCH_STATUS.LOADING)
      try {
        const result = await memoizedFetchUserVariables()

        if (result?.length) {
          setRemoteUserVariables(result)
          setStatus(FETCH_STATUS.SUCCESS)
        } else {
          throw new Error('Empty variables array 🤬')
        }
      } catch (e) {
        setStatus(FETCH_STATUS.ERROR)
        logError(Errors._902, e.message)
        dispatch(showNotification(NOTIFICATIONS.SAFE_VARIABLES_FETCH_ERROR_MSG))
      }
    }

    loadVariablesList()
  }, [dispatch])

  return { remoteUserVariables, status }
}

export { useRemoteUserVariables }
