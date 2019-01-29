'use strict'

const handlers = require('../handlers')
const utils = require('./utils')

const withCore = core => fn => data => fn(data, core)

const listeners = {
  'get-convert-coin-gas-limit': handlers.getConvertCoinGasLimit,
  'get-convert-coin-estimate': handlers.getConvertCoinEstimate,
  'get-convert-met-gas-limit': handlers.getConvertMetGasLimit,
  'refresh-all-transactions': handlers.refreshAllTransactions,
  'get-convert-met-estimate': handlers.getConvertMetEstimate,
  'get-auction-gas-limit': handlers.getAuctionGasLimit,
  'get-tokens-gas-limit': handlers.getTokensGasLimit,
  'refresh-transaction': handlers.refreshTransaction,
  'buy-metronome': handlers.buyMetronome,
  'get-gas-limit': handlers.getGasLimit,
  'get-gas-price': handlers.getGasPrice,
  'convert-coin': handlers.convertCoin,
  'convert-met': handlers.convertMet,
  'send-coin': handlers.sendCoin,
  'send-met': handlers.sendMet
}

// Subscribe to messages where only one particular core has to react
function subscribeSingleCore (core) {
  Object.keys(listeners).forEach(function (key) {
    listeners[key] = withCore(core)(listeners[key])
  })

  utils.subscribeTo(listeners, core.chain)
}

const unsubscribeSingleCore = () =>
  utils.unsubscribeTo(listeners)

module.exports = { subscribeSingleCore, unsubscribeSingleCore }
