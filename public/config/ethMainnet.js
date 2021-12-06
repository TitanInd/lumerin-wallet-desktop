'use strict';

const LumerinContracts = require('@lumerin/contracts')
const { Lumerin, WebFacing } = LumerinContracts['mainnet'];

module.exports = {
  displayName: 'Ethereum',
  chainId: 1,
  symbol: 'ETH',

  // contracts addresses
  lmrTokenAddress: Lumerin.address,
  webfacingAddress: WebFacing.address,

  // urls
  explorerUrl: 'https://etherscan.io/tx/{{hash}}',
  indexerUrl: 'https://indexer.metronome.io',
  wsApiUrl: 'wss://eth.wallet.metronome.io:8546',

  // defauls
  coinDefaultGasLimit: '21000',
  lmrDefaultGasLimit: '250000',
  defaultGasPrice: '1000000000',
  maxGasPrice: '20000000000000000'
};
