import { Connection, PublicKey } from "@solana/web3.js";
import { DynamicBondingCurveClient } from "@meteora-ag/dynamic-bonding-curve-sdk";
import BN from "bn.js";
import dotenv from "dotenv";
dotenv.config();

async function getSwapQuote() {
  console.log("Getting DBC swap quote preview...");

  const CLUSTER = process.env.CLUSTER || "DEVNET";
  const connection = new Connection("https://api.devnet.solana.com", "confirmed");
  const client = new DynamicBondingCurveClient(connection, "confirmed");

  // Use your known pool config address here
  const configAddress = new PublicKey("4WnDksycxFGundsqAnQ22VLnGwxuBDiyzWN63M1GzwwH");

  const pools = await client.state.getPoolsByConfig(configAddress);
  if (!pools.length) throw new Error("No pools found for this config");

  const poolAddress = pools[0].publicKey;
  const virtualPool = await client.state.getPool(poolAddress);
  if (!virtualPool) throw new Error("Pool not found!");

  const config = await client.state.getPoolConfig(virtualPool.config);

  // === Swap Parameters ===
  const amountIn = new BN("1000000000"); // For example: 1.0 (with 9 decimals) = 1_000_000_000
  const swapBaseForQuote = false;         // true = base → quote; false = quote → base
  const slippageBps = 100;               // 1%
  const hasReferral = false;

  // "currentPoint" depends on pool config activation type
  let currentPoint;
  if (config.activationType === 0) {
    // slot
    const slot = await connection.getSlot();
    currentPoint = new BN(slot);
  } else {
    // timestamp
    const slot = await connection.getSlot();
    const blockTime = await connection.getBlockTime(slot);
    currentPoint = new BN(blockTime || 0);
  }

  // === Get the swap quote ===
  const quote = await client.pool.swapQuote({
    virtualPool,
    config,
    swapBaseForQuote,
    amountIn,
    slippageBps,
    hasReferral,
    currentPoint,
  });

  // === Print out the details ===
  console.log('Swap Quote:');
  console.log('  amountIn:', amountIn.toString());
  console.log('  amountOut:', quote.amountOut.toString());
  console.log('  minimumAmountOut:', quote.minimumAmountOut.toString());
  console.log('  priceBefore:', quote.price.beforeSwap.toString());
  console.log('  priceAfter:', quote.price.afterSwap.toString());
  console.log('  tradingFee:', quote.fee.trading.toString());
  console.log('  protocolFee:', quote.fee.protocol.toString());
  console.log('  referralFee:', quote.fee.referral ? quote.fee.referral.toString() : "0");
}

getSwapQuote()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
