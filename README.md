# Dynamic Bonding Curve SDK

This SDK provides functionality for creating and managing Dynamic Bonding Curves on Solana. It includes tools for pool creation, token swapping, migration, and fee management.

## Prerequisites

1. Node.js and npm installed
2. A Solana wallet with sufficient SOL for transactions
3. Environment variables setup:
   - Create a `.env` file in the root directory
   - Copy the contents from `.env.sample`
   - Replace `your_private_key_here` with your wallet's private key in base58 format

Example `.env` file:

```
WALLET_PRIVATE_KEY=your_private_key_here
```

⚠️ IMPORTANT: Never commit your `.env` file containing your private key. Make sure it's listed in your `.gitignore`.

## Available Programs

### 1. Partner Functions

- `createConfig`: Create new config keys for pool behavior
- `createPartnerMetadata`: Create partner metadata
- `claimPartnerTradingFee`: Claim trading fees for partners
- `partnerWithdrawSurplus`: Withdraw partner surplus
- `partnerWithdrawMigrationFee`: Withdraw migration fees

### 2. Pool Functions

- `createPool`: Create new pools
- `createConfigAndPool`: Create config and pool in one transaction
- `swap`: Execute token swaps
- `swapQuote`: Get swap quotations
- `createPoolWithFirstBuy`: Create pool and execute first buy
- `createPoolWithPartnerAndCreatorFirstBuy`: Create pool with partner and creator first buys

### 3. Migration Functions

- `createLocker`: Create locker for vesting
- `migrateToDammV1`: Migrate to DAMM V1
- `migrateToDammV2`: Migrate to DAMM V2
- `withdrawLeftover`: Withdraw leftover tokens

### 4. Creator Functions

- `createPoolMetadata`: Create pool metadata
- `claimCreatorTradingFee`: Claim creator trading fees
- `creatorWithdrawSurplus`: Withdraw creator surplus
- `transferPoolCreator`: Transfer pool creator rights

## Common Parameter Values

### Token Decimals

```typescript
enum TokenDecimal {
  SIX = 6,
  NINE = 9,
}
```

### Migration Options

```typescript
enum MigrationOption {
  DAMM_V1 = 0,
  DAMM_V2 = 1,
}
```

### Fee Modes

```typescript
enum BaseFeeMode {
  FeeSchedulerLinear = 0,
  FeeSchedulerExponential = 1,
  RateLimiter = 2,
}
```

### Activation Types

```typescript
enum ActivationType {
  Slot = 0,
  Timestamp = 1,
}
```

### Collection Fee Modes

```typescript
enum CollectFeeMode {
  QuoteToken = 0,
  OutputToken = 1,
}
```

## Example Usage

### 1. Creating a Config and Pool

```typescript
// Build curve configuration
const curveConfig = buildCurve({
  totalTokenSupply: 1000000000,
  percentageSupplyOnMigration: 10,
  migrationQuoteThreshold: 20,
  migrationOption: MigrationOption.DAMM_V2,
  tokenBaseDecimal: TokenDecimal.NINE,
  tokenQuoteDecimal: TokenDecimal.NINE,
  lockedVestingParam: {
    totalLockedVestingAmount: 0,
    numberOfVestingPeriod: 0,
    cliffUnlockAmount: 0,
    totalVestingDuration: 0,
    cliffDurationFromMigrationTime: 0,
  },
  baseFeeParams: {
    baseFeeMode: BaseFeeMode.FeeSchedulerLinear,
    feeSchedulerParam: {
      startingFeeBps: 100,
      endingFeeBps: 100,
      numberOfPeriod: 0,
      totalDuration: 0,
    },
  },
  dynamicFeeEnabled: true,
  activationType: ActivationType.Slot,
  collectFeeMode: CollectFeeMode.QuoteToken,
});

// Create config and pool
const transaction = await client.pool.createConfigAndPool({
  payer: wallet.publicKey,
  config: configKeypair.publicKey,
  feeClaimer: wallet.publicKey,
  quoteMint: WSOL_ADDRESS,
  ...curveConfig,
  preCreatePoolParam: {
    baseMint: baseMintKeypair.publicKey,
    name: "My Token",
    symbol: "MTK",
    uri: "https://example.com/metadata",
    poolCreator: wallet.publicKey,
  },
});
```

### 2. Executing a Swap

```typescript
const swapTx = await client.pool.swap({
  owner: wallet.publicKey,
  amountIn: new BN(1000000000), // 1 SOL
  minimumAmountOut: new BN(0),
  swapBaseForQuote: false, // false = buy tokens, true = sell tokens
  pool: poolAddress,
  referralTokenAccount: null,
});
```

### 3. Getting Pool Information

```typescript
// Get pool configuration
const poolConfig = await client.state.getPoolConfig(configAddress);

// Get pool details
const pool = await client.state.getPool(poolAddress);

// Get pool progress
const progress = await client.state.getPoolCurveProgress(poolAddress);
```

## Important Notes

1. **Fee Calculations**:

   - Base fees are in basis points (1 bp = 0.01%)
   - Dynamic fees are capped at 20% of base fee
   - Migration fees depend on the selected option (25bp to 600bp)

2. **Time Units**:

   - For Slot activation type: 400ms per slot
   - For Timestamp activation type: 1000ms (1 second)

3. **Token Types**:

   - SPL Tokens (type 0)
   - Token2022 (type 1)

4. **Security**:
   - Always verify transaction parameters
   - Use appropriate slippage protection
   - Keep private keys secure

## Error Handling

Always wrap transactions in try-catch blocks:

```typescript
try {
  const transaction = await client.pool.swap({...});
  // Process transaction
} catch (error) {
  console.error("Swap failed:", error);
  // Handle error appropriately
}
```

## Best Practices

1. **Pool Creation**:

   - Test configurations on devnet first
   - Verify all parameters before deployment
   - Use appropriate decimal places for tokens

2. **Swapping**:

   - Always set reasonable slippage tolerance
   - Check pool liquidity before large swaps
   - Monitor dynamic fees for optimal timing

3. **Migration**:
   - Verify migration requirements are met
   - Test migration process on smaller amounts
   - Keep track of vesting schedules if used

## Getting Help

For more detailed information about specific functions and their parameters, refer to the full SDK documentation. If you encounter issues:

1. Check the function documentation for parameter requirements
2. Verify all public key addresses are correct
3. Ensure sufficient token balances and SOL for fees
4. Monitor transaction logs for specific error messages
