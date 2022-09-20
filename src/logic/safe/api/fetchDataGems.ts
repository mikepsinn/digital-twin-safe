import { NFTToken } from '../../collectibles/sources/collectibles'
import { findLITs } from 'src/routes/safe/components/Balances/DataGems'

export const fetchDataGemsList = async (): Promise<NFTToken[]> => {
  return findLITs()
}
