import { Socket } from 'socket.io';
import { OrderService } from './services/orderService';
import { PaymentService } from './services/paymentService';
import { SessionService } from './services/sessionService';
import { getItemList, Item } from './utils/itemList';
import { orderReferences } from './utils/orderReferences';

export default class ChatBot {
    private socket: Socket;
    private orderService: OrderService;
    private sessionService: SessionService;
    private sessionId: string;
    private orderingMode = false;

    constructor(socket: Socket) {
        this.socket = socket;
        this.orderService = new OrderService();
        this.sessionService = new SessionService();
        this.sessionId = this.sessionService.createSession(socket.id);
        this.initialize();
    }

    private initialize() {
        this.sendInitialOptions();
        this.socket.on('message', async (msg: string) => {
            const trimmed = msg.trim();
            if (this.orderingMode && !['99', '98', '97', '0'].includes(trimmed)) {
                // Handle item selection
                const index = Number(trimmed) - 1;
                const menuItems = getItemList();
                if (!isNaN(index) && index >= 0 && index < menuItems.length) {
                    const selectedItem = menuItems[index];
                    this.orderService.addItemToOrder(selectedItem);
                    this.sendMessage(`${selectedItem.name} added to your order. Type another number to add more, or 99 to checkout.`);
                } else {
                    this.sendMessage('Invalid item selection. Please try again.');
                }
                return;
            }
            switch (trimmed) {
                case '1':
                    // Show menu and enter ordering mode
                    this.orderingMode = true;
                    const items = getItemList();
                    let menu = 'Select items by number:\n';
                    items.forEach((item, idx) => {
                        menu += `${idx + 1}: ${item.name} - ${item.description} (${item.price} Naira)\n`;
                    });
                    this.sendMessage(menu);
                    break;
                case '99':
                    // Checkout order
                    if (this.orderService.getCurrentOrder().length > 0) {
                        const total = this.orderService.getCurrentOrder().reduce((sum, item) => sum + item.price, 0);
                        this.sendMessage(`Order placed! Total: ${total} Naira. Please type "pay" to proceed with payment.`);
                        this.orderService.placeOrder();
                        this.orderingMode = false;
                    } else {
                        this.sendMessage('No order to place.');
                        this.sendInitialOptions();
                    }
                    break;
                case '98':
                    // Show order history
                    const history = this.orderService.getOrderHistory();
                    if (history.length === 0) {
                        this.sendMessage('No order history.');
                    } else {
                        let histMsg = 'Order History:\n';
                        history.forEach((order, idx) => {
                            const items = order.map(i => i.name).join(', ');
                            histMsg += `Order ${idx + 1}: ${items}\n`;
                        });
                        this.sendMessage(histMsg);
                    }
                    break;
                case '97':
                    // Show current order
                    const current = this.orderService.getCurrentOrder();
                    if (current.length === 0) {
                        this.sendMessage('No current order.');
                    } else {
                        const items = current.map(i => `${i.name} (${i.price} Naira)`).join(', ');
                        const total = current.reduce((sum, item) => sum + item.price, 0);
                        this.sendMessage(`Current Order: ${items}\nTotal: ${total} Naira`);
                    }
                    break;
                case '0':
                    // Cancel order
                    if (this.orderService.getCurrentOrder().length > 0) {
                        this.orderService.cancelOrder();
                        this.sendMessage('Order cancelled.');
                    } else {
                        this.sendMessage('No order to cancel.');
                    }
                    this.orderingMode = false;
                    this.sendInitialOptions();
                    break;
                case 'pay':
                    // Use the last placed order for payment
                    const lastOrder = this.orderService.getOrderHistory().slice(-1)[0];
                    if (!lastOrder) {
                        this.sendMessage('No recent order to pay for.');
                        break;
                    }
                    const amount = lastOrder.reduce((sum, item) => sum + item.price, 0);
                    const email = 'customer@example.com';
                    const reference = 'ref_' + Math.random().toString(36).substring(2, 12);
                    orderReferences.set(reference, { items: lastOrder, amount });
                    try {
                        const paymentService = new PaymentService();
                        const paymentUrl = await paymentService.initiatePayment(amount, email, reference);
                        this.sendMessage(`Redirecting to payment...`);
                        this.socket.emit('redirect', paymentUrl); // Client should handle this event to redirect
                    } catch {
                        this.sendMessage('Failed to initiate payment. Please try again.');
                    }
                    break;
                case 'done':
                    // Simulate payment confirmation
                    this.sendMessage('Payment successful! Thank you for your order.');
                    this.sendInitialOptions();
                    break;
                default:
                    this.sendMessage('Invalid selection. Please try again.');
                    this.sendInitialOptions();
            }
        });
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
        this.socket.emit('message', message);
    }
}