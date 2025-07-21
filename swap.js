import {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { DynamicBondingCurveClient } from "@meteora-ag/dynamic-bonding-curve-sdk";
import { BN } from "bn.js";
import dotenv from "dotenv";
dotenv.config();

import bs58 from "bs58";

async function swap() {
  console.log("Swapping Tokens......");

  const keypairData = bs58.decode(process.env.PRIVATE_KEY);
  const secretKey = Uint8Array.from(keypairData);
  const wallet = Keypair.fromSecretKey(secretKey);

  console.log("wallet: ", wallet.publicKey.toBase58());

  const connection = new Connection("https://api.devnet.solana.com", "confirmed");

  const client = new DynamicBondingCurveClient(connection, "confirmed");

  try {
    const configAddress = new PublicKey(
      "4WnDksycxFGundsqAnQ22VLnGwxuBDiyzWN63M1GzwwH"
    );
    const poolAddress = new PublicKey(
      "HhVVYw6krbYLZH49i1Zoj8irsd9BiUPDwUWiyK578KbF"
    );

    // Create and send swap transaction
    const swapAmount = new BN(1000000); // 0.001 tokens (assuming 9 decimals)
    const transaction = await client.pool.swap({
      owner: wallet.publicKey,
      amountIn: swapAmount,
      minimumAmountOut: new BN(0), // Set minimum amount you want to receive, 0 for no minimum
      swapBaseForQuote: false, // true to swap base token for quote token (WSOL), false for opposite
      pool: poolAddress,
      referralTokenAccount: null,
      payer: wallet.publicKey,
    });

    // Get the latest blockhash
    const { blockhash } = await connection.getLatestBlockhash("confirmed");
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = wallet.publicKey;

    // Sign and send the transaction
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [wallet],
      {
        commitment: "confirmed",
        skipPreflight: true,
      }
    );

    console.log("Swap successful!");
    console.log(
      `Transaction: https://solscan.io/tx/${signature}?cluster=devnet`
    );
  } catch (error) {
    console.error("Failed to execute swap:", error);
    throw error;
  }
}

swap()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
