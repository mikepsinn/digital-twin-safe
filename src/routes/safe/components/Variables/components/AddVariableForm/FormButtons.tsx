import { ReactElement, useMemo } from 'react'
import { useFormState } from 'react-final-form'

import { Modal } from 'src/components/Modal'
import { isVariableManifestValid } from 'src/routes/safe/components/Variables/utils'
import { UserVariable } from 'src/logic/safe/api/digitalTwinApi'

interface Props {
  variableInfo: UserVariable
  onCancel: () => void
}

export const FormButtons = ({ variableInfo, onCancel }: Props): ReactElement => {
  const { valid, validating, visited } = useFormState({
    subscription: { valid: true, validating: true, visited: true },
  })

  const isSubmitDisabled = useMemo(() => {
    // if non visited, fields were not evaluated yet. Then, the default value is considered invalid
    const fieldsVisited = visited?.agreementAccepted && visited?.appUrl

    // @ts-expect-error adding this because isVariableManifestValid only checks name and description which are both present in the UserVariable type
    return validating || !valid || !fieldsVisited || !isVariableManifestValid(variableInfo)
  }, [validating, valid, visited, variableInfo])

  return (
    <Modal.Footer.Buttons
      cancelButtonProps={{ onClick: onCancel }}
      confirmButtonProps={{ disabled: isSubmitDisabled, text: 'Add' }}
    />
  )
}
