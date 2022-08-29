import { ReactElement } from 'react'
import { Text } from '@gnosis.pm/safe-react-components'
import { Box, Grid } from '@material-ui/core'

import styled from 'styled-components'
import { Card, WidgetBody, WidgetContainer, WidgetTitle } from 'src/components/Dashboard/styled'
import { getAccessToken, digitalTwinApi } from '../../../logic/safe/api/digitalTwinApi'
import { GENERIC_APPS_ROUTE } from 'src/routes/routes'
import { Link } from 'react-router-dom'

const StyledImage = styled.img`
  width: 64px;
  height: 64px;
`

const StyledGrid = styled(Grid)`
  gap: 24px;
`

const StyledGridItem = styled(Grid)`
  min-width: 300px;
`
const StyledLink = styled(Link)`
  text-decoration: none;
`

export const MeasurementList = (): ReactElement | null => {
  const { queries } = digitalTwinApi()

  const { data, isLoading, isLoadingError } = queries.useGetMeasurements()

  if (!data || isLoadingError) return null

  const measurements = data

  if (!measurements) return null

  if (!measurements.length && !isLoading) return null

  return (
    <Grid item xs={12} md>
      <WidgetContainer id="featured-safe-apps">
        <WidgetTitle>Recent Measurements</WidgetTitle>
        <WidgetBody>
          <StyledGrid container>
            {measurements.map((measurement) => (
              <StyledGridItem item xs md key={measurement.id}>
                <StyledLink
                  to={GENERIC_APPS_ROUTE + '?appUrl=' + measurement.url + '&accessToken=' + getAccessToken()}
                  style={{ textDecoration: 'none' }}
                >
                  <Card>
                    <Grid container alignItems="center" spacing={3}>
                      <Grid item xs={12} md={3}>
                        <StyledImage src={measurement.pngPath} alt={measurement.displayValueAndUnitString} />
                      </Grid>
                      <Grid item xs={12} md={9}>
                        <Box mb={1.01}>
                          <Text size="xl">
                            {measurement.displayValueAndUnitString + ' ' + measurement.variableName}
                          </Text>
                        </Box>
                        <Text color="primary" size="lg" strong>
                          Edit Measurement
                        </Text>
                      </Grid>
                    </Grid>
                  </Card>
                </StyledLink>
              </StyledGridItem>
            ))}
          </StyledGrid>
        </WidgetBody>
      </WidgetContainer>
    </Grid>
  )
}
export default MeasurementList
