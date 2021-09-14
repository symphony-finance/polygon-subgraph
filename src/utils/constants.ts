import { BigInt, Address, BigDecimal } from "@graphprotocol/graph-ts";

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
export let BIGINT_ZERO = BigInt.fromI32(0);
export let BIGINT_ONE = BigInt.fromI32(1);
export let BIGINT_TEN = BigInt.fromI32(10);
export let BIGDECIMAL_ZERO = new BigDecimal(BIGINT_ZERO);
export let PERCENTAGE_FACTOR = BigInt.fromI32(1000);
export let PERCENTAGE_FACTOR_DECIMAL = new BigDecimal(
    PERCENTAGE_FACTOR
);

export const stateId = "state";
export const STATUS_ACTIVE = "ACTIVE";
export const STATUS_EXECUTED = "EXECUTED";
export const STATUS_CANCELLED = "CANCELLED";

export const ACTION_CREATED = "CREATED";

export let SYMPHONY_ADDRESS = Address.fromString(
    "0xa9938c13F2C446c7dECd9D9Ebee6db8100Ca4157"
);
