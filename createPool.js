import {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { DynamicBondingCurveClient } from "@meteora-ag/dynamic-bonding-curve-sdk";
import dotenv from "dotenv";
dotenv.config();
import bs58 from "bs58";

async function createPool() {
  const keypairData = bs58.decode(process.env.PRIVATE_KEY);
  const secretKey = Uint8Array.from(keypairData);
  const wallet = Keypair.fromSecretKey(secretKey);

  const connection = new Connection(
    "https://api.devnet.solana.com",
    "confirmed"
  );

  const configAddress = new PublicKey(
    "4WnDksycxFGundsqAnQ22VLnGwxuBDiyzWN63M1GzwwH"
  );

  console.log(`Using config: ${configAddress.toString()}`);

  try {
    const baseMint = Keypair.generate();
    console.log(`Generated base mint: ${baseMint.publicKey.toString()}`);

    const createPoolParam = {
      baseMint: baseMint.publicKey,
      config: configAddress,
      name: "DIP_POOL",
      symbol: "DIP",
      uri: "https://raw.githubusercontent.com/soumalya340/Raw_Data/refs/heads/main/raw_uri",
      payer: wallet.publicKey,
      poolCreator: wallet.publicKey,
    };

    const client = new DynamicBondingCurveClient(connection, "confirmed");

    console.log("Creating pool transaction...");
    const poolTransaction = await client.pool.createPool(createPoolParam);

    const signature = await sendAndConfirmTransaction(
      connection,
      poolTransaction,
      [wallet, baseMint, wallet],
      {
        commitment: "confirmed",
        skipPreflight: true,
      }
    );
    console.log("Transaction confirmed!");
    console.log(
      `Pool created: https://solscan.io/tx/${signature}?cluster=devnet`
    );
  } catch (error) {
    console.error("Failed to create pool:", error);
    console.log("Error details:", JSON.stringify(error, null, 2));
  }
}

createPool()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
