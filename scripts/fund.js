const { getNamedAccounts, ethers } = require('hardhat')

async function main() {
	const { deployer } = await getNamedAccounts
	const fundMe = await ethers.getContract('FundMe', deployer)
	console.log('Funding contract...')
	const fundTx = await fundMe.fund({
		value: ethers.utils.parseEther('0.01'),
	})
	await fundTx.wait(1)
	console.log('Funded!')
}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.log(error)
		process.exit(1)
	})
