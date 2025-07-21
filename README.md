# Dynamic Bonding Curve SDK

A comprehensive JavaScript SDK for creating and managing Dynamic Bonding Curves on Solana. This SDK provides functionality for pool creation, token swapping, migration, and fee management using the Meteora Dynamic Bonding Curve protocol.

## 🚀 Features

- **Pool Management**: Create and configure bonding curve pools
- **Token Operations**: Swap tokens with dynamic pricing
- **Migration Support**: Migrate pools to DAMM V1/V2
- **Fee Management**: Handle trading fees, partner fees, and creator fees
- **Curve Configuration**: Customize bonding curve parameters
- **Real-time Quotes**: Get accurate swap quotes before execution

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- A Solana wallet with sufficient SOL for transactions
- Basic understanding of Solana and SPL tokens

## 🛠 Installation

1. Clone the repository:
```bash
git clone <your-repository-url>
cd dynamic-bonding-curve-sdk
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
```bash
cp .env.sample .env
```

4. Edit `.env` file with your configuration:
```env
PRIVATE_KEY=your_wallet_private_key_in_base58_format
CLUSTER=DEVNET
```

**⚠️ Security Warning**: Never commit your `.env` file. Keep your private keys secure and never share them.

## 🎯 Quick Start

### 1. Create a Configuration

First, create a bonding curve configuration:

```bash
npm run create
```

This script (`createConfig.js`) will:
- Generate a new configuration keypair
- Set up bonding curve parameters
- Deploy the configuration to Solana

### 2. Create a Pool

After creating a configuration, create a token pool:

```bash
npm run cPool
```

This script (`createPool.js`) will:
- Generate a new token mint
- Create the bonding curve pool
- Associate it with your configuration

### 3. Execute Swaps

Trade tokens using the bonding curve:

```bash
npm run swap
```

### 4. Monitor Pool Status

Check your pool's progress and statistics:

```bash
npm run gPool
```

## 📁 Project Structure

```
├── createConfig.js     # Create bonding curve configuration
├── createPool.js       # Create new token pools
├── getPool.js         # Retrieve pool information
├── inspectPool.js     # Detailed pool inspection
├── swap.js            # Execute token swaps
├── swapQuote.js       # Get swap quotes
├── package.json       # Project dependencies
├── .env.sample        # Environment variables template
├── .gitignore         # Git ignore rules
├── Notes.md           # Development notes
└── README.md          # This file
```

## 🔧 Configuration Parameters

### Curve Configuration

```javascript
const curveConfig = buildCurve({
  totalTokenSupply: 1000000000,              // Total token supply
  percentageSupplyOnMigration: 10,           // % available at migration
  migrationQuoteThreshold: 20,               // Migration threshold
  migrationOption: 1,                        // DAMM_V1 = 0, DAMM_V2 = 1
  tokenBaseDecimal: 9,                       // Base token decimals
  tokenQuoteDecimal: 9,                      // Quote token decimals
  dynamicFeeEnabled: true,                   // Enable dynamic fees
  activationType: 0,                         // Slot = 0, Timestamp = 1
  collectFeeMode: 0,                         // QuoteToken = 0, OutputToken = 1
});
```

### Fee Configuration

```javascript
baseFeeParams: {
  baseFeeMode: BaseFeeMode.FeeSchedulerLinear,
  feeSchedulerParam: {
    startingFeeBps: 100,    // Starting fee in basis points
    endingFeeBps: 100,      // Ending fee in basis points
    numberOfPeriod: 0,      // Number of fee periods
    totalDuration: 0,       // Total duration for fee changes
  },
}
```

## 📊 Usage Examples

### Creating a Pool with Custom Parameters

```javascript
import { DynamicBondingCurveClient, buildCurve, BaseFeeMode } from "@meteora-ag/dynamic-bonding-curve-sdk";

const client = new DynamicBondingCurveClient(connection, "confirmed");

const curveConfig = buildCurve({
  totalTokenSupply: 1000000000,
  percentageSupplyOnMigration: 15,
  migrationQuoteThreshold: 25,
  migrationOption: 1, // DAMM_V2
  tokenBaseDecimal: 9,
  tokenQuoteDecimal: 9,
  baseFeeParams: {
    baseFeeMode: BaseFeeMode.FeeSchedulerLinear,
    feeSchedulerParam: {
      startingFeeBps: 200,
      endingFeeBps: 50,
      numberOfPeriod: 10,
      totalDuration: 3600, // 1 hour
    },
  },
  dynamicFeeEnabled: true,
});
```

### Executing a Swap

```javascript
const swapTransaction = await client.pool.swap({
  owner: wallet.publicKey,
  amountIn: new BN(1000000000), // 1 SOL (9 decimals)
  minimumAmountOut: new BN(0),
  swapBaseForQuote: false, // false = buy tokens, true = sell tokens
  pool: poolAddress,
  referralTokenAccount: null,
});
```

### Getting a Swap Quote

```javascript
const quote = await client.pool.swapQuote({
  virtualPool,
  config,
  swapBaseForQuote: false,
  amountIn: new BN("1000000000"),
  slippageBps: 100, // 1% slippage
  hasReferral: false,
  currentPoint,
});

console.log('Expected output:', quote.amountOut.toString());
console.log('Minimum output:', quote.minimumAmountOut.toString());
console.log('Trading fee:', quote.fee.trading.toString());
```

## 🌐 Network Configuration

The SDK supports multiple Solana networks:

- **Devnet**: `https://api.devnet.solana.com` (default)
- **Testnet**: `https://api.testnet.solana.com`
- **Mainnet**: `https://api.mainnet-beta.solana.com`
- **Localnet**: `http://127.0.0.1:8899`

Set your preferred network in the `.env` file:
```env
CLUSTER=DEVNET
```

## 📈 Fee Structure

### Base Fees
- Measured in basis points (1 bp = 0.01%)
- Can be linear or exponential
- Configurable duration and periods

### Dynamic Fees
- Automatically adjust based on market conditions
- Capped at 20% of base fee
- Help balance pool liquidity

### Migration Fees
- **DAMM V1**: 25-100 basis points
- **DAMM V2**: 100-600 basis points
- Varies based on pool configuration

## 🔍 Monitoring and Analytics

### Pool Information
```javascript
// Get pool configuration
const config = await client.state.getPoolConfig(configAddress);

// Get pool details
const pool = await client.state.getPool(poolAddress);

// Get curve progress
const progress = await client.state.getPoolCurveProgress(poolAddress);
```

### Transaction Tracking
All transactions return signatures that can be viewed on Solscan:
- **Devnet**: `https://solscan.io/tx/{signature}?cluster=devnet`
- **Mainnet**: `https://solscan.io/tx/{signature}`

## 🛡️ Security Best Practices

1. **Private Key Management**:
   - Never commit private keys to version control
   - Use environment variables for sensitive data
   - Consider using hardware wallets for mainnet

2. **Transaction Safety**:
   - Always verify transaction parameters
   - Use appropriate slippage protection
   - Test on devnet before mainnet deployment

3. **Pool Configuration**:
   - Carefully review all curve parameters
   - Understand fee implications
   - Test migration scenarios

## 🚨 Error Handling

Common issues and solutions:

### Insufficient Balance
```
Error: Insufficient funds
```
**Solution**: Ensure your wallet has enough SOL for transaction fees and token purchases.

### Invalid Pool Configuration
```
Error: Pool configuration invalid
```
**Solution**: Verify all curve parameters are within valid ranges.

### Network Issues
```
Error: Connection failed
```
**Solution**: Check your network connection and RPC endpoint status.

## 📚 Advanced Features

### Partner Integration
- Custom partner metadata
- Partner fee sharing
- Surplus withdrawal mechanisms

### Creator Tools
- Pool metadata management
- Creator fee collection
- Ownership transfer capabilities

### Migration Options
- Automated migration triggers
- Vesting schedule configuration
- Leftover token management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [Meteora Dynamic Bonding Curve Docs](https://docs.meteora.ag/)
- **Discord**: [Meteora Community](https://discord.gg/meteora)
- **GitHub Issues**: [Report bugs or request features](https://github.com/your-repo/issues)

## 🙏 Acknowledgments

- [Meteora Protocol](https://meteora.ag/) for the Dynamic Bonding Curve SDK
- [Solana](https://solana.com/) for the blockchain infrastructure
- [SPL Token Program](https://spl.solana.com/) for token standards

---

**⚡ Ready to start building?** Run `npm run create` to create your first bonding curve configuration!