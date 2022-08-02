const { network, deployments, ethers, getNamedAccounts } = require('hardhat')
const { assert, expect } = require('chai')

const chainId = network.config.chainId
chainId == '31337'
	? describe('FundMe', async function () {
			let fundMe
			let deployer
			let mockV3Aggregator
			const sendValue = ethers.utils.parseEther('1') // equals 1 ETH - adds 18 zeroes for you
			beforeEach(async function () {
				// getting accounts for testing
				// const accounts = await ethers.getSigners()
				// const accountZero = accounts[0] // gives the first contract address in the array pulled
				deployer = (await getNamedAccounts()).deployer // same as const { deployer } = await getNamedAccounts()

				await deployments.fixture(['all']) //deploys all contracts w/ the tag 'all'
				fundMe = await ethers.getContract('FundMe', deployer) //gets most recent fundme contract
				mockV3Aggregator = await ethers.getContract(
					'MockV3Aggregator',
					deployer
				)
			})

			describe('constructor', async function () {
				it('Sets the aggregator addresses correctly', async function () {
					// comparing getPriceFeed input to match mockV3 contract on local
					const response = await fundMe.getPriceFeed()
					assert.equal(response, mockV3Aggregator.address)
				})
			})

			// should add unit tests for receive / fallback

			describe('fund', async function () {
				// msg.value > minUSD
				//getFunder.push(msg.sender)
				it('Must send enough ETH', async function () {
					// await fundMe.fund() - fails without waffle testing. but failing, is what we want!
					await expect(fundMe.fund()).to.be.revertedWith(
						'Not enough ETH!'
					)
				})
				it('Updates the amount funded Mapping(address => uint)', async function () {
					await fundMe.fund({ value: sendValue })
					const response = await fundMe.getAddressToAmountFunded(
						deployer
					)
					// deployer is the 0xaddress of the contract deployer. calling it will call its uint mapping value
					assert.equal(response.toString(), sendValue.toString())
				})
				it('Add funder to array of getFunder', async function () {
					await fundMe.fund({ value: sendValue })
					const response = await fundMe.getFunder(0) //pulls getFunder array at index 0
					assert.equal(response, deployer)
				})
			})

			describe('withdraw', async function () {
				beforeEach(async function () {
					await fundMe.fund({ value: sendValue })
				})
				it('Withdraws ETH from a single founder', async function () {
					// Arrange
					const startingFundMeBalance =
						await fundMe.provider.getBalance(fundMe.address)
					const startingDeployerBalance =
						await fundMe.provider.getBalance(deployer)
					// Act
					const withdrawTx = await fundMe.withdraw()
					const transactionReceipt = await withdrawTx.wait(1)
					const { gasUsed, effectiveGasPrice } = transactionReceipt
					const gasCost = gasUsed.mul(effectiveGasPrice) //bigNumbers, so need .mul method

					const endingFundMeBalance =
						await fundMe.provider.getBalance(fundMe.address)
					const endingDeployerBalance =
						await fundMe.provider.getBalance(deployer)

					// Assert
					assert.equal(endingFundMeBalance, 0) //contract should be empty
					assert.equal(
						startingFundMeBalance
							.add(startingDeployerBalance)
							.toString(), // bigNumber, so need to use .add() method : could have been +
						endingDeployerBalance.add(gasCost).toString() // withdraw costs gas, so need to account for that
					)
				})
				it('Allows withdrawal with multiple getFunder', async function () {
					// Arrange
					const accounts = await ethers.getSigners()
					//loops through non-deployer accounts, gets them to fund() contract
					for (let i = 1; i < 6; i++) {
						const fundMeConnectedContract = await fundMe.connect(
							accounts[i]
						)
						await fundMeConnectedContract.fund({ value: sendValue })
					}
					const startingFundMeBalance =
						await fundMe.provider.getBalance(fundMe.address)
					const startingDeployerBalance =
						await fundMe.provider.getBalance(deployer)

					// Act
					const withdrawTx = await fundMe.withdraw()
					const transactionReceipt = await withdrawTx.wait(1)
					const { gasUsed, effectiveGasPrice } = transactionReceipt
					const gasCost = gasUsed.mul(effectiveGasPrice) //bigNumbers, so need .mul method
					const endingFundMeBalance =
						await fundMe.provider.getBalance(fundMe.address)
					const endingDeployerBalance =
						await fundMe.provider.getBalance(deployer)

					// Assert
					assert.equal(endingFundMeBalance, 0) //contract should be empty
					assert.equal(
						startingFundMeBalance
							.add(startingDeployerBalance)
							.toString(), // bigNumber, so need to use .add() method : could have been +
						endingDeployerBalance.add(gasCost).toString() // withdraw costs gas, so need to account for that
					)
					// Make sure getFunder array resets all values to 0
					await expect(fundMe.getFunder(0)).to.be.reverted
					for (let i = 1; i < 6; i++) {
						assert.equal(
							await fundMe.getAddressToAmountFunded(
								accounts[i].address
							),
							0
						)
					}
				})

				it('Only allows the contract owner to withdraw', async function () {
					const accounts = await ethers.getSigners()
					const attacker = accounts[1] //0 is owner
					const attackerConnectedContract = await fundMe.connect(
						attacker
					)
					await expect(
						attackerConnectedContract.withdraw()
					).to.be.revertedWithCustomError(fundMe, 'FundMe__NotOwner')
				})
			})

			//////////////////////////CHEAPER WITHDRAW TEST

			describe('cheaperWithdraw testing...', async function () {
				beforeEach(async function () {
					await fundMe.fund({ value: sendValue })
				})
				it('Withdraws ETH from a single founder', async function () {
					// Arrange
					const startingFundMeBalance =
						await fundMe.provider.getBalance(fundMe.address)
					const startingDeployerBalance =
						await fundMe.provider.getBalance(deployer)
					// Act
					const withdrawTx = await fundMe.cheaperWithdraw()
					const transactionReceipt = await withdrawTx.wait(1)
					const { gasUsed, effectiveGasPrice } = transactionReceipt
					const gasCost = gasUsed.mul(effectiveGasPrice) //bigNumbers, so need .mul method

					const endingFundMeBalance =
						await fundMe.provider.getBalance(fundMe.address)
					const endingDeployerBalance =
						await fundMe.provider.getBalance(deployer)

					// Assert
					assert.equal(endingFundMeBalance, 0) //contract should be empty
					assert.equal(
						startingFundMeBalance
							.add(startingDeployerBalance)
							.toString(), // bigNumber, so need to use .add() method : could have been +
						endingDeployerBalance.add(gasCost).toString() // withdraw costs gas, so need to account for that
					)
				})
				it('Allows withdrawal with multiple getFunder', async function () {
					// Arrange
					const accounts = await ethers.getSigners()
					//loops through non-deployer accounts, gets them to fund() contract
					for (let i = 1; i < 6; i++) {
						const fundMeConnectedContract = await fundMe.connect(
							accounts[i]
						)
						await fundMeConnectedContract.fund({ value: sendValue })
					}
					const startingFundMeBalance =
						await fundMe.provider.getBalance(fundMe.address)
					const startingDeployerBalance =
						await fundMe.provider.getBalance(deployer)

					// Act
					const withdrawTx = await fundMe.cheaperWithdraw()
					const transactionReceipt = await withdrawTx.wait(1)
					const { gasUsed, effectiveGasPrice } = transactionReceipt
					const gasCost = gasUsed.mul(effectiveGasPrice) //bigNumbers, so need .mul method
					const endingFundMeBalance =
						await fundMe.provider.getBalance(fundMe.address)
					const endingDeployerBalance =
						await fundMe.provider.getBalance(deployer)

					// Assert
					assert.equal(endingFundMeBalance, 0) //contract should be empty
					assert.equal(
						startingFundMeBalance
							.add(startingDeployerBalance)
							.toString(), // bigNumber, so need to use .add() method : could have been +
						endingDeployerBalance.add(gasCost).toString() // withdraw costs gas, so need to account for that
					)
					// Make sure getFunder array resets all values to 0
					await expect(fundMe.getFunder(0)).to.be.reverted
					for (let i = 1; i < 6; i++) {
						assert.equal(
							await fundMe.getAddressToAmountFunded(
								accounts[i].address
							),
							0
						)
					}
				})

				it('Only allows the contract owner to withdraw', async function () {
					const accounts = await ethers.getSigners()
					const attacker = accounts[1] //0 is owner
					const attackerConnectedContract = await fundMe.connect(
						attacker
					)
					await expect(
						attackerConnectedContract.cheaperWithdraw()
					).to.be.revertedWithCustomError(fundMe, 'FundMe__NotOwner')
				})
			})
	  })
	: describe.skip
