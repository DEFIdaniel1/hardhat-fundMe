const { network } = require('hardhat')

const DECIMALS = 8
const INITIAL_ANSWER = 150000000000 //Eth value + added 8 zeroes to the price since decimals = 8

module.exports = async ({ getNamedAccounts, deployments }) => {
	const { deploy, log } = deployments
	const { deployer } = await getNamedAccounts()
	const chainId = network.config.chainId

	if (chainId == 31337) {
		//only deploys on localhost
		log('Local network detected! Deploying Mocks...')
		await deploy('MockV3Aggregator', {
			contract: 'MockV3Aggregator',
			from: deployer,
			log: true,
			args: [DECIMALS, INITIAL_ANSWER],
			//Checked Github repo to see what args the MockV3Aggregator.sol file took
			//Make sure they are in the SAME ORDER
		})
		log('Mocks deployed')
		log('---------------------------------------')
	}
}
module.exports.tags = ['all', 'mocks']
