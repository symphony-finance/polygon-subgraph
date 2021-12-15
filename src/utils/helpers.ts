import {
    Bytes,
    BigInt,
    BigDecimal,
} from "@graphprotocol/graph-ts";
import {
    User,
    Executor,
    AssetDetail,
} from "../../generated/schema";
import {
    SYMPHONY_ADDRESS,
    BIGINT_TEN,
    BIGINT_ZERO,
    ACTION_CREATED,
} from "./constants";
import {
    Symphony as SymphonyContract,
} from '../../generated/Symphony/Symphony';

export let symphonyContract = SymphonyContract
    .bind(SYMPHONY_ADDRESS);

export function createUser(
    userAddress: Bytes,
): void {
    let userId = userAddress
        .toHexString();

    let user = User.load(userId);

    if (user == null) {
        user = new User(userId);
        user.address = userAddress;
        user.save();
    }
};

export function createExecutor(
    executorAddress: Bytes,
): void {
    let executorId = executorAddress
        .toHexString();

    let executor = Executor.load(executorId);

    if (executor == null) {
        executor = new Executor(executorId);
        executor.address = executorAddress;
        executor.save();
    }
};

export function getAmountWithoutDecimals(
    amount: BigInt,
    decimals: i32,
): BigDecimal {
    return amount.divDecimal((
        BIGINT_TEN.pow(<u8>(decimals))
    ).toBigDecimal());
};

export function createAssetEntity(
    asset: Bytes
): void {
    let assetId = asset.toHexString();

    let assetDetails = AssetDetail.load(assetId);

    if (assetDetails == null) {
        assetDetails = new AssetDetail(assetId);
        assetDetails.asset = asset;
        assetDetails.totalFunds = BIGINT_ZERO;
        assetDetails.totalShares = BIGINT_ZERO;
        assetDetails.bufferPercent = BIGINT_ZERO;
        assetDetails.isWhitelistAsset = true;
        assetDetails.save();
    }
}

export function updateAssetFunds(
    asset: Bytes,
    amount: BigInt,
    shares: BigInt,
    action: String
): void {
    let assetId = asset.toHexString();
    let assetDetails = AssetDetail.load(assetId);

    if (action === ACTION_CREATED) {
        assetDetails.totalFunds = assetDetails
            .totalFunds.plus(amount);

        assetDetails.totalShares = assetDetails
            .totalShares.plus(shares);
    } else {
        amount = amount.times(assetDetails.totalFunds)
            .div(assetDetails.totalShares);

        assetDetails.totalFunds = assetDetails
            .totalFunds.minus(amount);

        assetDetails.totalShares = assetDetails
            .totalShares.minus(shares);
    }

    assetDetails.save();
}
