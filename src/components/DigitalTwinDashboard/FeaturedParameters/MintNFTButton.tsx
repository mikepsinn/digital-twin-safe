// import { ethers } from 'ethers'
// import { NFTStorage } from 'nft.storage'
// import { currentChainId } from 'src/logic/config/store/selectors'
// import healthDataABI from 'src/config/HealthDataNFTABI.json'
// import networkMapping from 'src/config/networkMapping.json'
// import { useSelector } from 'react-redux'
//
// export const onClickCreateNft = async (variable: UserVariable): ReactElement | null => {
//   const provider = new ethers.providers.Web3Provider(window.ethereum)
//   const chainId = useSelector(currentChainId)
//   const chainIdString = parseInt(chainId).toString()
//   const nftContractAddress = networkMapping[chainIdString].HealthDataNFT[0]
//   const signer = await provider.getSigner()
//   const healthDataNFTContract = new ethers.Contract(nftContractAddress, healthDataABI, getSignerAddress(signer))
//   const nftStorage = new NFTStorage({ token: process.env.NFT_STORAGE_KEY })
//   const response = await nftStorage.store({
//     name: variable.name,
//     description: variable.description || 'No description on this variable: ' + variable.name,
//     image: new File(variable.imageUrl || 'No image on this variable: ' + variable.name),
//     attributes: variable,
//   })
//   const tx = await healthDataNFTContract.mintNft(
//     response.data.address,
//     response.data.id,
//     // {gasLimit: '100000',}
//   )
//   await tx.wait(1)
//   const tokenId = await healthDataNFTContract.getTokenCounter()
//   console.log('onClickCreateNft complete', { tokenId, nftStorage: response.data })
// }
export {}
