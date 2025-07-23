import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
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

  const connection = new Connection(
    "https://mainnet.helius-rpc.com/?api-key=d16a79e0-06cb-409f-a8d1-f4d7efa257de", 
    {
      commitment: "confirmed",
      confirmTransactionInitialTimeout: 120000, // 2 minutes
    }
  );

  const client = new DynamicBondingCurveClient(connection, "confirmed");

  try {
    const poolAddress = new PublicKey(
      "EFUG4v6wDhKb47D4SkH9oTXeUfoG8bLbq2VjqDfXrk1t"
    );

    // Create and send swap transaction
    const swapAmount = new BN(1000000); // 0.001 tokens (assuming 9 decimals)
    console.log("Creating swap transaction...");
    const transaction = await client.pool.swap({
      owner: wallet.publicKey,
      amountIn: swapAmount,
      minimumAmountOut: new BN(0), // Set minimum amount you want to receive, 0 for no minimum
      swapBaseForQuote: false, // true to swap base token for quote token (WSOL), false for opposite
      pool: poolAddress,
      referralTokenAccount: null,
      payer: wallet.publicKey,
    });

    // Get the latest blockhash with a longer validity window
    console.log("Getting latest blockhash...");
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("finalized");
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = wallet.publicKey;

    console.log("Sending and confirming transaction...");
    console.log("Transaction will be valid until block height:", lastValidBlockHeight);

    // Method 1: Using sendAndConfirmTransaction with retry logic
    let signature;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        signature = await sendAndConfirmTransaction(
          connection,
          transaction,
          [wallet],
          {
            commitment: "confirmed",
            skipPreflight: false, // Enable preflight checks
            preflightCommitment: "processed",
            maxRetries: 3,
          }
        );
        break; // Success, exit retry loop
      } catch (error) {
        attempts++;
        console.log(`Attempt ${attempts} failed:`, error.message);
        
        if (attempts >= maxAttempts) {
          throw error;
        }
        
        // If transaction expired, get new blockhash and retry
        if (error.message.includes("expired") || error.message.includes("block height")) {
          console.log("Transaction expired, getting new blockhash and retrying...");
          const { blockhash: newBlockhash } = await connection.getLatestBlockhash("finalized");
          transaction.recentBlockhash = newBlockhash;
        }
        
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log("Swap successful!");
    console.log(`Transaction: https://solscan.io/tx/${signature}`);
    
    // Additional verification
    console.log("Verifying transaction...");
    const txInfo = await connection.getTransaction(signature, {
      commitment: "confirmed"
    });
    
    if (txInfo && !txInfo.meta?.err) {
      console.log("Transaction confirmed successfully!");
    } else {
      console.log("Transaction may have failed. Check the explorer link.");
    }

  } catch (error) {
    console.error("Failed to execute swap:", error);
    
    // Additional error handling
    if (error.message.includes("insufficient funds")) {
      console.log("Insufficient funds in wallet");
    } else if (error.message.includes("expired")) {
      console.log("Transaction expired - network congestion or RPC issues");
    } else if (error.message.includes("blockhash not found")) {
      console.log("Blockhash issues - try again");
    }
    
    throw error;
  }
}

// Alternative method using manual transaction sending (more control)
async function swapAlternative() {
  console.log("Alternative swap method with manual transaction handling...");

  const keypairData = bs58.decode(process.env.PRIVATE_KEY);
  const secretKey = Uint8Array.from(keypairData);
  const wallet = Keypair.fromSecretKey(secretKey);

  const connection = new Connection(
    "https://mainnet.helius-rpc.com/?api-key=d16a79e0-06cb-409f-a8d1-f4d7efa257de", 
    "confirmed"
  );

  const client = new DynamicBondingCurveClient(connection, "confirmed");

  try {
    const poolAddress = new PublicKey(
      "EFUG4v6wDhKb47D4SkH9oTXeUfoG8bLbq2VjqDfXrk1t"
    );

    const swapAmount = new BN(1000000);
    
    const transaction = await client.pool.swap({
      owner: wallet.publicKey,
      amountIn: swapAmount,
      minimumAmountOut: new BN(0),
      swapBaseForQuote: false,
      pool: poolAddress,
      referralTokenAccount: null,
      payer: wallet.publicKey,
    });

    // Get fresh blockhash
    const { blockhash } = await connection.getLatestBlockhash("finalized");
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = wallet.publicKey;

    // Sign transaction
    transaction.sign(wallet);

    // Send raw transaction
    console.log("Sending raw transaction...");
    const rawTransaction = transaction.serialize();
    const signature = await connection.sendRawTransaction(rawTransaction, {
      skipPreflight: false,
      preflightCommitment: "processed",
    });

    console.log("Transaction sent:", signature);

    // Manually confirm with timeout
    const confirmation = await connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight: await connection.getBlockHeight(),
    });

    if (confirmation.value.err) {
      throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
    }

    console.log("Alternative swap successful!");
    console.log(`Transaction: https://solscan.io/tx/${signature}`);

  } catch (error) {
    console.error("Alternative swap failed:", error);
    throw error;
  }
}

// Run the swap with error handling
async function main() {
  try {
    await swap();
  } catch (error) {
    console.log("\n🔄 Main method failed, trying alternative method...\n");
    try {
      await swapAlternative();
    } catch (altError) {
      console.error("Both methods failed:", altError);
      process.exit(1);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("All methods failed:", error);
    process.exit(1);
  });