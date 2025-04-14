# `send-fee-bundle.js` README

## Overview
This script is designed to submit a bundle of transactions to the Binance Smart Chain (BSC) via a specified API. It handles the generation of a fee transaction (to cover the BNB fee of user transactions) and a list of user-defined transactions (such as BNB transfers or contract calls). The transactions are then signed, bundled, and sent to a remote API.

## Requirements
- Node.js
- Web3.js
- Axios

## Installation

### 1. Install dependencies

Run the following command to install the required dependencies:

```bash
npm install web3 axios
```

### 2. Update Configuration

You will need to modify certain configurations in the script before running it:

- **RPC_URL**: URL for BSC RPC.
- **CHAIN_ID**: The chain ID for BSC (56 for BSC mainnet).
- **FEE_ADDRESS**: The address where transaction fees are sent.
- **BASE_FEE_PER_TX**: The fee per user transaction (in BNB).
- **PRIVATE_KEY**: The private key to sign the transactions. **Ensure this is kept secret and secure**.
- **USER_TXS**: This is an array where users can define custom transactions. Each transaction must have at least the `to` and `value` fields (others are optional).
  - Example fields include `to`, `value`, `data`, `gas`, and `gasPrice`.

### 3. Understanding the Script

The script will:
1. **Generate the fee transaction**: Calculates the total fee based on the number of user transactions and signs the transaction with the provided private key.
2. **Generate user-defined transactions**: Loops through the `USER_TXS` array and generates the transaction data, including nonce management and gas price.
3. **Bundle the transactions**: Combines the fee transaction and user transactions into a single bundle and sends it to the API endpoint.
4. **Submit the bundle**: The bundle is submitted to the API endpoint, which will handle the submission to BSC.

### 4. Run the Script

After you’ve updated the configuration, you can run the script with the following command:

```bash
node send-fee-bundle.js
```

### 5. Output

The script will print logs to the console indicating the status of the transaction bundle submission:

- **Success**: A success message will be printed along with the API response.
- **Error**: If an error occurs, the script will output an error message.

## Example of User Transactions (USER_TXS)

Here's an example of how you can define the `USER_TXS` array:

```js
const USER_TXS = [
  {
    to: '0xEaed24a5b97Db3193749EbD5477F96F05b5bA22c',
    value: '0.0000000000000001',
  },
  {
    to: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    data: web3.eth.abi.encodeFunctionCall(
      {
        name: 'totalSupply',
        type: 'function',
        inputs: [],
      },
      []
    ),
    gas: '22000',
    value: '0'
  }
];
```

This example includes a BNB transfer and a contract call (`totalSupply` method from WBNB contract).

## Configuration Details

### RPC_URL

The RPC URL for connecting to the Binance Smart Chain. You can use the official BSC RPC URL or your own RPC server.

Example:

```js
const RPC_URL = 'https://bsc-dataseed.binance.org/';
```

### FEE_ADDRESS

The address that will receive the transaction fees. This can be any wallet address of your choice.

```js
const FEE_ADDRESS = '0xEaed24a5b97Db3193749EbD5477F96F05b5bA22c';
```

### BASE_FEE_PER_TX

The fee that each user transaction will incur (in BNB). This is the cost for using the service.

```js
const BASE_FEE_PER_TX = '0.001'; // 0.001 BNB per user transaction
```

### USER_TXS

This is an array where you can define user transactions. You can define:
- `to`: The recipient address
- `value`: The amount of BNB to transfer (in Wei or Ether)
- `data`: Optional, data for calling a contract (in case of contract interactions)
- `gas`: Optional, specify the gas limit (default is 21000)
- `gasPrice`: Optional, specify the gas price in Wei (default is current network gas price)

Example:

```js
const USER_TXS = [
  {
    to: '0xEaed24a5b97Db3193749EbD5477F96F05b5bA22c',
    value: '0.0000000000000001',
  },
  {
    to: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    data: web3.eth.abi.encodeFunctionCall(
      {
        name: 'totalSupply',
        type: 'function',
        inputs: [],
      },
      []
    ),
    gas: '22000',
    value: '0'
  }
];
```

### PRIVATE_KEY

The private key to sign all transactions. Make sure to keep it secret and secure.

```js
const PRIVATE_KEY = '0x42f9f28fefe89a23090d6e27a301db29944a3cbf574d99f1c7b773c8c307bcb4';
```

## Troubleshooting

If you encounter any errors or issues:

- **Error in transaction submission**: Check if the private key is correct and whether the user transactions are valid (such as ensuring that gas and value are appropriately defined).
- **Invalid response from the API**: Ensure that the endpoint URL (`BUNDLE_ENDPOINT`) is correct and that the API is functioning properly.

## License

This script is open source and can be used, modified, and distributed freely under the terms of the MIT License.
```

---

将此内容保存为 `README.md` 文件，并根据你的需要调整配置项。如果需要进一步帮助，请告诉我！
