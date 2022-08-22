import { useEffect } from 'react'
import { TextField } from '@gnosis.pm/safe-react-components'
import createDecorator from 'final-form-calculate'
import { useField, useFormState } from 'react-final-form'
import styled from 'styled-components'

import { UserVariable } from 'src/logic/safe/api/digitalTwinApi'
import { getVariableInfoFromUrl, getIpfsLinkFromEns, uniqueVariable } from 'src/routes/safe/components/Variables/utils'
import { composeValidators, required } from 'src/components/forms/validator'
import Field from 'src/components/forms/Field'
import { isValidURL } from 'src/utils/url'
import { isValidEnsName } from 'src/logic/wallets/ethAddresses'
import { useDebounce } from 'src/logic/hooks/useDebounce'

const validateUrl = (url: string): string | undefined => (isValidURL(url) ? undefined : 'Invalid URL')

export const variableUrlResolver = createDecorator({
  field: 'variableUrl',
  updates: {
    variableUrl: async (variableUrl: string): Promise<string | undefined> => {
      const ensContent =
        !isValidURL(variableUrl) && isValidEnsName(variableUrl) && (await getIpfsLinkFromEns(variableUrl))

      if (ensContent) {
        return ensContent
      }

      return variableUrl
    },
  },
})

type VariableInfoUpdaterProps = {
  onVariableInfo: (variableInfo: UserVariable) => unknown
  onLoading: (isLoading: boolean) => unknown
  onError: (error: Error) => unknown
}

export const VariableInfoUpdater = ({ onVariableInfo, onLoading, onError }: VariableInfoUpdaterProps): null => {
  const {
    input: { value: variableUrl },
  } = useField('variableUrl', { subscription: { value: true } })

  const debouncedValue = useDebounce(variableUrl, 500)

  useEffect(() => {
    const updateVariableInfo = async () => {
      onLoading(true)

      try {
        const variableInfo = await getVariableInfoFromUrl(debouncedValue)
        onVariableInfo({ ...variableInfo })
      } catch (error) {
        onError?.(error)
      }

      onLoading(false)
    }

    if (isValidURL(debouncedValue)) {
      updateVariableInfo()
    }
  }, [debouncedValue, onVariableInfo, onError, onLoading])

  return null
}

const StyledVariableUrlField = styled(Field)`
  && {
    width: 100%;
  }
`

const VariableUrl = ({ variableList }: { variableList: UserVariable[] }): React.ReactElement => {
  const { visited } = useFormState({ subscription: { visited: true } })

  // trick to prevent having the field validated by default. Not sure why this happens in this form
  const validate = !visited?.variableUrl
    ? undefined
    : composeValidators(required, validateUrl, uniqueVariable(variableList))

  return (
    <StyledVariableUrlField
      label="UserVariable URL"
      name="variableUrl"
      placeholder="UserVariable URL"
      type="text"
      component={TextField}
      validate={validate}
      autoComplete="off"
    />
  )
}

export default VariableUrl
