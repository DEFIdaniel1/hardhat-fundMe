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
	address[] private s_funders;
	mapping(address => uint256) private s_addressToAmountFunded;
	uint256 public constant MINIMUM_USD = 10 * 1e18; //1e18 will match the eth amount later
	address private immutable i_owner;
	AggregatorV3Interface private s_priceFeed;

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
		s_priceFeed = AggregatorV3Interface(priceFeedAddress); //interact w/ chainlink contract this way
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
			msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD,
			'Not enough ETH!'
		);
		//can use getConversionRate from the library;
		//same as getConversionRate(msg.value, priceFeed); B/C msg.value... is auto-considered the first parameter of the function called from library
		s_funders.push(msg.sender);
		s_addressToAmountFunded[msg.sender] = msg.value; //set their address to 0
	}

	function withdraw() public onlyOwner {
		for (uint256 i = 0; i < s_funders.length; i++) {
			address funder = s_funders[i];
			s_addressToAmountFunded[funder] = 0; //set value of that funder to 0
		}
		//reset the array
		s_funders = new address[](0); //creates a new array of 0 elements
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

	function cheaperWithdraw() public payable onlyOwner {
		// copy storage variable to memory so don't have to read storage each loop (Costs $$)
		address[] memory funders = s_funders;
		// mappings can't be in memory
		for (uint256 i = 0; i < funders.length; i++) {
			address funder = funders[i];
			s_addressToAmountFunded[funder] = 0;
		}
		s_funders = new address[](0);
		(bool success, ) = i_owner.call{value: address(this).balance}('');
		require(success);
	}

	// View & Pure functions
	function getOwner() public view returns (address) {
		return i_owner;
	}

	function getFunder(uint256 index) public view returns (address) {
		return s_funders[index];
	}

	function getAddressToAmountFunded(address funder)
		public
		view
		returns (uint256)
	{
		return s_addressToAmountFunded[funder];
	}

	function getPriceFeed() public view returns (AggregatorV3Interface) {
		return s_priceFeed;
	}
}
