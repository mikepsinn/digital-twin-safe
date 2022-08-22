import { ReactElement } from 'react'
import { Text } from '@gnosis.pm/safe-react-components'
import { Box, Grid } from '@material-ui/core'

import styled from 'styled-components'
import { Card, WidgetBody, WidgetContainer, WidgetTitle } from 'src/components/Dashboard/styled'
import { getAccessToken, getRapini } from '../../../logic/safe/api/digitalTwinApi'
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

export const FeaturedParameters = (): ReactElement | null => {
  const { queries } = getRapini()

  const { data, isLoading, isLoadingError } = queries.useGetVariables()

  if (!data || isLoadingError) return null

  const variables = data

  if (!variables) return null

  if (!variables.length && !isLoading) return null

  return (
    <Grid item xs={12} md>
      <WidgetContainer id="featured-safe-apps">
        <WidgetTitle>My Parameters</WidgetTitle>
        <WidgetBody>
          <StyledGrid container>
            {variables.map((variable) => (
              <StyledGridItem item xs md key={variable.id}>
                <StyledLink
                  to={GENERIC_APPS_ROUTE + '?appUrl=' + variable.url + '&accessToken=' + getAccessToken()}
                  style={{ textDecoration: 'none' }}
                >
                  <Card>
                    <Grid container alignItems="center" spacing={3}>
                      <Grid item xs={12} md={3}>
                        <StyledImage src={variable.imageUrl} alt={variable.name} />
                      </Grid>
                      <Grid item xs={12} md={9}>
                        <Box mb={1.01}>
                          <Text size="xl">{variable.displayName}</Text>
                        </Box>
                        <Text color="primary" size="lg" strong>
                          Import {variable.displayName}
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
