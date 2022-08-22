import { ReactElement, useMemo } from 'react'
import styled from 'styled-components'
import Skeleton from '@material-ui/lab/Skeleton/Skeleton'
import { Text } from '@gnosis.pm/safe-react-components'
import { Box } from '@material-ui/core'
import { Card, WidgetBody, WidgetContainer, WidgetTitle, ViewAllLink } from 'src/components/Dashboard/styled'
import NoTransactionsImage from 'src/routes/safe/components/Transactions/TxList/assets/no-transactions.svg'
import Img from 'src/components/layout/Img'
import { getAccessToken, getRapini, Measurement } from '../../../logic/safe/api/digitalTwinApi'
import MeasurementListItem from './MeasurementListItem'

const SkeletonWrapper = styled.div`
  border-radius: 8px;
  overflow: hidden;
`

const StyledList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
`

const StyledWidgetTitle = styled.div`
  display: flex;
  justify-content: space-between;
`

const EmptyState = (
  <Card>
    <Box display="flex" alignItems="center" justifyContent="center" flexDirection="column" height={1} gridGap="16px">
      <Img alt="No Transactions yet" src={NoTransactionsImage} />
      <Text size="xl">This Safe has no queued transactions</Text>
    </Box>
  </Card>
)
let measurements: Measurement[] = []
const MeasurementList = ({ size = 5 }: { size?: number }): ReactElement | null => {
  const { queries } = getRapini()

  const { data, isLoading, isLoadingError } = queries.useGetMeasurements()
  if (data) {
    measurements = data
  }

  const LoadingState = useMemo(
    () => (
      <StyledList>
        {Array.from(Array(size).keys()).map((key) => (
          <SkeletonWrapper key={key}>
            <Skeleton variant="rect" height={52} />
          </SkeletonWrapper>
        ))}
      </StyledList>
    ),
    [size],
  )
  if (typeof measurements === 'undefined') {
    measurements = []
  }

  const ResultState = useMemo(
    () => (
      <StyledList>
        {measurements.map((measurement) => (
          <MeasurementListItem
            url={measurement.url}
            key={measurement.id}
            sourceName={measurement.sourceName}
            startTimeString={measurement.startTimeString}
            unitAbbreviatedName={measurement.unitAbbreviatedName}
            value={measurement.value}
            variableName={measurement.variableName}
          />
        ))}
      </StyledList>
    ),
    [],
  )

  const getWidgetBody = () => {
    if (!isLoading) return LoadingState
    if (!measurements.length) return EmptyState
    return ResultState
  }

  if (isLoadingError) {
    console.error(isLoadingError)
    return (
      <WidgetContainer>
        <StyledWidgetTitle>
          <WidgetTitle>Measurements Could Not Be Loaded!</WidgetTitle>
          <ViewAllLink url={'https://app.curedao.org/#/app/history?accessToken=' + getAccessToken()} />
        </StyledWidgetTitle>
        <WidgetBody>{getWidgetBody()}</WidgetBody>
      </WidgetContainer>
    )
  }

  return (
    <WidgetContainer>
      <StyledWidgetTitle>
        <WidgetTitle>Measurements</WidgetTitle>
        <ViewAllLink url={'https://app.curedao.org/#/app/history?accessToken=' + getAccessToken()} />
      </StyledWidgetTitle>
      <WidgetBody>{getWidgetBody()}</WidgetBody>
    </WidgetContainer>
  )
}

export default MeasurementList
