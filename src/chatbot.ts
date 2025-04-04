import { Socket } from 'socket.io';
import { sendInitialOptions, handleUserSelection as baseHandleUserSelection } from './controllers/orderController';
import OrderController from './controllers/orderController';
import { PaymentController, handlePayment } from './controllers/paymentController';
import { SessionService } from './services/sessionService';

export default class ChatBot {
    private socket: Socket;
    private orderController: OrderController;
    private paymentController: PaymentController;
    private sessionService: SessionService;
    private currentOrder: any[] = [];
    private sessionId: string;
    // Flag to determine if we're in item selection mode (after “1”)
    private orderingMode = false;

    constructor(socket: Socket) {
        this.socket = socket;
        this.orderController = new OrderController();
        this.paymentController = new PaymentController();
        this.sessionService = new SessionService();
        // Create a session id (can be used with device id if needed)
        this.sessionId = this.sessionService.createSession();
        this.initialize();
    }

    private initialize() {
        // Send initial options on connection.
        sendInitialOptions(this.socket);
        // Listen for messages from the client.
        this.socket.on('message', async (msg: string) => {
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
                } else {
                    this.sendMessage('Invalid item selection. Please try again.');
                }
            } else {
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
                            await this.checkoutOrder();
                        } else {
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
                        } else {
                            this.sendMessage("No current order.");
                        }
                        break;
                    case '0':
                        // Requirement 8: Cancel order.
                        if (this.currentOrder.length > 0) {
                            this.currentOrder = [];
                            this.sendMessage("Order has been canceled.");
                        } else {
                            this.sendMessage("No order to cancel.");
                        }
                        break;
                    default:
                        // If numeric input outside ordering mode, assume it is payment amount.
                        if (!isNaN(Number(trimmed))) {
                            const paymentAmount = Number(trimmed);
                            // Requirement 9-11: Process payment using Paystack test account.
                            await handlePayment(this.socket, paymentAmount);
                        } else {
                            this.sendMessage("Invalid option. Please try again.");
                            this.sendInitialOptions();
                        }
                }
            }
        });
    }

    private async checkoutOrder() {
        // Requirement 5: On checkout, process payment if order exists.
        // For simulation, we set fixed total or you may compute a total from currentOrder.
        const orderAmount = 100; // Replace with computed total if needed.
        await handlePayment(this.socket, orderAmount);
        this.sendMessage("Order placed. Please complete payment.");
        // After payment, assume payment is successful and notify user.
        // Payment integration (via PaymentController) notifies using handlePayment.
        this.currentOrder = [];
    }

    private sendInitialOptions() {
        const options = `Welcome!
Select 1 to Place an order
Select 99 to checkout order
Select 98 to see order history
Select 97 to see current order
Select 0 to cancel order`;
        this.sendMessage(options);
    }

    private sendMessage(message: string) {
        // Send a message via the socket.
        this.socket.emit('message', message);
    }
}