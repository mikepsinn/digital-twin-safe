import { SyntheticEvent } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import IconButton from '@material-ui/core/IconButton'
import { Card, Title, Text, Icon } from '@gnosis.pm/safe-react-components'

import { generateSafeRoute, getShareUserVariableUrl, SAFE_ROUTES } from 'src/routes/routes'
import { mintNFTForUserVariable, UserVariable } from 'src/logic/safe/api/digitalTwinApi'
import fallbackUserVariableLogoSvg from 'src/assets/icons/apps.svg'
import { currentChainId } from 'src/logic/config/store/selectors'
import { showNotification } from 'src/logic/notifications/store/notifications'
import { NOTIFICATIONS } from 'src/logic/notifications'
import { FETCH_STATUS } from 'src/utils/requests'
import { copyToClipboard } from 'src/utils/clipboard'
import { getShortName } from 'src/config'
import { UserVariableDescriptionSK, UserVariableLogoSK, UserVariableTitleSK } from './UserVariableSkeleton'
import { primary200, primary300 } from 'src/theme/variables'
import useSafeAddress from 'src/logic/currentSession/hooks/useSafeAddress'
import React from 'react'

type UserVariableCardSize = 'md' | 'lg'

type UserVariableCardProps = {
  userVariable: UserVariable
  size: UserVariableCardSize
  togglePin: (app: UserVariable) => void
  isPinned?: boolean
  isCustomUserVariable?: boolean
  onRemove?: (app: UserVariable) => void
}

const UserVariableCard = ({
  userVariable,
  size,
  togglePin,
  isPinned,
  isCustomUserVariable,
  onRemove,
}: UserVariableCardProps): React.ReactElement => {
  const chainId = useSelector(currentChainId)
  const dispatch = useDispatch()
  const { safeAddress } = useSafeAddress()
  const appsPath = generateSafeRoute(SAFE_ROUTES.APPS, {
    shortName: getShortName(),
    safeAddress,
  })
  const openUserVariableLink = `${appsPath}?appUrl=${encodeURI(userVariable.url)}`
  const shareUserVariable = () => {
    const shareUserVariableUrl = getShareUserVariableUrl(userVariable.url, chainId)
    copyToClipboard(shareUserVariableUrl)
    dispatch(showNotification(NOTIFICATIONS.SHARE_SAFE_VARIABLE_URL_COPIED))
    dispatch(showNotification(NOTIFICATIONS.SAFE_NFT_GENERATING))
    mintNFTForUserVariable(safeAddress, userVariable)
      .then(function (response) {
        console.log('mintNFTForUserVariable success: ', response)
        dispatch(showNotification(NOTIFICATIONS.SAFE_NFT_MINTED))
      })
      .catch(function (error) {
        dispatch(showNotification(NOTIFICATIONS.SAFE_NFT_ERROR))
        debugger
        console.error('mintNFTForUserVariable failure: ', error)
      })
  }

  const isUserVariableLoading = userVariable.fetchStatus === FETCH_STATUS.LOADING

  if (isUserVariableLoading) {
    return (
      <UserVariableContainer size={size}>
        <StyledVariableCard size={size}>
          <LogoContainer size={size}>
            <UserVariableLogoSK size={size} />
          </LogoContainer>
          <DescriptionContainer size={size}>
            <UserVariableTitleSK />
            <UserVariableDescriptionSK />
            <UserVariableDescriptionSK />
          </DescriptionContainer>
        </StyledVariableCard>
      </UserVariableContainer>
    )
  }

  return (
    <UserVariableContainer size={size}>
      <StyledLink to={openUserVariableLink} aria-label={`open ${userVariable.name} Safe User Variable`}>
        <StyledVariableCard size={size}>
          {/* Safe UserVariable Logo */}
          <LogoContainer size={size}>
            <UserVariableLogo
              size={size}
              src={userVariable.imageUrl}
              alt={`${userVariable.name || 'Safe UserVariable'} Logo`}
              onError={setUserVariableLogoFallback}
            />
          </LogoContainer>

          {/* Safe UserVariable Description */}
          <DescriptionContainer size={size}>
            <UserVariableTitle size="xs">{userVariable.name}</UserVariableTitle>
            <UserVariableDescription size="lg" color="inputFilled">
              {userVariable.name + ' Data and Relationships'}
            </UserVariableDescription>
          </DescriptionContainer>

          {/* Safe UserVariable Actions */}
          <ActionsContainer onClick={(e) => e.preventDefault()}>
            {/* Share Safe UserVariable button */}
            <IconBtn
              onClick={shareUserVariable}
              aria-label={`copy ${userVariable.name} Safe User Variable share link to clipboard`}
            >
              <Icon size="md" type="share" tooltip="Copy share link" />
            </IconBtn>

            {/* Pin & Unpin Safe UserVariable button */}
            {!isCustomUserVariable && (
              <IconBtn
                onClick={() => togglePin(userVariable)}
                aria-label={`${isPinned ? 'Unpin' : 'Pin'} ${userVariable.name} Safe UserVariable`}
              >
                {isPinned ? (
                  <PinnedIcon
                    size="md"
                    type="bookmarkFilled"
                    color="primary"
                    tooltip="Unpin from the Favorite Variables"
                  />
                ) : (
                  <PinnedIcon size="md" type="bookmark" tooltip="Pin to Favorite Variables" />
                )}
              </IconBtn>
            )}

            {/* Remove custom Safe UserVariable button */}
            {isCustomUserVariable && (
              <IconBtn
                onClick={() => onRemove?.(userVariable)}
                aria-label={`Remove ${userVariable.name} custom Safe UserVariable`}
              >
                <Icon size="md" type="delete" color="error" tooltip="Remove Custom Safe User Variable" />
              </IconBtn>
            )}
          </ActionsContainer>
        </StyledVariableCard>
      </StyledLink>
    </UserVariableContainer>
  )
}

export default UserVariableCard

const setUserVariableLogoFallback = (error: SyntheticEvent<HTMLImageElement, Event>): void => {
  error.currentTarget.onerror = null
  error.currentTarget.src = fallbackUserVariableLogoSvg
}

export const SAFE_VARIABLE_CARD_HEIGHT = 190
export const SAFE_VARIABLE_CARD_PADDING = 16

const UserVariableContainer = styled(motion.div).attrs({
  layout: true,
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
})`
  position: relative;
  display: flex;
  height: ${SAFE_VARIABLE_CARD_HEIGHT}px;

  grid-column: span ${(props: { size: UserVariableCardSize }) => (props.size === 'lg' ? '2' : '1')};
`

const StyledLink = styled(Link)`
  display: flex;
  flex: 1 0;
  height: ${SAFE_VARIABLE_CARD_HEIGHT}px;
  text-decoration: none;
`

const StyledVariableCard = styled(Card)`
  flex: 1 1 100%;
  padding: ${SAFE_VARIABLE_CARD_PADDING}px;
  display: flex;
  flex-direction: ${(props: { size: UserVariableCardSize }) => (props.size === 'lg' ? 'row' : 'column')};
  box-shadow: none;
  border: 2px solid transparent;

  transition: all 0.3s ease-in-out 0s;
  transition-property: border-color, background-color;

  :hover {
    background-color: ${primary200};
    border: 2px solid ${primary300};
  }
`

const LogoContainer = styled.div`
  flex: 0 0;
  flex-basis: ${(props: { size: UserVariableCardSize }) => (props.size === 'lg' ? '50%' : 'auto')};

  display: flex;
  justify-content: ${(props: { size: UserVariableCardSize }) => (props.size === 'lg' ? 'center' : 'start')};
  align-items: center;
`

const UserVariableLogo = styled.img`
  height: ${(props: { size: UserVariableCardSize }) => (props.size === 'lg' ? '112px' : '50px')};
  width: ${(props: { size: UserVariableCardSize }) => (props.size === 'lg' ? '112px' : '50px')};
  object-fit: contain;
`

const DescriptionContainer = styled.div`
  flex: 0 0;

  flex-basis: ${(props: { size: UserVariableCardSize }) => (props.size === 'lg' ? '50%' : 'auto')};

  display: flex;
  flex-direction: column;
  justify-content: center;
`

const UserVariableTitle = styled(Title)`
  margin: 8px 0px;
  font-size: 16px;
  line-height: 22px;
  font-weight: bold;
  color: initial;
`

const UserVariableDescription = styled(Text)`
  margin: 0;
  line-height: 22px;

  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
`

const ActionsContainer = styled.div`
  position: absolute;
  top: 0;
  right: 0;

  margin: 16px 12px;
`

const IconBtn = styled(IconButton)`
  padding: 8px;

  && svg {
    width: 16px;
    height: 16px;
  }
`
const PinnedIcon = styled(Icon)`
  padding-left: 2px;
`
