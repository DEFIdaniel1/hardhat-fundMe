const { networkConfig } = require('../helper-hardhat-config')

module.exports = async ({ getNamedAccounts, deployments }) => {
	const { deploy, log } = deployments
	const { deployer } = await getNamedAccounts()
	const chainId = network.config.chainId

	const ethUsdPriceFeed = networkConfig[chainId]['ethUsdPriceFeed']

	const fundMe = await deploy('FundMe', {
		from: deployer,
		args: [address],
		log: true,
	})
}
