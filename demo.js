// send-fee-bundle.js

import Web3 from 'web3';
import axios from 'axios';

// ======= 全局配置 / Global Configuration =======
const RPC_URL       = 'https://bsc-dataseed.binance.org/'; // BSC 主网 RPC
const CHAIN_ID      = 56; // BSC 主网 Chain ID
const web3          = new Web3(RPC_URL);

const FEE_ADDRESS   = '0xEaed24a5b97Db3193749EbD5477F96F05b5bA22c'; // 手续费接收地址 / Fee receiver address
const BASE_FEE_PER_TX = '0.001';  // 每笔用户交易收取的手续费 (单位：BNB) / Fee per user tx
const PRIVATE_KEY   = '0x42f9f28fefe89a23090d6e27a301db29944a3cbf574d99f1c7b773c8c307bcb4'; // 用于签名所有交易的私钥 / Private key to sign all transactions

// ======= 用户自定义交易列表（不含手续费 tx）/ User-defined transaction list (excluding fee tx) =======
// 可自定义字段：to, value, data, gas, gasPrice / Users can customize fields: to, value, data, gas, gasPrice
const USER_TXS = [
  {
    to: '0xEaed24a5b97Db3193749EbD5477F96F05b5bA22c',
    value: '0.0000000000000001',
  },
  // 示例 - 调用合约 / Example - contract call
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
    gas : '22000',
    value: '0'
  }
];

// Bundle 接口地址 / Bundle API endpoint
const BUNDLE_ENDPOINT = 'https://bundle.gtokentool.com/sendBundleWithoutKey';

/**
 * 生成手续费交易元数据 / Generate fee transaction metadata
 * @param {number} nonce - 签名者地址的 pending nonce / Pending nonce of signer address
 * @param {number} userCount - 用户交易数量 / Number of user transactions
 */
async function generateFeeTxData(nonce, userCount) {
  const gasPrice = Number(await web3.eth.getGasPrice());
  const feeAmount = (parseFloat(BASE_FEE_PER_TX) * userCount).toFixed(18);

  return {
    to: FEE_ADDRESS,
    value: web3.utils.toWei(feeAmount, 'ether'),
    gas: 21000,
    gasPrice,
    nonce,
    chainId: CHAIN_ID,
  };
}

/**
 * 生成用户自定义交易元数据列表 / Generate metadata list for user-defined transactions
 * @param {Array<object>} userTxParams - 用户定义的交易列表 / User-defined transaction list
 * @param {number} startNonce - 起始 nonce / Starting nonce
 * @returns {Promise<Array<object>>}
 */
async function generateUserTxDataList(userTxParams, startNonce) {
  const gasPriceDefault = Number(await web3.eth.getGasPrice());
  return userTxParams.map((tx, idx) => ({
    to: tx.to,
    value: web3.utils.toWei(tx.value || '0', 'ether'),
    data: tx.data || '0x',
    gas: tx.gas || 21000,
    gasPrice: tx.gasPrice ? Number(tx.gasPrice) : gasPriceDefault,
    nonce: startNonce + idx,
    chainId: CHAIN_ID,
  }));
}

/**
 * 签名单笔交易 / Sign a single transaction
 * @param {string} privateKey - 私钥 / Private key
 * @param {object} txData - 交易数据 / Transaction data
 * @returns {Promise<string>}
 */
async function signTransaction(privateKey, txData) {
  const { rawTransaction } = await web3.eth.accounts.signTransaction(txData, privateKey);
  return rawTransaction;
}

(async () => {
  try {
    const userCount = USER_TXS.length;
    const totalTxs = userCount + 1;

    // 检查交易总数是否在允许范围内（1 ~ 50）/ Validate total transaction count (must be 1 to 50)
    if (totalTxs < 1 || totalTxs > 50) {
      throw new Error(`Total number of transactions must be between 1 and 50. Current: ${totalTxs}`);
    }

    // 获取签名地址和 pending nonce / Get signer address and pending nonce
    const signer = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY);
    let nonce = Number(await web3.eth.getTransactionCount(signer.address, 'pending'));

    // 1. 生成并签名手续费交易 / Step 1: Generate and sign fee transaction
    const feeTxData = await generateFeeTxData(nonce, userCount);
    const rawFeeTx = await signTransaction(PRIVATE_KEY, feeTxData);
    nonce += 1;

    // 2. 生成并签名用户自定义交易 / Step 2: Generate and sign user-defined transactions
    const userTxDataList = await generateUserTxDataList(USER_TXS, nonce);
    const rawUserTxs = await Promise.all(
      userTxDataList.map(txData => signTransaction(PRIVATE_KEY, txData))
    );

    // 3. 计算允许的最大区块高度（当前高度 + 100）/ Step 3: Calculate maxBlockNumber (current + 100)
    const currentBlock = Number(await web3.eth.getBlockNumber());
    const maxBlockNumber = currentBlock + 100;

    // 4. 提交交易捆绑包 / Step 4: Submit the transaction bundle
    const res = await axios.post(
      BUNDLE_ENDPOINT,
      { txs: [rawFeeTx, ...rawUserTxs], maxBlockNumber },
      { headers: { 'Content-Type': 'application/json' } }
    );
    console.log('✅ Bundle submitted successfully:', res.data);

  } catch (err) {
    console.error('❌ Error occurred during bundle submission:', err.response?.data || err.message);
    process.exit(1);
  }
})();
