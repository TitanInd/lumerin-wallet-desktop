<h1>
  <img src="logo.svg" alt="Lumerin Wallet Desktop Application" width="20%">
</h1>

💻💰 Lumerin Wallet for desktop computers

<!--
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

![Lumerin Desktop Wallet](https://lumerin.io/images/lumerin-apps-demo@2x.png) 
-->

## Development

Create a local `.env` file with the following content:

```shell
ENABLED_CHAIN=
ROPSTEN_NODE_URL=
```

### Requirements

- [Node.js](https://nodejs.org) LTS (v12 minimum, v14 recommended)

### Launch

```sh
# Install dependencies
npm i

# Run dev mode
npm run dev
```

#### Troubleshooting

- For errors related to `node-gyp` when installing the dependencies, try using `sudo` to postinstall the dependencies.
- For Windows, installing `windows-build-tools` may be required. To do so, run:

```sh
npm i --global --production windows-build-tools
```

### Logs

The log output is in the next directories:

- **Linux:** `~/.config/<app name>/logs/{process-type}.log`
- **macOS:** `~/Library/Logs/<app name>/logs/{process-type}.log`
- **Windows:** `%USERPROFILE%\AppData\Roaming\<app name>\logs\{process-type}.log`

`process-type` being equal to `main`, `renderer` or `worker`

More info [github.com/megahertz/electron-log](https://github.com/megahertz/electron-log).

### Settings

- **Linux**: `~/.config/lumerin-wallet-desktop/Settings`
- **macOS**: `~/Library/Application Support/lumerin-wallet-desktop/Settings`
- **Windows**: `%APPDATA%\\lumerin-wallet-desktop\\Settings`

To completely remove the application and start over, remove the settings file too.

### Production Build

```sh
npm run release-init
```

wait for container to build and run

```sh
git ls-remote --tags --heads ssh://git@github.com/Lumerin-protocol/ContractsJS.git
```

trust the github host and run

```sh
# Run build process
npm install && npm run dist

# or

# Run build process and publish to GitHub releases
npm install && npm run release
```

#### macOs

The app needs to be signed and notarized.
To do so, install the `.p12` file in the local keychain (double click on it).

The certificate is obtained from the Apple Developer website.
The Developer ID Application is required.
The Developer ID Installer may be required too.
Once obtained, the `.cer` files have to be converted to `.p12` by providing the certificate passwords/private keys.

In addition to that, the following environment variables have to be set to publish:

```sh
# See below to complete these two:
APPLE_ID=
APPLE_ID_PASSWORD=
# See `electron-build` docs on how to complete these two:
CSC_LINK=
CSC_KEY_PASSWORD=
# Github personal access token to upload the files to repo releases.
GH_TOKEN=
```

Follow [these steps to create an app specific password](https://support.apple.com/en-us/HT204397).
The `APPLE_ID` variable is the Apple ID used to create the password.
`APPLE_ID_PASSWORD` is the password Apple created for the app.

The GitHub personal access token needs `repo` permissions.
See the docs on [how to create a personal access access token](https://docs.github.com/en/github/authenticating-to-github/keeping-your-account-and-data-secure/creating-a-personal-access-token) for more information.

The signing certificate shall be in the root folder of the repository.
The certificate password will be required during the signing process.
The signing process may take several minutes because notarization requieres uploading the app to Apple.

In order to verify that the application has been successfully signed and notarized, run:

```sh
# Verifies the app has been signed
codesign --verify --verbose ./dist/mac/Lumerin\ Wallet.app

# Verifies the app has been notarized
spctl -a -t exec -vvv ./dist/mac/Lumerin\ Wallet.app
```

#### Windows

To sign the application, a certificate for the Microsoft Authenticode platform is required.
The certificate, a `.p7b` file, will then be required during the build process.

Current provider is [DigiCert](https://www.digicert.com).

## Contributing

We welcome contributions to the Lumerin Wallet. If you're interested in helping to improve the project, please take a look at the following guidelines to get started:

1.  **Fork** the repository on GitHub
2.  **Clone** the repository to your local machine
3.  **Create a new branch** for your changes
4.  **Make your changes** and **commit** them to your branch
5.  **Push** your changes to your forked repository
6.  **Open a pull request** on the original repository

Please make sure that your code follows the existing code style and that all tests pass before opening a pull request.

If you're not sure where to start, take a look at the [open issues](https://github.com/lumerin-protocol/WalletDesktop/issues) for the project.

Thank you for your contributions!

## License

MIT
