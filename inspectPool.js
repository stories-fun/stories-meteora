import { Connection, PublicKey } from "@solana/web3.js";
import { DynamicBondingCurveClient } from "@meteora-ag/dynamic-bonding-curve-sdk";
import { getMint } from'@solana/spl-token';
import dotenv from "dotenv";
dotenv.config();

async function inspectPool() {
  const connection = new Connection("https://api.devnet.solana.com", "confirmed");
  const client = new DynamicBondingCurveClient(connection, "confirmed");

  const configAddress = new PublicKey("4WnDksycxFGundsqAnQ22VLnGwxuBDiyzWN63M1GzwwH");
  const config = await client.state.getPoolConfig(configAddress);

  // Get pool state
  const pools = await client.state.getPoolsByConfig(configAddress);
  if (!pools.length) throw new Error("No pools found!");
  const pool = await client.state.getPool(pools[0].publicKey);

  // Base info
  const baseMint = pool.baseMint;
  const baseMintInfo = await getMint(connection, baseMint);
  const baseDecimals = baseMintInfo.decimals;

  // Quote info
  let quoteDecimals;
  let quoteMintAddress =
    (pool.quoteMint && pool.quoteMint.toBase58?.()) ||
    (config.quoteMint && config.quoteMint.toBase58?.());
  if (!quoteMintAddress || quoteMintAddress === "So11111111111111111111111111111111111111112") {
    quoteDecimals = 9;
    console.log("Quote is native SOL (decimals = 9)");
  } else {
    const quoteMintInfo = await getMint(connection, new PublicKey(quoteMintAddress));
    quoteDecimals = quoteMintInfo.decimals;
    console.log("Quote is SPL:", quoteMintAddress, "Decimals:", quoteDecimals);
  }

  // Print summary
  console.log("Base Mint:", baseMint.toBase58());
  console.log("Base decimals:", baseDecimals);
  console.log("Quote decimals:", quoteDecimals);
  console.log("Base Reserve:", pool.baseReserve?.toString());
  console.log("Quote Reserve:", pool.quoteReserve?.toString());

  // Curve ticks
  if (config.curve) {
    for (let i = 0; i < config.curve.length; i++) {
      const tick = config.curve[i];
      if (tick.sqrtPrice && tick.sqrtPrice.toString() !== "0") {
        console.log(`Curve Bin ${i}: sqrtPrice=${tick.sqrtPrice.toString()} liquidity=${tick.liquidity.toString()}`);
      }
    }
  }
}

inspectPool().catch(console.error);