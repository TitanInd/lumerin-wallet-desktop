"use strict";

const { ipcMain, app, dialog } = require("electron");
const createCore = require("@lumerin/wallet-core");
const stringify = require("json-stringify-safe");
const os = require("os");

const logger = require("../../logger");
const subscriptions = require("./subscriptions");
const settings = require("./settings");
const storage = require("./storage");

const {
  getAddressAndPrivateKey,
  refreshProxyRouterConnection,
} = require("./handlers/single-core");

const {
  runProxyRouter,
  PROXY_ROUTER_MODE,
  isProxyRouterHealthy,
  getResourcesPath,
} = require("./proxyRouter");
const { runMacosDaemons } = require("./proxyRouter/macos/daemon");
const { runWindowsServices } = require("./proxyRouter/windows/service");

function startCore({ chain, core, config: coreConfig }, webContent) {
  logger.verbose(`Starting core ${chain}`);
  const { emitter, events, api } = core.start(coreConfig);
  const proxyRouterApi = api["proxy-router"];

  // emitter.setMaxListeners(30);
  emitter.setMaxListeners(50);

  events.push(
    "create-wallet",
    "transactions-scan-started",
    "transactions-scan-finished",
    "contracts-scan-started",
    "contracts-scan-finished"
  );

  function send(eventName, data) {
    try {
      if (!webContent) {
        return;
      }
      const payload = Object.assign({}, data, { chain });
      webContent.sender.send(eventName, payload);
    } catch (err) {
      logger.error(err);
    }
  }

  events.forEach((event) =>
    emitter.on(event, function(data) {
      send(event, data);
    })
  );

  function syncTransactions({ address }, page = 1, pageSize = 15) {
    return storage
      .getSyncBlock(chain)
      .then(function(from) {
        send("transactions-scan-started", {});

        return api.explorer
          .syncTransactions(
            0,
            address,
            (number) => storage.setSyncBlock(number, chain),
            page,
            pageSize
          )
          .then(function() {
            send("transactions-scan-finished", { success: true });

            emitter.on("coin-block", function({ number }) {
              storage.setSyncBlock(number, chain).catch(function(err) {
                logger.warn("Could not save new synced block", err);
              });
            });
          });
      })
      .catch(function(err) {
        logger.warn("Could not sync transactions/events", err.stack);
        send("transactions-scan-finished", {
          error: err.message,
          success: false,
        });

        emitter.once("coin-block", () =>
          syncTransactions({ address }, page, pageSize)
        );
      });
  }

  emitter.on("open-wallet", syncTransactions);

  emitter.on("wallet-error", function(err) {
    logger.warn(
      err.inner ? `${err.message} - ${err.inner.message}` : err.message
    );
  });

  const shouldRestartProxyRouterAfterWalletUpdate = () => {
    const prevAppVersion = settings.getAppVersion();
    const isAppVersionChanged = prevAppVersion !== app.getVersion();

    if (!isAppVersionChanged) {
      return false;
    }

    settings.setAppVersion(app.getVersion());
    const choice = dialog.showMessageBoxSync(null, {
      type: "question",
      buttons: ["Restart", "Later"],
      title: "Confirm",
      message:
        "The wallet was updated and requires the restart of background service. Would you like to do it right now or restart manually later? The currently running contracts will be affected.",
    });
    if (choice === 0) {
      return true;
    }
    return false;
  };

  emitter.on("open-proxy-router", async ({ password, restartDaemon }) => {
    const proxyRouterUserConfig = settings.getProxyRouterConfig();
    if (!proxyRouterUserConfig.useHostedProxyRouter) {
      const { address, privateKey } = await getAddressAndPrivateKey(
        { password },
        { api }
      );
      const config = {
        privateKey,
        walletAddress: address,
        ...coreConfig.chain,
        ...proxyRouterUserConfig,
      };
      const shouldRestartProxy = shouldRestartProxyRouterAfterWalletUpdate();

      const isSellerHealthy = await isProxyRouterHealthy(
        api,
        config.localSellerProxyRouterUrl
      );
      const isBuyerHealthy = await isProxyRouterHealthy(
        api,
        config.localBuyerProxyRouterUrl
      );

      if (
        !isSellerHealthy ||
        !isBuyerHealthy ||
        restartDaemon ||
        shouldRestartProxy
      ) {
        logger.debug("Proxy is not healhy, restart...");
        if (os.platform() === "darwin") {
          await proxyRouterApi.kill(config.sellerProxyPort).catch(logger.error);
          await proxyRouterApi.kill(config.buyerProxyPort).catch(logger.error);
          await runMacosDaemons(getResourcesPath(), config);
        } else if(os.platform() === "win32") {
          await proxyRouterApi.kill(config.sellerProxyPort).catch(logger.error);
          await proxyRouterApi.kill(config.buyerProxyPort).catch(logger.error);
          await runWindowsServices(getResourcesPath(), config);
        } else {
          if (!isSellerHealthy) {
            await proxyRouterApi
              .kill(config.sellerProxyPort)
              .catch(logger.error);
            runProxyRouter(config, PROXY_ROUTER_MODE.Seller);
          }

          if (!isBuyerHealthy) {
            await proxyRouterApi
              .kill(config.buyerProxyPort)
              .catch(logger.error);
            runProxyRouter(config, PROXY_ROUTER_MODE.Buyer);
          }
        }
      }

      send("proxy-router-type-changed", {
        isLocal: true,
      });

      refreshProxyRouterConnection(
        {
          sellerNodeUrl: config.localSellerProxyRouterUrl,
          buyerNodeUrl: config.localBuyerProxyRouterUrl,
        },
        { api }
      );
    } else {
      refreshProxyRouterConnection({}, { api });
    }
  });

  return {
    emitter,
    events,
    api,
  };
}

function stopCore({ core, chain }) {
  logger.verbose(`Stopping core ${chain}`);
  core.stop();
}

function createClient(config) {
  ipcMain.on("log.error", function(_, args) {
    logger.error(args.message);
  });

  settings.presetDefaults();

  let core = {
    chain: config.chain.chainId,
    core: createCore(),
    config: Object.assign({}, config.chain, config),
  };

  ipcMain.on("ui-ready", function(webContent, args) {
    const onboardingComplete = !!settings.getPasswordHash();

    storage
      .getState()
      .catch(function(err) {
        logger.warn("Failed to get state", err.message);
        return {};
      })
      .then(function(persistedState) {
        const payload = Object.assign({}, args, {
          data: {
            onboardingComplete,
            persistedState: persistedState || {},
            config,
          },
        });
        webContent.sender.send("ui-ready", payload);
        // logger.verbose(`<-- ui-ready ${stringify(payload)}`);
      })
      .catch(function(err) {
        logger.error("Could not send ui-ready message back", err.message);
      })
      .then(function() {
        const { emitter, events, api } = startCore(core, webContent);
        core.emitter = emitter;
        core.events = events;
        core.api = api;
        subscriptions.subscribe(core);
      })
      .catch(function(err) {
        console.log("panic");
        console.log(err);
        console.log("Unknown chain =", err.message);
        logger.error("Could not start core", err.message);
      });
  });

  ipcMain.on("ui-unload", function() {
    stopCore(core);
    subscriptions.unsubscribe(core);
  });
}

module.exports = { createClient };
