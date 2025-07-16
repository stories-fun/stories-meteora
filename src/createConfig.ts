import { Connection, PublicKey } from '@solana/web3.js'
import { DynamicBondingCurveClient, BaseFeeMode } from '@meteora-ag/dynamic-bonding-curve-sdk'
import  BN  from 'bn.js'
const connection = new Connection('https://api.devnet.solana.com')
const client = new DynamicBondingCurveClient(connection, 'confirmed')

async function main() {
const transaction = await client.partner.createConfig({
    payer: new PublicKey('boss1234567890abcdefghijklmnopqrstuvwxyz'),
    config: new PublicKey('1234567890abcdefghijklmnopqrstuvwxyz'),
    feeClaimer: new PublicKey('boss1234567890abcdefghijklmnopqrstuvwxyz'),
    leftoverReceiver: new PublicKey('boss1234567890abcdefghijklmnopqrstuvwxyz'),
    quoteMint: new PublicKey('So11111111111111111111111111111111111111112'),
    poolFees: {
        baseFee: {
            cliffFeeNumerator: new BN('2500000'),
            firstFactor: 0,
            secondFactor: new BN('0'),
            thirdFactor: new BN('0'),
            baseFeeMode: BaseFeeMode.FeeSchedulerLinear,
        },
        dynamicFee: {
            binStep: 1,
            binStepU128: new BN('1844674407370955'),
            filterPeriod: 10,
            decayPeriod: 120,
            reductionFactor: 1000,
            variableFeeControl: 100000,
            maxVolatilityAccumulator: 100000,
        },
    },
    activationType: 0,
    collectFeeMode: 0,
    migrationOption: 0,
    tokenType: 0,
    tokenDecimal: 9,
    migrationQuoteThreshold: new BN('1000000000'),
    partnerLpPercentage: 25,
    creatorLpPercentage: 25,
    partnerLockedLpPercentage: 25,
    creatorLockedLpPercentage: 25,
    sqrtStartPrice: new BN('58333726687135158'),
    lockedVesting: {
        amountPerPeriod: new BN('0'),
        cliffDurationFromMigrationTime: new BN('0'),
        frequency: new BN('0'),
        numberOfPeriod: new BN('0'),
        cliffUnlockAmount: new BN('0'),
    },
    migrationFeeOption: 0,
    tokenSupply: {
        preMigrationTokenSupply: new BN('10000000000000000000'),
        postMigrationTokenSupply: new BN('10000000000000000000'),
    },
    creatorTradingFeePercentage: 0,
    tokenUpdateAuthority: 1,
    migrationFee: {
        feePercentage: 25,
        creatorFeePercentage: 50,
    },
    padding0: [],
    padding1: [],
    curve: [
        {
            sqrtPrice: new BN('233334906748540631'),
            liquidity: new BN('622226417996106429201027821619672729'),
        },
        {
            sqrtPrice: new BN('79226673521066979257578248091'),
            liquidity: new BN('1'),
        },
    ],
})
}

main();
    