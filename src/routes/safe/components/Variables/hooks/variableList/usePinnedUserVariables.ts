import { useState, useEffect } from 'react'
import { loadFromStorage, saveToStorage } from 'src/utils/storage'
import { PINNED_SAFE_VARIABLE_IDS } from '../../utils'
import { FETCH_STATUS } from 'src/utils/requests'
import { UserVariable } from 'src/logic/safe/api/digitalTwinApi'

type ReturnType = {
  pinnedUserVariableIds: string[]
  loaded: boolean
  updatePinnedUserVariables: (newPinnedUserVariableIds: string[]) => void
}

const usePinnedUserVariables = (
  remoteUserVariables: UserVariable[],
  remoteVariablesFetchStatus: FETCH_STATUS,
): ReturnType => {
  const [pinnedUserVariableIds, updatePinnedUserVariables] = useState<string[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const loadPinnedVariableIds = () => {
      const pinnedVariableIds = loadFromStorage<string[]>(PINNED_SAFE_VARIABLE_IDS) || []

      const isRemoteUserVariablesListLoaded = remoteVariablesFetchStatus === FETCH_STATUS.SUCCESS
      if (isRemoteUserVariablesListLoaded) {
        // we remove pinned Safe Variables that are not included in the remote list, see #2847
        const filteredPinnedVariablesIds = pinnedVariableIds.filter((pinnedVariableId) =>
          remoteUserVariables.some((variable) => variable.id.toString() === pinnedVariableId),
        )
        updatePinnedUserVariables(filteredPinnedVariablesIds)
        setLoaded(true)
      }
    }

    loadPinnedVariableIds()
  }, [remoteVariablesFetchStatus, remoteUserVariables])

  // we only update pinned variables in the localStorage when remote Variables are loaded
  useEffect(() => {
    const isRemoteUserVariablesListLoaded = remoteVariablesFetchStatus === FETCH_STATUS.SUCCESS
    if (isRemoteUserVariablesListLoaded) {
      saveToStorage(PINNED_SAFE_VARIABLE_IDS, pinnedUserVariableIds)
    }
  }, [pinnedUserVariableIds, remoteVariablesFetchStatus])

  return { pinnedUserVariableIds, loaded, updatePinnedUserVariables }
}

export { usePinnedUserVariables }
