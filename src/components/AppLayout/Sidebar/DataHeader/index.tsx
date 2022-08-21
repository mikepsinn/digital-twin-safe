import styled from 'styled-components'
import { Text } from '@gnosis.pm/safe-react-components'
import { useRouteMatch } from 'react-router-dom'
import FlexSpacer from 'src/components/FlexSpacer'
import Paragraph from 'src/components/layout/Paragraph'
import { connected, fontColor } from 'src/theme/variables'
import { ADDRESSED_ROUTE } from 'src/routes/routes'
import { Avatar, Box } from '@material-ui/core'
import { getAxios, initialize } from '../../../../logic/safe/api/fetchSafeData'

const { queries } = initialize(getAxios())

const { useGetUser } = queries

const Container = styled.div`
  max-width: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 0 12px;
`

const IdenticonContainer = styled.div`
  width: 100%;
  margin: 14px 8px 9px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
`

export type LifeForceInfo = {
  description: string
  textColor: string
  backgroundColor: string
  score: number
}

type LifeForceBarProps = {
  LifeForceInfo: LifeForceInfo
}

// Remain agnostic as possible and reference what is returned in the CGW, i.e.
// https://gnosis.github.io/safe-client-gateway/docs/routes/chains/models/struct.LifeForceInfo.html
export type LifeForceBar = {
  description: string
  textColor: string
  backgroundColor: string
  score: string
}

const LifeForceBar = styled(Text)`
  margin: -8px 0 0 -8px;
  padding: 4px 8px;
  width: 100%;
  text-align: center;
  color: ${fontColor};
  background-color: ${(props: LifeForceBarProps) => props.LifeForceInfo?.backgroundColor ?? connected};
`

const StyledTextSafeName = styled(Text)`
  width: 90%;
  overflow: hidden;
  text-overflow: ellipsis;
`

import SafeLogo from 'src/assets/logo.svg'
const DataHeader = (): React.ReactElement => {
  //debugger
  const { data: user, isLoading: userLoading, isError: userError } = useGetUser()
  let avatar = user?.avatar
  if (!avatar) {
    avatar = SafeLogo
  }
  const LifeForceInfo = {
    description: 'Sleep Efficiency',
    textColor: '#fff',
    backgroundColor: '#00bcd4',
    score: 50,
  }

  const hasSafeOpen = useRouteMatch(ADDRESSED_ROUTE)

  if (!hasSafeOpen || !user || userLoading || userError) {
    return (
      <Container>
        <IdenticonContainer>
          <FlexSpacer />
          <Avatar alt="Avatar" src={avatar} />
        </IdenticonContainer>
      </Container>
    )
  }

  return (
    <>
      {/* Network */}
      <LifeForceBar size="sm" LifeForceInfo={LifeForceInfo}>
        {LifeForceInfo.description}
      </LifeForceBar>

      <Container>
        {/* Identicon */}
        <IdenticonContainer>
          <Box position="relative">
            {/*<Threshold threshold={threshold} owners={owners.length} />*/}
            {/*<Identicon address={address} size="lg" />*/}
            <Avatar alt="Avatar" src={avatar} />
          </Box>
          {/*            <ToggleSafeListButton onClick={onToggleSafeList} data-testid={TOGGLE_SIDEBAR_BTN_TESTID}>
              <StyledIcon size="md" type="circleDropdown" />
            </ToggleSafeListButton>*/}
        </IdenticonContainer>

        {/* SafeInfo */}
        <StyledTextSafeName size="xl" center>
          {user.displayName}
        </StyledTextSafeName>

        {/*          <StyledPrefixedEthHashInfo hash={address} shortenHash={4} textSize="sm" />
          <IconContainer>
            <Track {...OVERVIEW_EVENTS.SHOW_QR}>
              <StyledQRCodeButton onClick={onReceiveClick}>
                <Icon size="sm" type="qrCode" tooltip="Show QR code" />
              </StyledQRCodeButton>
            </Track>
            <Track {...OVERVIEW_EVENTS.COPY_ADDRESS}>
              <StyledCopyToClipboardBtn textToCopy={copyChainPrefix ? `${shortName}:${address}` : `${address}`} />
            </Track>
            <Track {...OVERVIEW_EVENTS.OPEN_EXPLORER}>
              <StyledExplorerButton explorerUrl={getExplorerInfo(address)} />
            </Track>
          </IconContainer>*/}

        <Paragraph color="black400" noMargin size="md">
          Life force: {LifeForceInfo.score}
        </Paragraph>
      </Container>
    </>
  )
}

export default DataHeader
