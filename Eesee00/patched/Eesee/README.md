## eesee - NFT marketplace

# Smart Contracts

All smart contracts are located in the `./contracts` folder.

## Development

1. Create and fill in `.env` file using `.env.org` example file

2. Run `npm i` to install all packages

3. Compile all contracts before running migrations `npx hardhat compile`

4. Deploy with `npx hardhat run ./scripts/deploy.js --network <network>`

## Testing

All tests are located in the `./test` folder. Mock contracts used in tests can be found in `./contracts/test`.

To run tests run `npx hardhat test` in the console.

To also test GSN capabilities run `npx hardhat node` and `npx hardhat test --network testnet`.

To check coverage run `npx hardhat clean` and `npx hardhat coverage`.

## Docs

Technical documentation is located at `./docs` and [`here`](https://docs.eesee.io/eeesee-contracts/).
Contracts also contain comments to all functions describing what the function does, parameters and their return values.

## Configuration

The project configuration is found in `./hardhat.config.js` folder.

## Deployments
1. goerli: ``
2. ethereum: ``
3. polygon: ``
