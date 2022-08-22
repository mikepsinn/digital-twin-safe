import { GTM_EVENT } from 'src/utils/googleTagManager'
import { addEventCategory } from 'src/utils/events/utils'

const SAFE_VARIABLES = {
  OPEN_VARIABLE: {
    event: GTM_EVENT.CLICK,
    action: 'Open Safe UserVariable',
  },
  PIN: {
    event: GTM_EVENT.CLICK,
    action: 'Pin Safe UserVariable',
  },
  UNPIN: {
    event: GTM_EVENT.CLICK,
    action: 'Unpin Safe UserVariable',
  },
  SEARCH: {
    event: GTM_EVENT.META,
    action: 'Search for Safe UserVariable',
  },
  ADD_CUSTOM_VARIABLE: {
    event: GTM_EVENT.META,
    action: 'Add custom Safe UserVariable',
  },
  TRANSACTION_CONFIRMED: {
    event: GTM_EVENT.META,
    action: 'Transaction Confirmed',
  },
  TRANSACTION_REJECTED: {
    event: GTM_EVENT.META,
    action: 'Transaction Rejected',
  },
  LEGACY_API_CALL: {
    event: GTM_EVENT.META,
    action: 'Legacy API call',
  },
  SHARED_VARIABLE_LANDING: {
    event: GTM_EVENT.META,
    action: 'Shared UserVariable landing page visited',
  },
  SHARED_VARIABLE_CHAIN_ID: {
    event: GTM_EVENT.META,
    action: 'Shared UserVariable chainId',
  },
  SHARED_VARIABLE_OPEN_DEMO: {
    event: GTM_EVENT.META,
    action: 'Open demo safe from shared variable',
  },
  SHARED_VARIABLE_OPEN_AFTER_SAFE_CREATION: {
    event: GTM_EVENT.META,
    action: 'Open shared variable after Safe creation',
  },
}

const SAFE_VARIABLES_CATEGORY = 'safe-variables'
export const SAFE_VARIABLES_EVENTS = addEventCategory(SAFE_VARIABLES, SAFE_VARIABLES_CATEGORY)
