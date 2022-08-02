const { getNamedAccounts, ethers } = require('hardhat')

async function main() {
	const { deployer } = await getNamedAccounts()
	const fundMe = await ethers.getContract('FundMe', deployer)
	console.log('Withdrawing...')
	const withdrawTx = await fundMe.withdraw()
	await withdrawTx.wait(1)
	console.log('Money has been welcomed home!')
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.log(error)
		process.exit(1)
	})
