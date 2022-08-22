import { useMemo } from 'react'
import Fuse from 'fuse.js'
import { UserVariable } from 'src/logic/safe/api/digitalTwinApi'

const useVariablesSearch = (variables: UserVariable[], searchText: string): UserVariable[] => {
  const fuse = useMemo(
    () =>
      new Fuse(variables, {
        keys: ['name', 'description'],
        // https://fusejs.io/api/options.html#threshold
        // Very naive explanation: threshold represents how accurate the search results should be. The default is 0.6
        // I tested it and found it to make the search results more accurate when the threshold is 0.2
        // 0 - 1, where 0 is the exact match and 1 matches anything
        threshold: 0.2,
        findAllMatches: true,
      }),
    [variables],
  )

  const results = useMemo(
    () => (searchText ? fuse.search(searchText).map((result) => result.item) : variables),
    [fuse, variables, searchText],
  )

  return results
}

export { useVariablesSearch }
