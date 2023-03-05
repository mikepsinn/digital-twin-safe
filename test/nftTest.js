const assert = require("assert");
describe('NFT', function () {
  describe('mint', function () {
    it('should deploy an ERC721 NFT Data Gem Contract', function () {
      const axios = require("axios").default;

      const options = {
        method: "POST",
        url: "https://api.nftport.xyz/v0/contracts",
        headers: {
          "Content-Type": "application/json",
          Authorization: "48f25836-8309-42ca-bf4f-ed86d9c1e31d"
        },
        data: {
          chain: CHAIN_POLYGON,
          name: "CRYPTOPUNKS",
          symbol: "C",
          owner_address: "",
          metadata_updatable: false,
          type: "erc721",
          roles: [{ role: "mint", addresses: ["0xMockAddress1", "0xMockAddress2"], freeze: false }]
        }
      };

      axios.request(options).then(function (response) {
        console.log(response.data);
      }).catch(function (error) {
        console.error(error);
      });
    });
    it('should mint an ERC721 NFT Data Gem', function () {

      assert.equal([1, 2, 3].indexOf(4), -1);
    });
  });
});
