import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { getAccount, getAssociatedTokenAddressSync } from "@solana/spl-token";
import {
  DynamicBondingCurveClient,
  deriveDbcPoolAddress,
} from "@meteora-ag/dynamic-bonding-curve-sdk";
import dotenv from "dotenv";
// import { BN } from "bn.js";
dotenv.config();

// Get Pool Address and It's Progress
async function getPoolProgression() {
  //https://mainnet.helius-rpc.com/79fb27ad-f384-4edd-8eb0-4524558c5392
  const connection = new Connection(
    "https://mainnet.helius-rpc.com/?api-key=d16a79e0-06cb-409f-a8d1-f4d7efa257de",
    "confirmed"
  );

  const client = new DynamicBondingCurveClient(connection, "confirmed");

  // Using the same config address as in createPool.js

  try {

    // Get Pool Address and It's Progress
    console.log("Getting Pool Address and It's Progress......");

    const poolAddress = new PublicKey(
      "EFUG4v6wDhKb47D4SkH9oTXeUfoG8bLbq2VjqDfXrk1t"
    );
    console.log("Pool Address", poolAddress.toBase58());

    const progress = await client.state.getPoolCurveProgress(poolAddress);

    console.log("The Progress rate :", progress);

    // Convert decimal to percentage (0-1 becomes 0%-100%)
    const progressInPercent = progress * 100;
    console.log(
      "The Progress rate in percent :",
      progressInPercent.toFixed(4) + "%"
    );
  } catch (error) {
    console.error("Failed to get pool configuration:", error);
    throw error;
  }
}

getPoolProgression()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });