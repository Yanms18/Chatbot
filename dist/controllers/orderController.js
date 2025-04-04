"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendInitialOptions = sendInitialOptions;
exports.handleUserSelection = handleUserSelection;
const itemList_1 = require("../utils/itemList");
const orderService_1 = require("../services/orderService");
const paymentController_1 = require("./paymentController");
class OrderController {
    constructor() {
        this.currentOrder = [];
        this.orderHistory = [];
        this.menu = [
            { id: 1, name: "Pizza", options: ["Small", "Medium", "Large"] },
            { id: 2, name: "Burger", options: ["Beef", "Chicken", "Veggie"] },
            { id: 3, name: "Pasta", options: ["Alfredo", "Marinara", "Pesto"] },
            { id: 4, name: "Salad", options: ["Caesar", "Greek", "Garden"] },
        ];
    }
    getMenu() {
        return this.menu;
    }
    placeOrder(itemIds) {
        const itemsToOrder = this.menu.filter(item => itemIds.includes(item.id));
        if (itemsToOrder.length > 0) {
            this.currentOrder.push(...itemsToOrder);
            return "Order placed successfully.";
        }
        return "No items selected for order.";
    }
    getCurrentOrder() {
        return this.currentOrder.length > 0 ? this.currentOrder : "No current order.";
    }
    getOrderHistory() {
        return this.orderHistory.length > 0 ? this.orderHistory : "No order history.";
    }
    cancelOrder() {
        if (this.currentOrder.length > 0) {
            this.orderHistory.push(this.currentOrder);
            this.currentOrder = [];
            return "Order canceled.";
        }
        return "No order to cancel.";
    }
}
function sendInitialOptions(socket) {
    const options = `Welcome!
Select 1 to Place an order
Select 99 to checkout order
Select 98 to see order history
Select 97 to see current order
Select 0 to cancel order`;
    socket.emit('message', options);
}
function handleUserSelection(socket, msg) {
    return __awaiter(this, void 0, void 0, function* () {
        const selection = msg.trim();
        switch (selection) {
            case '1': {
                // List food items for order placement:
                const items = (0, itemList_1.getItemList)();
                let message = 'Select items by number:\n';
                items.forEach((item, index) => {
                    message += `${index + 1}: ${item.name} - ${item.description}\n`;
                });
                socket.emit('message', message);
                break;
            }
            case '99': {
                // Checkout order
                const result = (0, orderService_1.checkoutOrder)(socket.id);
                socket.emit('message', result);
                // Optionally, ask for payment
                socket.emit('message', 'Enter payment amount:');
                break;
            }
            case '98': {
                // Show order history
                const history = (0, orderService_1.getOrderHistory)(socket.id);
                socket.emit('message', history);
                break;
            }
            case '97': {
                // Show current order
                const current = (0, orderService_1.getCurrentOrder)(socket.id);
                socket.emit('message', current);
                break;
            }
            case '0': {
                // Cancel order
                const cancelMsg = (0, orderService_1.cancelOrder)(socket.id);
                socket.emit('message', cancelMsg);
                break;
            }
            default: {
                // Handle potential payment amount input or invalid options
                if (!isNaN(Number(selection))) {
                    // For simplicity, assume numeric input after checkout is payment amount.
                    yield (0, paymentController_1.handlePayment)(socket, Number(selection));
                }
                else {
                    socket.emit('message', 'Invalid option. Please try again.');
                }
            }
        }
    });
}
exports.default = OrderController;
