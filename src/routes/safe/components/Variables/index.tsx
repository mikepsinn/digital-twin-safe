import { useUserVariableUrl } from 'src/logic/hooks/useUserVariableUrl'
import VariablesList from 'src/routes/safe/components/Variables/components/VariablesList'
import UserVariablesErrorBoundary from 'src/routes/safe/components/Variables/components/UserVariablesErrorBoundary'
import UserVariablesLoadError from 'src/routes/safe/components/Variables/components/UserVariablesLoadError'
import AppFrame from '../Apps/components/AppFrame'

const Variables = (): React.ReactElement => {
  //debugger
  const { getVariableUrl } = useUserVariableUrl()
  const url = getVariableUrl()
  if (url) {
    return (
      <UserVariablesErrorBoundary render={() => <UserVariablesLoadError />}>
        <AppFrame appUrl={url} />
      </UserVariablesErrorBoundary>
    )
  } else {
    return <VariablesList />
  }
}

export default Variables
