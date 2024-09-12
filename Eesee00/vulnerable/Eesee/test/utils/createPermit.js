const { ethers } = require("hardhat")

const createPermit = async (tokenOwner, tokenReceiver, value, deadline, tokenContract) => {
    const types = {
        Permit: [{
            name: "owner",
            type: "address"
          },
          {
            name: "spender",
            type: "address"
          },
          {
            name: "value",
            type: "uint256"
          },
          {
            name: "nonce",
            type: "uint256"
          },
          {
            name: "deadline",
            type: "uint256"
          },
        ],
      }
    const eip712Domain = await tokenContract.eip712Domain()
    const domain = {
        name: eip712Domain.name,
        version: eip712Domain.version,
        chainId: eip712Domain.chainId,
        verifyingContract: eip712Domain.verifyingContract
    }
    const nonces = await tokenContract.nonces(tokenOwner.address)
    const values = {
        owner: tokenOwner.address,
        spender: tokenReceiver.address,
        value: value,
        nonce: nonces,
        deadline: deadline,
      }
    const signature = await tokenOwner._signTypedData(domain, types, values)
    const sig = ethers.utils.splitSignature(signature)
    return sig
}

module.exports =  createPermit
