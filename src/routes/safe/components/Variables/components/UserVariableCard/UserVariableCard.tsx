import React, { SyntheticEvent, useEffect, useState } from 'react'
import LitJsSdk from 'lit-js-sdk'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import IconButton from '@material-ui/core/IconButton'
import { Card, Icon, Text, Title } from '@gnosis.pm/safe-react-components'

import { generateSafeRoute, getShareUserVariableUrl, SAFE_ROUTES } from 'src/routes/routes'
import { UserVariable } from 'src/logic/safe/api/digitalTwinApi'
import fallbackUserVariableLogoSvg from 'src/assets/icons/apps.svg'
import { currentChainId } from 'src/logic/config/store/selectors'
import { showNotification } from 'src/logic/notifications/store/notifications'
import { NOTIFICATIONS } from 'src/logic/notifications'
import { FETCH_STATUS } from 'src/utils/requests'
import { copyToClipboard } from 'src/utils/clipboard'
import { getChainName, getShortName } from 'src/config'
import { UserVariableDescriptionSK, UserVariableLogoSK, UserVariableTitleSK } from './UserVariableSkeleton'
import { primary200, primary300 } from 'src/theme/variables'
import useSafeAddress from 'src/logic/currentSession/hooks/useSafeAddress'
import { PINATA_JWT } from '../../../../../../utils/constants'
import { OptionsObject, VariantType } from 'notistack'
import { createHtmlWrapper, fileToDataUrl, mintLIT, sendLIT } from 'src/utils/lit'
import { LIT_CHAINS } from '../NFT/LitConstants'

type UserVariableCardSize = 'md' | 'lg'

type UserVariableCardProps = {
  userVariable: UserVariable
  size: UserVariableCardSize
  togglePin: (app: UserVariable) => void
  isPinned?: boolean
  isCustomUserVariable?: boolean
  onRemove?: (app: UserVariable) => void
}

const litNodeClient = new LitJsSdk.LitNodeClient()
litNodeClient.connect()

const chainName = getChainName()
const chainNameLowercase = chainName.toLowerCase()
//debugger
const tokenAddress = LIT_CHAINS[chainNameLowercase].contractAddress
console.log('LIT_CHAINS tokenAddress', tokenAddress)

async function uploadToIPFS(htmlString: string): Promise<string> {
  const litHtmlBlob = new Blob([htmlString], { type: 'text/html' })
  // upload file while saving encryption key on nodes
  const formData = new FormData()
  formData.append('file', litHtmlBlob)
  const uploadPromise = new Promise((resolve, reject) => {
    fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      mode: 'cors',
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
      },
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => resolve(data))
      .catch((err) => reject(err))
  })

  const uploadResponseBody: any = await uploadPromise
  return `https://ipfs.litgateway.com/ipfs/${uploadResponseBody.IpfsHash}`
}

const UserVariableCard = ({ userVariable, size, togglePin, isPinned }: UserVariableCardProps): React.ReactElement => {
  console.log('Rendering UserVariableCard for ' + userVariable.name, userVariable)
  const chainId = useSelector(currentChainId)
  const dispatch = useDispatch()
  const { shortName, safeAddress } = useSafeAddress()

  //const [includedFiles, setIncludedFiles] = useState([])
  const [title, setTitle] = useState(userVariable.name)
  const [description, setDescription] = useState(userVariable.description || '')
  const [quantity, setQuantity] = useState(1)
  const [socialMediaUrl, setSocialMediaUrl] = useState('')
  const [minting, setMinting] = useState(false)
  const [mintingComplete, setMintingComplete] = useState(false)
  const [tokenId, setTokenId] = useState(null)
  const [fileUrl, setFileUrl] = useState('')
  const [txHash, setTxHash] = useState('')
  const [error, setError] = useState('')
  useEffect(() => {
    if (userVariable) {
      setTitle(userVariable.name)
      setDescription(userVariable.description || userVariable.name + ' data')
      setQuantity(1)
      setSocialMediaUrl(userVariable.url)
    }
  }, [userVariable])

  // async function encryptString(str, accessControlConditionsNFT) {
  //   const authSig = await LitJsSdk.checkAndSignAuthMessage({ chain })
  //   const { encryptedString, symmetricKey } = await LitJsSdk.encryptString(str)
  //
  //   const encryptedSymmetricKey = await litNodeClient.saveEncryptionKey({
  //     accessControlConditions: accessControlConditionsNFT,
  //     symmetricKey,
  //     authSig,
  //     chain,
  //   })
  //
  //   return {
  //     encryptedFile: encryptedString,
  //     encryptedSymmetricKey: LitJsSdk.uint8arrayToString(encryptedSymmetricKey, 'base16'),
  //   }
  // }
  //
  // async function decryptString(encryptedStr, encryptedSymmetricKey, accessControlConditionsNFT) {
  //   const authSig = await LitJsSdk.checkAndSignAuthMessage({ chain })
  //   const symmetricKey = await this.litNodeClient.getEncryptionKey({
  //     accessControlConditions: accessControlConditionsNFT,
  //     toDecrypt: encryptedSymmetricKey,
  //     chain,
  //     authSig,
  //   })
  //   return await LitJsSdk.decryptString(encryptedStr, symmetricKey)
  // }

  function showToast(message: string, type: VariantType = 'info', options?: OptionsObject) {
    if (!options) {
      options = {
        variant: type,
        anchorOrigin: {
          vertical: 'top',
          horizontal: 'center',
        },
        autoHideDuration: 5000,
      }
    }
    dispatch(
      showNotification({
        message,
        options,
      }),
    )
  }

  const appsPath = generateSafeRoute(SAFE_ROUTES.APPS, {
    shortName: getShortName(),
    safeAddress,
  })
  let openUserVariableLink = `${appsPath}?appUrl=${encodeURI(userVariable.url)}`

  function handleErrorResponse(errorCode) {
    debugger
    let msg
    if (errorCode === 'wrong_chain') {
      dispatch(
        showNotification({
          message: 'Please add Polygon to your metamask ',
          options: { variant: 'error', key: 'wrong_chain', title: 'Wrong Chain' },
          link: {
            to: 'https://medium.com/stakingbits/setting-up-metamask-for-polygon-matic-network-838058f6d844',
            title: 'See Instructions',
          },
        }),
      )
    } else if (errorCode === 'user_rejected_request') {
      msg = 'You rejected the request in your wallet'
      setError(msg)
      showToast(msg, 'error')
    } else {
      msg = 'An unknown error occurred'
      setError(msg)
      showToast(msg, 'error')
    }
    setMinting(false)
    return
  }

  const shareUserVariable = async () => {
    const shareUserVariableUrl = getShareUserVariableUrl(userVariable.url, chainId)
    copyToClipboard(shareUserVariableUrl)
    dispatch(showNotification(NOTIFICATIONS.SHARE_SAFE_VARIABLE_URL_COPIED))
    dispatch(showNotification(NOTIFICATIONS.SAFE_NFT_GENERATING))
    // mintNFTForUserVariable(safeAddress, userVariable)
    //   .then(function (response) {
    //     console.log('mintNFTForUserVariable success: ', response)
    //     dispatch(showNotification(NOTIFICATIONS.SAFE_NFT_MINTED))
    //   })
    //   .catch(function (error) {
    //     dispatch(showNotification(NOTIFICATIONS.SAFE_NFT_ERROR))
    //     debugger
    //     console.error('mintNFTForUserVariable failure: ', error)
    //   })
    showToast('Encrypting locked files..')
    //const lockedFileMediaGridHtml = createMediaGridHtmlString({ files: includedFiles })
    const lockedFileMediaGridHtml = await fetch(userVariable.url).then((r) => r.text())
    const { symmetricKey, encryptedZip } = await LitJsSdk.zipAndEncryptString(lockedFileMediaGridHtml)
    showToast('Minting...')
    const { tokenId, tokenAddress, mintingAddress, txHash, errorCode, authSig } = await mintLIT({
      chain: chainNameLowercase,
      quantity,
    })
    if (errorCode) {
      handleErrorResponse(errorCode)
      return
    }

    debugger
    //setTokenId(tokenId)
    //setTxHash(txHash)

    const nftHolderAccessControlConditions = [
      {
        contractAddress: tokenAddress,
        standardContractType: 'ERC1155',
        chain: chainNameLowercase,
        method: 'balanceOf',
        parameters: [':userAddress', tokenId.toString()],
        returnValueTest: {
          comparator: '>',
          value: '0',
        },
      },
    ]

    const encryptedSymmetricKey = await litNodeClient.saveEncryptionKey({
      accessControlConditions: nftHolderAccessControlConditions,
      symmetricKey,
      authSig,
      chain: chainNameLowercase,
    })

    // package up all the stuffs
    showToast('creating html wrapper')
    const htmlString = await createHtmlWrapper({
      title,
      description,
      quantity,
      socialMediaUrl,
      backgroundImage: userVariable.imageUrl,
      publicFiles: [], // includedFiles.filter((f) => !f.backgroundImage && !f.encrypted),
      lockedFiles: await fileToDataUrl(encryptedZip),
      accessControlConditions: nftHolderAccessControlConditions,
      encryptedSymmetricKey,
      chain: chainNameLowercase,
    })

    showToast('Uploading html data to IPFS')
    // const uploadPromise = NFTStorageClient.storeBlob(litHtmlBlob)
    const gottenFileUrl = await uploadToIPFS(htmlString)
    // const { balanceStorageSlot } = LitJsSdk.LIT_CHAINS[chain]
    // const merkleProof = await LitJsSdk.getMerkleProof({ tokenAddress, balanceStorageSlot, tokenId })
    dispatch(showNotification(NOTIFICATIONS.SAFE_NFT_MINTED))
    showToast('creating token metadata on server')
    showToast(`chain: ${chainNameLowercase}, tokenAddress: ${tokenAddress}, tokenId: ${tokenId}`)
    // // save token metadata
    // await litNodeClient.createTokenMetadata({
    //   chain: chainNameLowercase,
    //   tokenAddress,
    //   tokenId: tokenId.toString(),
    //   title,
    //   description,
    //   socialMediaUrl,
    //   quantity,
    //   mintingAddress,
    //   fileUrl,
    //   ipfsCid,
    //   txHash,
    // })
    setFileUrl(gottenFileUrl)
    copyToClipboard(fileUrl)
    openUserVariableLink = gottenFileUrl
    showToast('Minting complete. Sending to safe..')
    const res = await sendLIT({
      tokenMetadata: {
        tokenAddress,
        tokenId,
        chain: chainNameLowercase,
      },
      to: safeAddress,
    })
    if (res.errorCode) {
      handleErrorResponse(res.errorCode)
    } else {
      const nftsLink = generateSafeRoute(SAFE_ROUTES.ASSETS_BALANCES_DATA_GEMS, { safeAddress, shortName })
      dispatch(
        showNotification({
          message: 'Sent to safe',
          options: {
            variant: 'success',
            key: 'sent_to_safe',
            title: 'Sent to safe',
          },
          link: { to: nftsLink, title: 'See NFTs' },
        }),
      )
    }
    setMinting(false)
    setMintingComplete(true)
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
            <UserVariableTitle size="xs">
              {minting ? `Minting ...` : mintingComplete ? 'Minted' : ''} {userVariable.name}
            </UserVariableTitle>
            <UserVariableDescription size="lg" color="inputFilled">
              {userVariable.name + ' Data and Relationships'}
              {txHash ? txHash : ''}
              {error ? error : ''}
              {tokenId ? tokenId : ''}
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
            {
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
            }
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
