import { Loader, TextField } from '@gnosis.pm/safe-react-components'
import { useState, ReactElement, useCallback, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'
import { UserVariable } from 'src/logic/safe/api/digitalTwinApi'
import GnoForm from 'src/components/forms/GnoForm'
import Img from 'src/components/layout/Img'
import { Modal } from 'src/components/Modal'
import VariableAgreement from './VariableAgreement'
import VariableUrl, { VariableInfoUpdater, variableUrlResolver } from './VariableUrl'
import { FormButtons } from './FormButtons'
import { getEmptyUserVariable } from 'src/routes/safe/components/Variables/utils'
import { Errors, logError } from 'src/logic/exceptions/CodedException'
import { generateSafeRoute, extractPrefixedSafeAddress, SAFE_ROUTES } from 'src/routes/routes'
import { trackEvent } from 'src/utils/googleTagManager'
import { SAFE_VARIABLES_EVENTS } from 'src/utils/events/safeVariables'

const FORM_ID = 'add-apps-form'

const StyledTextFileVariableName = styled(TextField)`
  && {
    width: 385px;
    .MuiFormLabel-root {
      &.Mui-disabled {
        color: rgba(0, 0, 0, 0.54);
        &.Mui-error {
          color: ${(props) => props.theme.colors.error};
        }
      }
    }
    .MuiInputBase-root {
      .MuiFilledInput-input {
        color: rgba(0, 0, 0, 0.54);
      }
      &:before {
        border-bottom-style: inset;
      }
    }
  }
`

const VariableInfo = styled.div`
  display: flex;
  margin: 36px 0 24px 0;

  img {
    margin-right: 10px;
  }
`

const WrapperLoader = styled.div`
  height: 55px;
  width: 65px;
  display: flex;
  align-items: center;
  justify-content: center;
`

const StyledLoader = styled(Loader)`
  margin-right: 15px;
`

interface AddVariableFormValues {
  variableUrl: string
  agreementAccepted: boolean
}

const INITIAL_VALUES: AddVariableFormValues = {
  variableUrl: '',
  agreementAccepted: false,
}

const DEFAULT_VARIABLE_INFO = getEmptyUserVariable()

interface AddVariableProps {
  variableList: UserVariable[]
  closeModal: () => void
  onAddVariable: (app: UserVariable) => void
}

const AddVariable = ({ variableList, closeModal, onAddVariable }: AddVariableProps): ReactElement => {
  const [variableInfo, setVariableInfo] = useState<UserVariable>(DEFAULT_VARIABLE_INFO)
  const [fetchError, setFetchError] = useState<string | undefined>()
  const history = useHistory()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = useCallback(async () => {
    trackEvent(SAFE_VARIABLES_EVENTS.ADD_CUSTOM_VARIABLE)
    onAddVariable(variableInfo)
    history.push({
      pathname: generateSafeRoute(SAFE_ROUTES.APPS, extractPrefixedSafeAddress()),
      search: `?variableUrl=${encodeURIComponent(variableInfo.url)}`,
    })
  }, [history, variableInfo, onAddVariable])

  useEffect(() => {
    if (isLoading) {
      setFetchError(undefined)
    }
  }, [isLoading])

  const onError = useCallback(
    (error: Error) => {
      setFetchError(error.message)
      logError(Errors._903, error.message)
      setVariableInfo(DEFAULT_VARIABLE_INFO)
    },
    [setVariableInfo],
  )

  return (
    <GnoForm decorators={[variableUrlResolver]} initialValues={INITIAL_VALUES} onSubmit={handleSubmit} testId={FORM_ID}>
      {() => (
        <>
          <Modal.Body>
            <VariableUrl variableList={variableList} />
            {/* Fetch app from url and return a UserVariable */}
            <VariableInfoUpdater onVariableInfo={setVariableInfo} onLoading={setIsLoading} onError={onError} />
            <VariableInfo>
              {isLoading ? (
                <WrapperLoader>
                  <StyledLoader size="sm" />
                </WrapperLoader>
              ) : (
                <Img alt="Token image" width={55} src={variableInfo.imageUrl} />
              )}
              <StyledTextFileVariableName
                label="UserVariable name"
                disabled
                meta={{ error: fetchError }}
                value={
                  isLoading ? 'Loading...' : variableInfo.name === DEFAULT_VARIABLE_INFO.name ? '' : variableInfo.name
                }
                onChange={() => {}}
              />
            </VariableInfo>
            <VariableAgreement />
          </Modal.Body>
          <Modal.Footer>
            <FormButtons variableInfo={variableInfo} onCancel={closeModal} />
          </Modal.Footer>
        </>
      )}
    </GnoForm>
  )
}

export default AddVariable
