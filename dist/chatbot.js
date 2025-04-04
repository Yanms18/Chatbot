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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const orderController_1 = require("./controllers/orderController");
const orderController_2 = __importDefault(require("./controllers/orderController"));
const paymentController_1 = require("./controllers/paymentController");
const sessionService_1 = require("./services/sessionService");
class ChatBot {
    constructor(socket) {
        this.currentOrder = [];
        // Flag to determine if we're in item selection mode (after “1”)
        this.orderingMode = false;
        this.socket = socket;
        this.orderController = new orderController_2.default();
        this.paymentController = new paymentController_1.PaymentController();
        this.sessionService = new sessionService_1.SessionService();
        // Create a session id (can be used with device id if needed)
        this.sessionId = this.sessionService.createSession();
        this.initialize();
    }
    initialize() {
        // Send initial options on connection.
        (0, orderController_1.sendInitialOptions)(this.socket);
        // Listen for messages from the client.
        this.socket.on('message', (msg) => __awaiter(this, void 0, void 0, function* () {
            const trimmed = msg.trim();
            // If we are in ordering mode, numeric input is interpreted as item selection
            if (this.orderingMode) {
                const index = Number(trimmed) - 1;
                const menuItems = this.orderController.getMenu();
                if (!isNaN(index) && index >= 0 && index < menuItems.length) {
                    const selectedItem = menuItems[index];
                    this.currentOrder.push(selectedItem);
                    this.sendMessage(`${selectedItem.name} added to your order.`);
                    // Prompt to add more or checkout
                    this.sendMessage(`Enter another item number to add more items, or type 99 to checkout.`);
                }
                else {
                    this.sendMessage('Invalid item selection. Please try again.');
                }
            }
            else {
                // Not in ordering mode: handle options 1, 99, 98, 97, 0, or payment amount input.
                switch (trimmed) {
                    case '1':
                        // Requirement 4: Return the restaurant menu.
                        const items = this.orderController.getMenu();
                        let message = 'Select items by number:\n';
                        items.forEach((item, index) => {
                            message += `${index + 1}: ${item.name} - ${item.description}\n`;
                        });
                        this.sendMessage(message);
                        // Set ordering mode so subsequent numeric input selects items.
                        this.orderingMode = true;
                        break;
                    case '99':
                        // Requirement 5: Checkout order.
                        this.orderingMode = false;
                        if (this.currentOrder.length > 0) {
                            yield this.checkoutOrder();
                        }
                        else {
                            this.sendMessage("No order to place.");
                        }
                        break;
                    case '98':
                        // Requirement 6: Return order history.
                        const history = this.orderController.getOrderHistory();
                        this.sendMessage(`Order History: ${JSON.stringify(history)}`);
                        break;
                    case '97':
                        // Requirement 7: Return current order.
                        if (this.currentOrder.length > 0) {
                            this.sendMessage(`Current Order: ${JSON.stringify(this.currentOrder)}`);
                        }
                        else {
                            this.sendMessage("No current order.");
                        }
                        break;
                    case '0':
                        // Requirement 8: Cancel order.
                        if (this.currentOrder.length > 0) {
                            this.currentOrder = [];
                            this.sendMessage("Order has been canceled.");
                        }
                        else {
                            this.sendMessage("No order to cancel.");
                        }
                        break;
                    default:
                        // If numeric input outside ordering mode, assume it is payment amount.
                        if (!isNaN(Number(trimmed))) {
                            const paymentAmount = Number(trimmed);
                            // Requirement 9-11: Process payment using Paystack test account.
                            yield (0, paymentController_1.handlePayment)(this.socket, paymentAmount);
                        }
                        else {
                            this.sendMessage("Invalid option. Please try again.");
                            this.sendInitialOptions();
                        }
                }
            }
        }));
    }
    checkoutOrder() {
        return __awaiter(this, void 0, void 0, function* () {
            // Requirement 5: On checkout, process payment if order exists.
            // For simulation, we set fixed total or you may compute a total from currentOrder.
            const orderAmount = 100; // Replace with computed total if needed.
            yield (0, paymentController_1.handlePayment)(this.socket, orderAmount);
            this.sendMessage("Order placed. Please complete payment.");
            // After payment, assume payment is successful and notify user.
            // Payment integration (via PaymentController) notifies using handlePayment.
            this.currentOrder = [];
        });
    }
    sendInitialOptions() {
        const options = `Welcome!
Select 1 to Place an order
Select 99 to checkout order
Select 98 to see order history
Select 97 to see current order
Select 0 to cancel order`;
        this.sendMessage(options);
    }
    sendMessage(message) {
        // Send a message via the socket.
        this.socket.emit('message', message);
    }
}
exports.default = ChatBot;
