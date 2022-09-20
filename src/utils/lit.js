import ReactDOMServer from 'react-dom/server'
import { ServerStyleSheets } from '@material-ui/core/styles'
import LitJsSdk from 'lit-js-sdk'
import Presentation from 'src/routes/safe/components/Variables/components/NFT/Presentation'
import { log, throwError } from 'lit-js-sdk/src/lib/utils'
import { LIT_CHAINS } from 'lit-js-sdk/src/lib/constants'
import { Contract } from '@ethersproject/contracts'
import { checkAndSignEVMAuthMessage, connectWeb3 } from 'lit-js-sdk/src/utils/eth'
import * as LitJson from 'src/utils/lit/abis/LIT.json'

export function createHtmlWrapper({
  title,
  description,
  quantity,
  socialMediaUrl,
  backgroundImage,
  publicFiles,
  lockedFiles,
  accessControlConditions,
  encryptedSymmetricKey,
  chain,
}) {
  // save head before.  this is because ServerStyleSheets will add the styles to the HEAD tag, and we need to restore them
  const HTMLHeadBefore = document.head.innerHTML
  const sheets = new ServerStyleSheets()

  const htmlBody = ReactDOMServer.renderToString(
    sheets.collect(
      <Presentation
        title={title}
        description={description}
        quantity={quantity}
        socialMediaUrl={socialMediaUrl}
        backgroundImage={backgroundImage}
        publicFiles={publicFiles}
      />,
    ),
  )
  let css = sheets.toString()
  // loading spinner
  css += `
.lds-ripple {
  display: inline-block;
  position: relative;
  width: 44px;
  height: 40px;
}
.lds-ripple div {
  position: absolute;
  border: 4px solid #000;
  opacity: 1;
  border-radius: 50%;
  animation: lds-ripple 1s cubic-bezier(0, 0.2, 0.8, 1) infinite;
}
.lds-ripple div:nth-child(2) {
  animation-delay: -0.5s;
}
@keyframes lds-ripple {
  0% {
    top: 16px;
    left: 16px;
    width: 0;
    height: 0;
    opacity: 1;
  }
  100% {
    top: 0px;
    left: 0px;
    width: 32px;
    height: 32px;
    opacity: 0;
  }
}
  `

  // put head back
  document.head.innerHTML = HTMLHeadBefore

  return LitJsSdk.createHtmlLIT({
    title,
    htmlBody,
    css,
    accessControlConditions,
    encryptedSymmetricKey,
    chain,
    encryptedZipDataUrl: lockedFiles,
  })
}

/**
 * This function mints a LIT using our pre-deployed token contracts.  You may use our contracts, or you may supply your own.  Our contracts are ERC1155 tokens on Polygon and Ethereum.  Using these contracts is the easiest way to get started.
 * @param {Object} params
 * @param {string} params.chain The chain to mint on.  "ethereum" and "polygon" are currently supported.
 * @param {number} params.quantity The number of tokens to mint.  Note that these will be fungible, so they will not have serial numbers.
 * @returns {Object} The txHash, tokenId, tokenAddress, mintingAddress, and authSig.
 */
export async function mintLIT({ chain, quantity }) {
  log(`minting ${quantity} tokens on ${chain}`)
  try {
    const authSig = await checkAndSignEVMAuthMessage({
      chain,
      switchChain: true,
    })
    if (authSig.errorCode) {
      return authSig
    }
    debugger
    const { web3, account } = await connectWeb3()
    const walletPublicAddress = account
    //walletPublicAddress = walletPublicAddress.toLowerCase()
    console.log('web3', web3)
    console.log('recipientPublicAddress', walletPublicAddress)
    const tokenAddress = LIT_CHAINS[chain].contractAddress
    if (!tokenAddress) {
      log("No token address for this chain.  It's not supported via MintLIT.")
      throwError({
        message: `This chain is not supported for minting with the Lit token contract because it hasn't been deployed to this chain.  You can use Lit with your own token contract on this chain, though.`,
        name: 'MintingNotSupported',
        errorCode: 'minting_not_supported',
      })
      return
    }
    let signer = web3.getSigner()
    //signer = await ethSigner
    console.log('signer', signer)
    const contract = new Contract(tokenAddress, LitJson.abi, signer)
    log('sending to chain...')
    const tx = await contract.mint(quantity)
    log('sent to chain.  waiting to be mined...')
    const txReceipt = await tx.wait()
    log('txReceipt: ', txReceipt)
    const tokenId = txReceipt.events[0].args[3].toNumber()
    let metaData = {
      txHash: txReceipt.transactionHash,
      tokenId,
      tokenAddress,
      mintingAddress: walletPublicAddress,
      authSig,
    }
    return metaData
  } catch (error) {
    log(error)
    if (error.code === 4001) {
      // EIP-1193 userRejectedRequest error
      log('User rejected request')
      return { errorCode: 'user_rejected_request' }
    } else {
      console.error(error)
    }
    return { errorCode: 'unknown_error' }
  }
}

/**
 * Send a token to another account
 * @param {Object} params
 * @param {Object} params.tokenMetadata The token metadata of the token to be transferred.  Should include tokenId, tokenAddress, and chain
 * @param {string} params.to The account address to send the token to
 * @returns {Object} Success or error
 */
export async function sendLIT({ tokenMetadata, to }) {
  log('sendLIT for ', tokenMetadata)
  debugger
  try {
    const { web3, account } = await connectWeb3()
    const { tokenAddress, tokenId, chain } = tokenMetadata
    const contract = new Contract(tokenAddress, LitJson.abi, web3.getSigner())
    log('transferring')
    const maxTokenId = await contract.safeTransferFrom(account, to, tokenId, 1, [])
    log('sent to chain')
    return { success: true }
  } catch (error) {
    log(error)
    if (error.code === 4001) {
      // EIP-1193 userRejectedRequest error
      log('User rejected request')
      return { errorCode: 'user_rejected_request' }
    } else {
      console.error(error)
    }
    return { errorCode: 'unknown_error' }
  }
}

/**
 * Convert a file to a data URL, which could then be embedded in a LIT.  A data URL is a string representation of a file.
 * @param {File} file The file to turn into a data url
 * @returns {Promise<unknown>} The data URL.  This is a string representation that can be used anywhere the original file would be used.
 */
export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      resolve(reader.result)
    }
    reader.readAsDataURL(file)
  })
}

/**
 * Finds the tokens that the current user owns from the predeployed LIT contracts
 * @param {Object} params
 * @param {string} params.chain The chain that was minted on. "ethereum" and "polygon" are currently supported.
 * @param {number} params.accountAddress The account address to check
 * @returns {Promise} The token ids owned by the accountAddress
 */
export async function findLITs() {
  log('findLITs')

  try {
    const { web3, account } = await connectWeb3()
    const { chainId } = await web3.getNetwork()
    const chainHexId = '0x' + chainId.toString(16)
    // const chainHexId = await web3.request({ method: 'eth_chainId', params: [] })
    const chain = chainHexIdToChainName(chainHexId)
    const tokenAddress = LIT_CHAINS[chain].contractAddress
    const contract = new Contract(tokenAddress, LitJson.abi, web3.getSigner())
    log('getting maxTokenId for chain', chain)
    const maxTokenId = await contract.tokenIds()
    const accounts = []
    const tokenIds = []
    for (let i = 0; i <= maxTokenId; i++) {
      accounts.push(account)
      tokenIds.push(i)
    }
    log('getting balanceOfBatch for ', accounts, tokenIds)
    const balances = await contract.balanceOfBatch(accounts, tokenIds)
    log('balances', balances)
    const tokenIdsWithNonzeroBalances = balances
      .map((b, i) => (b.toNumber() === 0 ? null : i))
      .filter((b) => b !== null)
    return { tokenIds: tokenIdsWithNonzeroBalances, chain }
  } catch (error) {
    log(error)
    if (error.code === 4001) {
      // EIP-1193 userRejectedRequest error
      log('User rejected request')
      return { errorCode: 'user_rejected_request' }
    } else {
      console.error(error)
    }
    return { errorCode: 'unknown_error' }
  }
}

function chainHexIdToChainName(chainHexId) {
  for (let i = 0; i < Object.keys(LIT_CHAINS).length; i++) {
    const chainName = Object.keys(LIT_CHAINS)[i]
    const litChainHexId = '0x' + LIT_CHAINS[chainName].chainId.toString('16')
    if (litChainHexId === chainHexId) {
      return chainName
    }
  }
}
