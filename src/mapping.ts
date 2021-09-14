import {
  State,
  Order,
  Handler,
  AssetDetail,
} from '../generated/schema';
import {
  STATUS_ACTIVE,
  STATUS_EXECUTED,
  STATUS_CANCELLED,
  stateId,
  ACTION_CREATED,
  PERCENTAGE_FACTOR,
  PERCENTAGE_FACTOR_DECIMAL,
} from "./utils/constants";
import {
  OrderCreated,
  OrderUpdated,
  OrderExecuted,
  OrderCancelled,
  UpdatedBaseFee,
  HandlerAdded,
  HandlerRemoved,
  AssetStrategyUpdated,
  AddedWhitelistAsset,
  RemovedWhitelistAsset,
  UpdatedBufferPercentage,
} from '../generated/Symphony/Symphony';
import {
  createUser,
  createExecutor,
  symphonyContract,
  updateOrderData,
  createAssetEntity,
  updateAssetFunds,
} from './utils/helpers';
import { store } from '@graphprotocol/graph-ts';

export function handleOrderCreated(
  event: OrderCreated
): void {
  let id = event.params.orderId.toHexString();
  let orderData = event.params.data;
  let decodeOrder = symphonyContract.decodeOrder(
    orderData
  );

  let order = new Order(id);
  order.status = STATUS_ACTIVE;
  order.orderId = event.params.orderId;
  order.recipient = decodeOrder.recipient.toHexString();
  order.inputToken = decodeOrder.inputToken;
  order.outputToken = decodeOrder.outputToken;
  order.inputAmount = decodeOrder.inputAmount;
  order.minReturnAmount = decodeOrder.minReturnAmount;
  order.stoplossAmount = decodeOrder.stoplossAmount;
  order.shares = decodeOrder.shares;
  order.createdAtBlock = event.block.number;
  order.orderEncodedData = event.params.data;
  order.createdTxHash = event.transaction.hash;
  order.save();

  createUser(decodeOrder.recipient);
  updateOrderData(event.params.orderId.toHexString());
  createAssetEntity(decodeOrder.inputToken);
  createAssetEntity(decodeOrder.outputToken);
  updateAssetFunds(
    decodeOrder.inputToken,
    decodeOrder.inputAmount,
    decodeOrder.shares,
    ACTION_CREATED,
  );
}

export function handleOrderCancelled(
  event: OrderCancelled
): void {
  let id = event.params.orderId.toHexString();
  let order = Order.load(id);

  order.status = STATUS_CANCELLED;
  order.updatedAt = event.block.timestamp;
  order.cancelledTxHash = event.transaction.hash;
  order.save();

  updateAssetFunds(
    order.inputToken,
    order.inputAmount,
    order.shares,
    STATUS_CANCELLED,
  );
}

export function handleOrderExecuted(
  event: OrderExecuted
): void {
  let id = event.params.orderId.toHexString();
  let order = Order.load(id);

  order.status = STATUS_EXECUTED;
  order.updatedAt = event.block.timestamp;
  order.executedTxHash = event.transaction.hash;
  order.executor = event.params.executor.toHexString();
  order.save();

  createExecutor(event.params.executor);
  updateAssetFunds(
    order.inputToken,
    order.inputAmount,
    order.shares,
    STATUS_EXECUTED,
  );
}

export function handleOrderUpdated(
  event: OrderUpdated
): void {
  let oldOrderId = event.params.oldOrderId.toHexString();
  let oldOrder = Order.load(oldOrderId);

  let orderData = event.params.data;
  let decodeOrder = symphonyContract.decodeOrder(
    orderData
  );

  let newOrder = new Order(
    event.params.newOrderId.toHexString()
  )

  newOrder.status = STATUS_ACTIVE;
  newOrder.orderId = event.params.newOrderId;
  newOrder.recipient = decodeOrder.recipient.toHexString();
  newOrder.inputToken = decodeOrder.inputToken;
  newOrder.outputToken = decodeOrder.outputToken;
  newOrder.inputAmount = decodeOrder.inputAmount;
  newOrder.minReturnAmount = decodeOrder.minReturnAmount;
  newOrder.stoplossAmount = decodeOrder.stoplossAmount;
  newOrder.shares = decodeOrder.shares;
  newOrder.orderEncodedData = event.params.data;
  newOrder.createdAtBlock = oldOrder.createdAtBlock;
  newOrder.createdTxHash = oldOrder.createdTxHash;

  store.remove('Order', oldOrderId);
  newOrder.save();

  createUser(decodeOrder.recipient);
  updateOrderData(event.params.newOrderId.toHexString());
  createAssetEntity(decodeOrder.outputToken);
}

export function handleAssetStrategyUpdated(
  event: AssetStrategyUpdated
): void {
  createAssetEntity(event.params.asset);

  let id = event.params.asset.toHexString();
  let assetDetails = AssetDetail.load(id);

  assetDetails.strategy = event.params.strategy;
  assetDetails.save();
}

export function handleUpdatedBaseFee(
  event: UpdatedBaseFee
): void {
  let state = State.load(stateId);
  if (state == null) {
    state = new State(stateId);
  }

  state.baseFee = event.params.fee.divDecimal(
    PERCENTAGE_FACTOR_DECIMAL
  );
  state.save();
}

export function handleUpdatedBufferPercentage(
  event: UpdatedBufferPercentage
): void {
  createAssetEntity(event.params.asset);

  let id = event.params.asset.toHexString();
  let assetDetails = AssetDetail.load(id);

  assetDetails.bufferPercent = event.params.percent
    .div(PERCENTAGE_FACTOR);

  assetDetails.save();
}

export function handleHandlerAdded(
  event: HandlerAdded
): void {
  let handlerId = event.params.handler
    .toHexString();

  let handler = Handler.load(handlerId);

  let state = State.load(stateId);

  if (state == null) {
    state = new State(stateId);
    state.baseFee = symphonyContract.BASE_FEE()
      .divDecimal(PERCENTAGE_FACTOR_DECIMAL);
    state.save();
  }

  if (handler == null) {
    handler = new Handler(handlerId);
    handler.state = stateId;
    handler.address = event.params.handler;
    handler.save();
  }
}

export function handleHandlerRemoved(
  event: HandlerRemoved
): void {
  let handlerId = event.params.handler
    .toHexString();

  store.remove('Handler', handlerId);
}

export function handleAddedWhitelistAsset(
  event: AddedWhitelistAsset
): void {
  createAssetEntity(event.params.asset);

  let id = event.params.asset.toHexString();
  let assetDetails = AssetDetail.load(id);

  assetDetails.isWhitelistAsset = true;
  assetDetails.save();
}

export function handleRemovedWhitelistAsset(
  event: RemovedWhitelistAsset
): void {
  createAssetEntity(event.params.asset);

  let id = event.params.asset.toHexString();
  let assetDetails = AssetDetail.load(id);

  assetDetails.isWhitelistAsset = false;
  assetDetails.save();
}
