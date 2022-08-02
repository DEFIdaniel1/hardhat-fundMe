const { assert } = require('chai')
const { network, ethers, getNamedAccounts } = require('hardhat')

const chainId = network.config.chainId
//only run when NOT on localHost
chainId != 31337
	? describe('FundMe', async function () {
			let fundMe
			let deployer
			const sendValue = ethers.utils.parseEther('0.01')
			beforeEach(async function () {
				deployer = (await getNamedAccounts()).deployer
				fundMe = await ethers.getContract('FundMe', deployer)
				//don't need to deploy or use mocks since we assume deployed on a real testnet
			})

			it('allows people to fund and withdraw', async function () {
				await fundMe.fund({ value: sendValue })
				await fundMe.withdraw()
				const endingBalance = await fundMe.provider.getBalance(
					fundMe.address
				)
				assert.equal(endingBalance.toString(), '0')
			})
	  })
	: describe.skip //skip if on localhost
