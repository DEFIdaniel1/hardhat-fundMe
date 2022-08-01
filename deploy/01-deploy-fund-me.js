const { network, deployments, getNamedAccounts } = require('hardhat')
const { networkConfig } = require('../helper-hardhat-config')
const { verify } = require('../utils/verify')

module.exports = async ({ getNamedAccounts, deployments }) => {
	const { deploy, log } = deployments
	const { deployer } = await getNamedAccounts()
	const chainId = network.config.chainId
	console.log(`chainId: ${chainId}`)

	let ethUsdPriceFeedAddress
	if (chainId == 31337) {
		const ethUsdAggregator = await deployments.get('MockV3Aggregator')
		ethUsdPriceFeedAddress = ethUsdAggregator.address //provides address from local chain
		console.log(`IF: ethUsdPriceFeedAddress: ${ethUsdPriceFeedAddress}`)
	} else {
		ethUsdPriceFeedAddress = networkConfig[chainId]['ethUsdPriceFeed'] //gets from actual chains
		console.log(`ELSE: ethUsdPriceFeedAddress: ${ethUsdPriceFeedAddress}`)
	}
	log('---------------------------------------------')
	log('Deploying FundMe. Waiting for confirmations...')
	const fundMe = await deploy('FundMe', {
		contract: 'FundeMe',
		from: deployer,
		args: [ethUsdPriceFeedAddress], //input for the solidity file
		log: true,
		waitConfirmations: network.config.blockConfirmations || 1,
	})
	log(`FundMe deployed at ${fundMe.address}`)
	if (chainId != 31337 && process.env.ETHERSCAN_API) {
		log('About to verify, yo...')
		await verify(fundMe.address, ethUsdPriceFeedAddress) //passed to verify utils
		log('Verified!')
		log('---------------------------------------')
	}
}
module.exports.tags = ['all', 'fundMe']
