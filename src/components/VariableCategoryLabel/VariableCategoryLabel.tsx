import { ReactElement } from 'react'
import styled from 'styled-components'

import { border, extraSmallFontSize, fontColor, sm, xs } from 'src/theme/variables'

type Props = {
  variableCategoryName: string
  onClick?: () => void
  flexGrow?: boolean
  ['data-testid']?: string
}

function VariableCategoryLabel(props: Props): ReactElement {
  const { variableCategoryName, onClick, flexGrow } = props
  return (
    <StyledLabel
      onClick={onClick}
      flexGrow={flexGrow}
      {...{ textColor: '', backgroundColor: '' }}
      data-testid={props['data-testid']}
    >
      {variableCategoryName}
    </StyledLabel>
  )
}

export default VariableCategoryLabel

type StyledLabelTypes = {
  backgroundColor: string
  textColor: string
  onClick?: () => void
  flexGrow?: boolean
}

const StyledLabel = styled.span<StyledLabelTypes>`
  position: relative;
  bottom: 2px;
  line-height: normal;
  display: inline-block;
  min-width: 70px;
  font-size: ${extraSmallFontSize};
  padding: ${xs} ${sm};
  background-color: ${({ backgroundColor }) => backgroundColor ?? border};
  color: ${({ textColor }) => textColor ?? fontColor};
  cursor: ${({ onClick }) => (onClick ? 'pointer' : 'inherit')};
  text-align: center;
  border-radius: 4px;
  text-transform: capitalize;
  flex-grow: ${({ flexGrow }) => (flexGrow ? 1 : 'initial')};
`
