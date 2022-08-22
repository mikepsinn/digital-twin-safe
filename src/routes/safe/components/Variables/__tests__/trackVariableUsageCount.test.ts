import { VariableTrackData, rankUserVariables } from 'src/routes/safe/components/Variables/trackVariableUsageCount'
import { UserVariable } from 'src/logic/safe/api/digitalTwinApi'

describe('rankTrackedUserVariables', () => {
  it('ranks more recent variables higher', () => {
    const trackedUserVariables: VariableTrackData = {
      '1': {
        timestamp: 1,
        txCount: 1,
        openCount: 1,
      },
      '2': {
        timestamp: 3,
        txCount: 1,
        openCount: 1,
      },
      '3': {
        timestamp: 5,
        txCount: 1,
        openCount: 1,
      },
      '4': {
        timestamp: 2,
        txCount: 1,
        openCount: 1,
      },
    }
    const result = rankUserVariables(trackedUserVariables, [])
    expect(result).toEqual(['3', '2', '4', '1'])
  })

  it('ranks variables by relevancy', () => {
    const trackedUserVariables: VariableTrackData = {
      '1': {
        timestamp: 1,
        txCount: 1,
        openCount: 1,
      },
      '2': {
        timestamp: 4,
        txCount: 4,
        openCount: 6,
      },
      '3': {
        timestamp: 8,
        txCount: 4,
        openCount: 4,
      },
      '4': {
        timestamp: 5,
        txCount: 2,
        openCount: 2,
      },
    }
    const result = rankUserVariables(trackedUserVariables, [])
    expect(result).toEqual(['3', '2', '4', '1'])
  })

  it('includes pinned variables in ranking', () => {
    const trackedUserVariables: VariableTrackData = {
      '1': {
        timestamp: 1,
        txCount: 1,
        openCount: 1,
      },
      '2': {
        timestamp: 4,
        txCount: 4,
        openCount: 6,
      },
      '3': {
        timestamp: 8,
        txCount: 3,
        openCount: 4,
      },
      '4': {
        timestamp: 5,
        txCount: 2,
        openCount: 2,
      },
    }

    const pinnedVariables: UserVariable[] = [
      {
        id: 5,
        variableId: 0,
        userId: 0,
        url: '',
        name: '',
        imageUrl: '',
        description: '',
        tags: [],
      },
    ]

    const result = rankUserVariables(trackedUserVariables, pinnedVariables)
    expect(result).toEqual(['2', '3', '5', '4', '1'])
  })
})
