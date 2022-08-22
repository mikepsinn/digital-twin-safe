import { ReactElement } from 'react'
import { Text } from '@gnosis.pm/safe-react-components'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { grey400 } from 'src/theme/variables'
import { CustomIconText } from 'src/components/CustomIconText'
import { EMPTY_DATA } from 'src/logic/wallets/ethTransactions'
import { Measurement } from '../../../logic/safe/api/digitalTwinApi'

const MeasurementListItemStyledLink = styled(Link)`
  width: 100%;
  display: grid;
  align-items: center;
  grid-template-columns: 36px 1fr 1fr auto;
  gap: 4px;
  margin: 0 auto;
  padding: 8px 24px;
  text-decoration: none;
  background-color: ${({ theme }) => theme.colors.white};
  border: 2px solid ${grey400};
  color: ${({ theme }) => theme.colors.text};
  border-radius: 8px;
  box-sizing: border-box;
`

const MeasurementListItem = (measurement: Measurement): ReactElement => {
  return (
    <MeasurementListItemStyledLink key={measurement.id} to={measurement.url || ''}>
      <Text color="text" size="lg" as="span">
        {measurement.displayName}
      </Text>
      <CustomIconText
        address={measurement?.value.toString() || EMPTY_DATA}
        iconUrl={measurement.pngUrl || undefined}
        iconUrlFallback={measurement.variableCategoryImageUrl}
        text={measurement.displayName || undefined}
      />
    </MeasurementListItemStyledLink>
  )
}

export default MeasurementListItem
