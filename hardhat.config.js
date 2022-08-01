require('@nomicfoundation/hardhat-toolbox')
require('hardhat-deploy')
require('@nomiclabs/hardhat-ethers')
require('dotenv').config()
require('ethers')
require('hardhat-gas-reporter')
require('solidity-coverage')

const RINKEBY_URL = process.env.RINKEBY_URL || 'rinkeby-key'
const POLYGON_TEST_URL = process.env.POLYGON_TEST_URL || 'rinkeby-key'
const PRIVATE_KEY = process.env.PRIVATE_KEY || '0xkey'
const ETHERSCAN_API = process.env.ETHERSCAN_API || 'etherscan-key'
const COINMARKETCAP_API = process.env.COINMARKETCAP_API || 'coinmarketcap-key'

module.exports = {
	defaultNetwork: 'hardhat',
	networks: {
		rinkeby: {
			url: RINKEBY_URL,
			accounts: [PRIVATE_KEY],
			chainId: 4,
			blockConfirmations: 6,
		},
		polygonTest: {
			url: POLYGON_TEST_URL,
			accounts: [PRIVATE_KEY],
			chainId: 80001,
			blockConfirmations: 6,
		},
		localhost: {
			url: 'http://127.0.0.1:8545/',
			// accounts: already added by hardhat
			chainId: 31337,
		},
	},
	etherscan: {
		apiKey: ETHERSCAN_API,
	},
	gasReporter: {
		enabled: true,
		outputFile: 'gas-report.txt',
		noColors: true,
		coinmarketcap: COINMARKETCAP_API,
		currency: 'USD',
		token: 'MATIC',
	},
	namedAccounts: {
		deployer: {
			default: 0, //specifies order in the array
			4: 0, //specifies chain order. 4 would be rinkeby, position 2
		},
		user1: {
			default: 1,
			4: 1,
		},
	},
	// solidity: '0.8.8',
	solidity: {
		compilers: [{ version: '0.8.8' }, { version: '0.6.6' }],
	},
}
