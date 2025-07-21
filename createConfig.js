import {
  PublicKey,
  Connection,
  Keypair,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { createMint } from "@solana/spl-token";
import {
  BaseFeeMode,
  DynamicBondingCurveClient,
  buildCurve,
} from "@meteora-ag/dynamic-bonding-curve-sdk";
import { BN } from "bn.js";
import dotenv from "dotenv";
dotenv.config();
import bs58 from "bs58";

// Initialize connection and client
const connection = new Connection("https://api.devnet.solana.com", "confirmed");

const client = new DynamicBondingCurveClient(connection, "confirmed");

// Function to create a new mint and set up the pool
async function setupConfig() {
  try {
    const keypairData = bs58.decode(process.env.PRIVATE_KEY);
    const secretKey = Uint8Array.from(keypairData);
    const wallet = Keypair.fromSecretKey(secretKey);
    console.log("Public key : ", wallet.publicKey.toBase58());

    // Config Keypair Generate

    let config = Keypair.generate();
    console.log("Created config:", config.publicKey.toBase58());

    // 1. Build the curve configuration (off-chain math)
    const curveConfig = buildCurve({
      totalTokenSupply: 1000000000,
      percentageSupplyOnMigration: 10,
      migrationQuoteThreshold: 20,
      migrationOption: 1,
      tokenBaseDecimal: 9,
      tokenQuoteDecimal: 9,
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
      activationType: 0,
      collectFeeMode: 0,
      migrationFeeOption: 5,
      tokenType: 1,
      partnerLpPercentage: 0,
      creatorLpPercentage: 0,
      partnerLockedLpPercentage: 100,
      creatorLockedLpPercentage: 0,
      creatorTradingFeePercentage: 0,
      leftover: 10000,
      tokenUpdateAuthority: 1,
      migrationFee: {
        feePercentage: 0,
        creatorFeePercentage: 0,
      },
    });

    const configSetup = await client.partner.createConfig({
      config: config.publicKey,
      feeClaimer: wallet.publicKey,
      leftoverReceiver: wallet.publicKey,
      payer: wallet.publicKey,
      quoteMint: new PublicKey("So11111111111111111111111111111111111111112"),
      ...curveConfig,
    });
    console.log("transaction created successfully");

    // Get the latest blockhash
    const { blockhash } = await connection.getLatestBlockhash("confirmed");
    configSetup.recentBlockhash = blockhash;
    configSetup.feePayer = wallet.publicKey;

    console.log("signing the transaction");
    // Sign the transaction with both the wallet and config keypair
    configSetup.partialSign(wallet);
    configSetup.partialSign(config);

    console.log("sending and confirming the transaction");
    // Send and confirm the transaction
    const signature = await sendAndConfirmTransaction(
      connection,
      configSetup,
      [wallet, config],
      { commitment: "confirmed" }
    );

    console.log("Config created successfully!");
    console.log(`Transaction: https://solscan.io/tx/${signature}`);
    console.log(`Config address: ${config.publicKey.toString()}`);
  } catch (error) {
    console.log(error);
  }
}

setupConfig();
