import { UserVariable } from 'src/logic/safe/api/digitalTwinApi'
import local from 'src/utils/storage/local'

export const VARIABLES_DASHBOARD = 'VARIABLES_DASHBOARD'

const TX_COUNT_WEIGHT = 2
const OPEN_COUNT_WEIGHT = 1
const PINNED_WEIGHT = 10

export type VariableTrackData = {
  [safeVariableId: string]: {
    timestamp: number
    openCount: number
    txCount: number
  }
}

export const getVariablesUsageData = (): VariableTrackData => {
  return local.getItem<VariableTrackData>(VARIABLES_DASHBOARD) || {}
}

export const trackUserVariableOpenCount = (id: UserVariable['id']): void => {
  const trackData = getVariablesUsageData()
  const currentOpenCount = trackData[id]?.openCount || 0
  const currentTxCount = trackData[id]?.txCount || 0

  local.setItem(VARIABLES_DASHBOARD, {
    ...trackData,
    [id]: {
      timestamp: Date.now(),
      openCount: currentOpenCount + 1,
      txCount: currentTxCount,
    },
  })
}

export const trackUserVariableTxCount = (id: UserVariable['id']): void => {
  const trackData = getVariablesUsageData()
  const currentTxCount = trackData[id]?.txCount || 0

  local.setItem(VARIABLES_DASHBOARD, {
    ...trackData,
    // The object contains the openCount when we are creating a transaction
    [id]: { ...trackData[id], txCount: currentTxCount + 1 },
  })
}

// https://stackoverflow.com/a/55212064
const normalizeBetweenTwoRanges = (
  val: number,
  minVal: number,
  maxVal: number,
  newMin: number,
  newMax: number,
): number => {
  return newMin + ((val - minVal) * (newMax - newMin)) / (maxVal - minVal)
}

export const rankUserVariables = (variables: VariableTrackData, pinnedUserVariables: UserVariable[]): string[] => {
  const variablesWithScore = computeTrackedUserVariablesScore(variables)

  for (const variable of pinnedUserVariables) {
    if (variablesWithScore[variable.id]) {
      variablesWithScore[variable.id] += PINNED_WEIGHT
    } else {
      variablesWithScore[variable.id] = PINNED_WEIGHT
    }
  }

  return Object.entries(variablesWithScore)
    .sort((a, b) => b[1] - a[1])
    .map((variable) => variable[0])
}

export const computeTrackedUserVariablesScore = (variables: VariableTrackData): Record<string, number> => {
  const scoredVariables: Record<string, number> = {}

  const sortedByTimestamp = Object.entries(variables).sort((a, b) => {
    return a[1].timestamp - b[1].timestamp
  })

  for (const [idx, variable] of sortedByTimestamp.entries()) {
    // UNIX Timestamps add too much weight, so we normalize by uniformly distributing them to range [1..2]
    const timeMultiplier = normalizeBetweenTwoRanges(idx, 0, sortedByTimestamp.length, 1, 2)

    scoredVariables[variable[0]] =
      (TX_COUNT_WEIGHT * variable[1].txCount + OPEN_COUNT_WEIGHT * variable[1].openCount) * timeMultiplier
  }

  return scoredVariables
}
