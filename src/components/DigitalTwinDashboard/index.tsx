import { ReactElement } from 'react'
import { Grid } from '@material-ui/core'

import MobileAppBanner from './DigitalTwinBanner'
import { FeaturedDataSources } from './FeaturedDataSources/FeaturedDataSources'
import MeasurementList from './Measurements/MeasurementList'
import { getAccessToken } from '../../logic/safe/api/digitalTwinApi'
import { DashboardTitle } from '../Dashboard/styled'
import DigitalTwinOverview from './DataOverview/DigitalTwinOverview'

const DigitalTwinDashboard = (): ReactElement => {
  return (
    <Grid container spacing={3}>
      <DashboardTitle>Your Digital Twin</DashboardTitle>

      <Grid item xs={12} md={12} lg={6}>
        <DigitalTwinOverview />
      </Grid>

      <MobileAppBanner />

      {getAccessToken() && (
        <Grid item xs={12} md={6}>
          <MeasurementList size={4} />
        </Grid>
      )}

      <FeaturedDataSources />
    </Grid>
  )
}

export default DigitalTwinDashboard
