"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
exports.createOrder = createOrder;
exports.checkoutOrder = checkoutOrder;
exports.getOrderHistory = getOrderHistory;
exports.getCurrentOrder = getCurrentOrder;
exports.cancelOrder = cancelOrder;
const itemList_1 = require("../utils/itemList");
class OrderService {
    constructor() {
        this.currentOrder = [];
        this.orderHistory = [];
    }
    getMenu() {
        return itemList_1.itemList;
    }
    addItemToOrder(item) {
        this.currentOrder.push(item);
    }
    placeOrder() {
        if (this.currentOrder.length === 0) {
            return "No items in the order to place.";
        }
        this.orderHistory.push([...this.currentOrder]);
        this.currentOrder = [];
        return "Order placed successfully.";
    }
    getCurrentOrder() {
        return this.currentOrder;
    }
    getOrderHistory() {
        return this.orderHistory;
    }
    cancelOrder() {
        if (this.currentOrder.length === 0) {
            return "No current order to cancel.";
        }
        this.currentOrder = [];
        return "Current order has been canceled.";
    }
}
exports.OrderService = OrderService;
const orders = new Map();
function createOrder(userId, item) {
    let order = orders.get(userId) || { items: [], placed: false };
    order.items.push(item);
    orders.set(userId, order);
    return `Item "${item}" added to your order.`;
}
function checkoutOrder(userId) {
    const order = orders.get(userId);
    if (order && order.items.length > 0 && !order.placed) {
        order.placed = true;
        orders.set(userId, order);
        return 'Order placed';
    }
    return 'No order to place';
}
function getOrderHistory(userId) {
    // For demonstration, we use the order stored on this session.
    return 'Order History: ' + JSON.stringify(orders.get(userId) || {});
}
function getCurrentOrder(userId) {
    return 'Current Order: ' + JSON.stringify(orders.get(userId) || {});
}
function cancelOrder(userId) {
    if (orders.has(userId)) {
        orders.delete(userId);
        return 'Order cancelled';
    }
    return 'No order to cancel';
}
