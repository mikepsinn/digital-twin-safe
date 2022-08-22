import { useCallback, useMemo } from 'react'

import { UserVariable } from 'src/logic/safe/api/digitalTwinApi'
import { useRemoteUserVariables } from './useRemoteUserVariables'
import { usePinnedUserVariables } from './usePinnedUserVariables'
import { FETCH_STATUS } from 'src/utils/requests'
import { trackEvent } from 'src/utils/googleTagManager'
import { SAFE_VARIABLES_EVENTS } from 'src/utils/events/safeVariables'
import { isSameUrl } from '../../utils'

type UseVariableListReturnType = {
  allVariables: UserVariable[]
  variableList: UserVariable[]
  pinnedUserVariables: UserVariable[]
  togglePin: (variable: UserVariable) => void
  isLoading: boolean
  getUserVariable: (url: string) => UserVariable | undefined
}

const useVariableList = (): UseVariableListReturnType => {
  const { remoteUserVariables, status: remoteVariablesFetchStatus } = useRemoteUserVariables()
  const { pinnedUserVariableIds, updatePinnedUserVariables } = usePinnedUserVariables(
    remoteUserVariables,
    remoteVariablesFetchStatus,
  )
  const remoteIsLoading = remoteVariablesFetchStatus === FETCH_STATUS.LOADING

  const allVariables = useMemo(() => {
    const allVariables = [...remoteUserVariables]
    return allVariables.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
  }, [remoteUserVariables])

  const variableList = useMemo(() => {
    return remoteUserVariables.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))
  }, [remoteUserVariables])

  const pinnedUserVariables = useMemo(
    () => variableList.filter((variable) => pinnedUserVariableIds.includes(variable.id.toString())),
    [pinnedUserVariableIds, variableList],
  )

  const togglePin = useCallback(
    (variable: UserVariable): void => {
      const { id: variableId, name: variableName } = variable
      const newPinnedIds = [...pinnedUserVariableIds]
      const isVariablePinned = pinnedUserVariableIds.includes(variableId.toString())

      if (isVariablePinned) {
        trackEvent({ ...SAFE_VARIABLES_EVENTS.UNPIN, label: variableName })
        newPinnedIds.splice(newPinnedIds.indexOf(variableId.toString()), 1)
      } else {
        trackEvent({ ...SAFE_VARIABLES_EVENTS.PIN, label: variableName })
        newPinnedIds.push(variableId.toString())
      }

      updatePinnedUserVariables(newPinnedIds)
    },
    [updatePinnedUserVariables, pinnedUserVariableIds],
  )

  const getUserVariable = useCallback(
    (url: string): UserVariable | undefined => {
      const urlInstance = new URL(url)
      const safeVariableUrl = `${urlInstance.hostname}/${urlInstance.pathname}`

      return variableList.find((variable: UserVariable) => {
        const variableUrlInstance = new URL(variable?.url)

        if (isSameUrl(`${variableUrlInstance?.hostname}/${variableUrlInstance?.pathname}`, safeVariableUrl)) {
          return variable
        }
      })
    },
    [variableList],
  )

  return {
    allVariables,
    variableList,
    pinnedUserVariables,
    togglePin,
    isLoading: remoteIsLoading,
    getUserVariable,
  }
}

export { useVariableList }
