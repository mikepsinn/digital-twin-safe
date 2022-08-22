import { getUserVariables, UserVariable } from './digitalTwinApi'

export const fetchUserVariablesList = async (): Promise<UserVariable[]> => {
  return getUserVariables()
}
