// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
/**
 * THIS EXAMPLE USES UN-AUDITED CODE.
 * Network: Rinkeby
 * Base: BTC/USD
 * Base Address: 0xECe365B379E1dD183B20fc5f022230C044d51404
 * Quote: EUR/USD
 * Quote Address: 0x78F9e60608bF48a1155b4B2A5e31F32318a1d85F
 * Decimals: 8 <-----SHOWS DECIMAL VALUE
 */

library PriceConverter {
    
    function getEthPrice(AggregatorV3Interface priceFeed) internal view returns(uint) {
        //interacting w/ external ChainLink contract - dynamic based on chain for the correct address
        (, int price,,,) = priceFeed.latestRoundData();
        //outputs ETH price in USD up to 8 decimals in this case
        return uint(price * 1e10); //price is 1e8; 1**10 will add the 10 more decimals needed to match msg.value, which = 1e18
        //needed to wrap in uint() to also convert/match the msg.value type from INT => UINT
    }

    function getConversionRate(uint ethAmount, AggregatorV3Interface priceFeed) internal view returns(uint) {
        uint ethPrice = getEthPrice(priceFeed);
        uint ethAmountInUsd = (ethPrice * ethAmount) / 1e18; 
        //need to divide by 1e18 since it would otherwise return 1e36 decimals (due to multiplication). 
        //This returns whole Eth price w/o decimals. /1e16 would provide 2 more digits, but would need to add decimals later somehow
        return ethAmountInUsd;
    }
}