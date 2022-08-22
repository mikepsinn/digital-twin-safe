import { ReactElement } from 'react'
import { Text } from '@gnosis.pm/safe-react-components'
import { Box, Grid } from '@material-ui/core'

import styled from 'styled-components'
import { Card, WidgetBody, WidgetContainer, WidgetTitle } from 'src/components/Dashboard/styled'
import { getRapini } from '../../../logic/safe/api/digitalTwinApi'

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

export const FeaturedDataSources = (): ReactElement | null => {
  const { queries } = getRapini()

  const { data, isLoading, isLoadingError } = queries.useGetConnectors()

  if (!data || isLoadingError) return null

  const connectors = data.connectors

  if (!connectors) return null

  if (!connectors.length && !isLoading) return null

  const urls = {}
  connectors.forEach((connector) => {
    if (connector.buttons && connector.buttons.length) {
      connector.buttons.forEach((button) => {
        urls[connector.name] = button.link
      })
    }
  })

  return (
    <Grid item xs={12} md>
      <WidgetContainer id="featured-data-sources">
        <WidgetTitle>Import Your Data</WidgetTitle>
        <WidgetBody>
          <StyledGrid container>
            {connectors.map((dataSource) => (
              <StyledGridItem item xs md key={dataSource.id}>
                <a href={urls[dataSource.name]} style={{ textDecoration: 'none' }}>
                  <Card>
                    <Grid container alignItems="center" spacing={3}>
                      <Grid item xs={12} md={3}>
                        <StyledImage src={dataSource.image} alt={dataSource.name} />
                      </Grid>
                      <Grid item xs={12} md={9}>
                        <Box mb={1.01}>
                          <Text size="xl">{dataSource.longDescription}</Text>
                        </Box>
                        <Text color="primary" size="lg" strong>
                          Import {dataSource.displayName}
                        </Text>
                      </Grid>
                    </Grid>
                  </Card>
                </a>
              </StyledGridItem>
            ))}
          </StyledGrid>
        </WidgetBody>
      </WidgetContainer>
    </Grid>
  )
}
