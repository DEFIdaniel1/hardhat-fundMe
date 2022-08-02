// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import './PriceConverter.sol';

error FundMe__NotOwner();

/** @title A contract for crowd funding
 *   @author Daniel Pisterzi
 *   @notice This contract os a demo sample funding contract
 *   @dev This implements price feeds as our library
 */
contract FundMe {
	// Type Declarations
	using PriceConverter for uint256; //imports all of its functions as well

	// State Variables
	uint256 public constant MINIMUM_USD = 10 * 1e18; //1e18 will match the eth amount later
	address[] public funders;
	mapping(address => uint256) public addressToAmountFunded;
	address public immutable i_owner;
	AggregatorV3Interface public priceFeed;

	// Modifiers
	modifier onlyOwner() {
		if (msg.sender != i_owner) {
			revert FundMe__NotOwner();
		} //must run this condition before the rest of the function
		_; //represents completing the rest of the code
	}

	// Functions
	constructor(address priceFeedAddress) {
		i_owner = msg.sender; //owner will be whoever deploys the contract
		priceFeed = AggregatorV3Interface(priceFeedAddress); //interact w/ chainlink contract this way
	}

	receive() external payable {
		fund();
	}

	fallback() external payable {
		fund();
	}

	function fund() public payable {
		//1. Send ETH to the contract
		require(
			msg.value.getConversionRate(priceFeed) >= MINIMUM_USD,
			'Not enough ETH!'
		);
		//can use getConversionRate from the library;
		//same as getConversionRate(msg.value, priceFeed); B/C msg.value... is auto-considered the first parameter of the function called from library
		funders.push(msg.sender);
		addressToAmountFunded[msg.sender] = msg.value; //set their address to 0
	}

	function withdraw() public onlyOwner {
		for (uint256 i = 0; i < funders.length; i++) {
			address funder = funders[i];
			addressToAmountFunded[funder] = 0; //set value of that funder to 0
		}
		//reset the array
		funders = new address[](0); //creates a new array of 0 elements
		//withdraw the funds through transfer - 3 methods

		//transfer
		payable(msg.sender).transfer(address(this).balance);
		//send
		bool sendSuccess = payable(msg.sender).send(address(this).balance);
		require(sendSuccess, 'Send failed');
		//call
		(bool callSuccess, ) = payable(msg.sender).call{
			value: address(this).balance
		}('');
		require(callSuccess, 'Call failed');
	}
}
