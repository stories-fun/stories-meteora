import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, createMint } from "@solana/spl-token";
import { DynamicBondingCurveClient } from "@meteora-ag/dynamic-bonding-curve-sdk";
import dotenv from "dotenv";
dotenv.config();

function getClusterUrl(cluster) {
  switch (cluster) {
    case "DEVNET":
      return "https://api.devnet.solana.com";
    case "TESTNET":
      return "https://api.testnet.solana.com";
    case "LOCALNET":
      return "http://127.0.0.1:8899";
    case "CUSTOM":
      return process.env.CUSTOM_RPC;
    default:
      throw new Error("Invalid cluster");
  }
}

// Get Pool Address and It's Progress
async function getConfig() {
  console.log("Getting Pool Configuration......");

  const CLUSTER = process.env.CLUSTER || "DEVNET";
  console.log("CLUSTER: ", CLUSTER);
  const connection = new Connection(
    getClusterUrl(CLUSTER.toUpperCase()),
    "confirmed"
  );

  const client = new DynamicBondingCurveClient(connection, "confirmed");

  // Using the same config address as in createPool.js
  const configAddress = new PublicKey(
    "4WnDksycxFGundsqAnQ22VLnGwxuBDiyzWN63M1GzwwH"
  );

  try {
    // Get Pool Config State
    // const config = await client.state.getPoolConfig(configAddress);

    // console.log("Pool Configuration:", config);

    // Get Pool Address and It's Progress
    const pools = await client.state.getPoolsByConfig(configAddress);
    // console.log("The pools :", pools[0]);

    const poolAddress = pools[0].publicKey;
    console.log("Pool Address", poolAddress.toBase58());

    const progress = await client.state.getPoolCurveProgress(poolAddress);
    console.log("The Progress :", progress);
  } catch (error) {
    console.error("Failed to get pool configuration:", error);
    throw error;
  }
}

getConfig()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
