const LitJsSdk = require('../node_modules/lit-js-sdk/src/index.js')

async function main() {
  const { tokenIds, chain } = LitJsSdk.findLITs()
  console.log('tokenIds', tokenIds)
  console.log('chain', chain)
  // const metadata = await getMetadata({ tokenIds, chain })
  // console.log(metadata)
}

main()
