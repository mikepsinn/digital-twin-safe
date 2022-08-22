import axios from 'axios'
import memoize from 'lodash/memoize'

import { getContentFromENS } from 'src/logic/wallets/getWeb3'
import variablesIconSvg from 'src/assets/icons/variables.svg'
import { FETCH_STATUS } from 'src/utils/requests'
import { UserVariable } from 'src/logic/safe/api/digitalTwinApi'

type VariableManifestIcon = {
  src: string
  sizes: string
  type?: string
  purpose?: string
}

export interface VariableManifest {
  name: string
  iconPath?: string
  description: string
  icons?: VariableManifestIcon[]
  providedBy: string
}

export const VARIABLES_STORAGE_KEY = 'VARIABLES_STORAGE_KEY'
export const PINNED_SAFE_VARIABLE_IDS = 'PINNED_SAFE_VARIABLE_IDS'
export const EMPTY_SAFE_VARIABLE = 'unknown'
const MIN_ICON_WIDTH = 128
const MANIFEST_ERROR_MESSAGE = 'Manifest does not fulfil the required structure.'

const removeLastTrailingSlash = (url: string): string => {
  return url.replace(/\/+$/, '')
}

export const isSameUrl = (url1: string, url2: string): boolean => {
  return removeLastTrailingSlash(url1) === removeLastTrailingSlash(url2)
}

export const getVariableInfoFromOrigin = (origin: string): { url: string; name: string } | null => {
  try {
    return JSON.parse(origin)
  } catch (error) {
    console.error(`Impossible to parse TX from origin: ${origin}`)
    return null
  }
}

export const isVariableManifestValid = (variableInfo: VariableManifest): boolean =>
  // `variableInfo` exists and `name` exists
  !!variableInfo?.name &&
  // if `name` exists is not 'unknown'
  variableInfo.name !== EMPTY_SAFE_VARIABLE &&
  // `description` exists
  !!variableInfo.description

export const getEmptyUserVariable = (url = ''): UserVariable => {
  return {
    userId: 0,
    variableId: 0,
    id: 0,
    url,
    name: EMPTY_SAFE_VARIABLE,
    imageUrl: variablesIconSvg,
    description: '',
    tags: [],
  }
}

export const getVariableInfoFromUrl = memoize(
  async (variableUrl: string, validateManifest = true): Promise<UserVariable> => {
    let res = {
      iconUrl: undefined,
      ...getEmptyUserVariable(),
      error: true,
      loadingStatus: FETCH_STATUS.ERROR,
    }

    if (!variableUrl?.length) {
      return res
    }

    res.url = variableUrl.trim()
    const noTrailingSlashUrl = removeLastTrailingSlash(res.url)

    let variableInfo: VariableManifest | undefined
    try {
      const response = await axios.get<VariableManifest>(`${noTrailingSlashUrl}/manifest.json`, { timeout: 5_000 })
      variableInfo = response.data
    } catch (error) {
      throw Error('Failed to fetch variable manifest')
    }

    // verify imported variable fulfil safe requirements
    if (!variableInfo || !isVariableManifestValid(variableInfo)) {
      if (validateManifest) {
        throw Error(`Variable ${MANIFEST_ERROR_MESSAGE.toLocaleLowerCase()}`)
      } else {
        console.error(`${variableInfo.name || 'Safe UserVariable'}: ${MANIFEST_ERROR_MESSAGE}`)
      }
    }

    const variableInfoData = {
      name: variableInfo.name,
      iconPath: variableInfo.icons?.length ? getVariableIcon(variableInfo.icons) : variableInfo.iconPath,
      description: variableInfo.description,
      providedBy: variableInfo.providedBy,
    }

    res = {
      ...res,
      ...variableInfoData,
      error: false,
      loadingStatus: FETCH_STATUS.SUCCESS,
    }

    return res
  },
)

export const getVariableIcon = (icons: VariableManifestIcon[]): string => {
  const svgIcon = icons.find((icon) => icon?.sizes?.includes('any') || icon?.type === 'image/svg+xml')

  if (svgIcon) {
    return svgIcon.src
  }

  for (const icon of icons) {
    for (const size of icon.sizes.split(' ')) {
      if (Number(size?.split('x')[0]) >= MIN_ICON_WIDTH) {
        return icon.src
      }
    }
  }

  return icons[0].src || ''
}

export const getIpfsLinkFromEns = memoize(async (name: string): Promise<string | undefined> => {
  try {
    const content = await getContentFromENS(name)
    if (content && content.protocolType === 'ipfs') {
      return `${process.env.REACT_VARIABLE_IPFS_GATEWAY}/${content.decoded}/`
    }
  } catch (error) {
    console.error(error)
    return
  }
})

export const uniqueVariable =
  (variableList: UserVariable[]) =>
  (url: string): string | undefined => {
    const newUrl = new URL(url)
    const exists = variableList.some((a) => {
      try {
        const currentUrl = new URL(a.url)
        return currentUrl.href === newUrl.href
      } catch (error) {
        console.error('There was a problem trying to validate the URL existence.', error.message)
        return false
      }
    })
    return exists ? 'This variable is already registered.' : undefined
  }
// Some variables still need chain name, as they didn't update to chainId based SDK versions
// With naming changing in the config service some names aren't the expected ones
// Ex: Ethereum -> MAINNET, Gnosis Chain -> XDAI
export const getLegacyChainName = (chainName: string, chainId: string): string => {
  let network = chainName
  switch (chainId) {
    case '1':
      network = 'MAINNET'
      break
    case '100':
      network = 'XDAI'
  }

  return network
}
