import { ReactElement } from 'react'
import Page from 'src/components/layout/Page'
import { Box } from '@material-ui/core'
import DigitalTwinDashboard from 'src/components/DigitalTwinDashboard'

const Home = (): ReactElement => {
  return (
    <Page>
      <Box pb={3}>
        <DigitalTwinDashboard />
      </Box>
    </Page>
  )
}

export default Home
