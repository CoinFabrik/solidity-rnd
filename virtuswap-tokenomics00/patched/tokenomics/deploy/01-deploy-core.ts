import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { time } from '@nomicfoundation/hardhat-network-helpers';
import { networkConfig, developmentChains } from '../helper-hardhat-config';
import verify from '../utils/verify';

const deployCore: DeployFunction = async function (
    hre: HardhatRuntimeEnvironment
) {
    const { deployments, getNamedAccounts, network, config } = hre;
    const { deployer } = await getNamedAccounts();
    const { deploy, log } = deployments;
    const chainId: number = network.config.chainId!;

    const tokenomicsParams = await deploy('tokenomicsParams', {
        from: deployer,
        contract: 'VTokenomicsParams',
        args: [],
        log: true,
        waitConfirmations: networkConfig[network.name].blockConfirmations || 0,
    });

    log('Deploying core contracts...');

    let timestamp: number;
    if (chainId == 31337) {
        timestamp = (await time.latest()) + 604800; // 1 week after now
    } else {
        const blockNumBefore = await hre.ethers.provider.getBlockNumber();
        const blockBefore = await hre.ethers.provider.getBlock(blockNumBefore);
        timestamp = blockBefore.timestamp;
    }

    const vrsw = await deploy('vrsw', {
        from: deployer,
        contract: 'Vrsw',
        args: [deployer],
        log: true,
        waitConfirmations: networkConfig[network.name].blockConfirmations || 0,
    });

    const vrswContract = await hre.ethers.getContractAt('Vrsw', vrsw.address);

    const globalMinter = await deploy('globalMinter', {
        from: deployer,
        contract: 'VGlobalMinter',
        args: [timestamp, vrsw.address],
        log: true,
        waitConfirmations: networkConfig[network.name].blockConfirmations || 0,
    });

    await vrswContract.transfer(
        globalMinter.address,
        await vrswContract.balanceOf(deployer)
    );

    const globalMinterContract = await hre.ethers.getContractAt(
        'VGlobalMinter',
        globalMinter.address
    );
    const gVrswTokenAddress = await globalMinterContract.gVrsw();

    const chainMinter = await deploy('chainMinter', {
        from: deployer,
        contract: 'VChainMinter',
        args: [
            timestamp,
            tokenomicsParams.address,
            vrsw.address,
            gVrswTokenAddress,
        ],
        log: true,
    });

    const stakerFactory = await deploy('stakerFactory', {
        from: deployer,
        contract: 'VStakerFactory',
        args: [vrsw.address, chainMinter.address, tokenomicsParams.address],
        log: true,
        waitConfirmations: networkConfig[network.name].blockConfirmations || 0,
    });

    const stakerFactoryContract = await hre.ethers.getContractAt(
        'VStakerFactory',
        stakerFactory.address
    );

    const chainMinterContract = await hre.ethers.getContractAt(
        'VChainMinter',
        chainMinter.address
    );

    log('Core contracts deployed!');
    log('Setting stakerFactory for minter...');
    await chainMinterContract.setStakerFactory(stakerFactory.address);
    log('Done!');

    if (
        !developmentChains.includes(network.name) &&
        config.etherscan.apiKey.polygonMumbai
    ) {
        await verify(tokenomicsParams.address, []);
        await verify(globalMinter.address, [timestamp]);
        await verify(chainMinter.address, [
            timestamp,
            tokenomicsParams.address,
            vrsw.address,
            gVrswTokenAddress,
        ]);
        await verify(stakerFactory.address, [
            vrsw.address,
            chainMinter.address,
            tokenomicsParams.address,
        ]);
    }
};
export default deployCore;
deployCore.tags = ['all', 'core'];
