import { Socket } from 'socket.io';
import { getItemList } from '../utils/itemList';
import { createOrder, checkoutOrder, getOrderHistory, getCurrentOrder, cancelOrder } from '../services/orderService';
import { handlePayment } from './paymentController';

class OrderController {
    private currentOrder: any[] = [];
    private orderHistory: any[] = [];
    private menu: any[] = [
        { id: 1, name: "Pizza", options: ["Small", "Medium", "Large"] },
        { id: 2, name: "Burger", options: ["Beef", "Chicken", "Veggie"] },
        { id: 3, name: "Pasta", options: ["Alfredo", "Marinara", "Pesto"] },
        { id: 4, name: "Salad", options: ["Caesar", "Greek", "Garden"] },
    ];

    public getMenu() {
        return this.menu;
    }

    public placeOrder(itemIds: number[]) {
        const itemsToOrder = this.menu.filter(item => itemIds.includes(item.id));
        if (itemsToOrder.length > 0) {
            this.currentOrder.push(...itemsToOrder);
            return "Order placed successfully.";
        }
        return "No items selected for order.";
    }

    public getCurrentOrder() {
        return this.currentOrder.length > 0 ? this.currentOrder : "No current order.";
    }

    public getOrderHistory() {
        return this.orderHistory.length > 0 ? this.orderHistory : "No order history.";
    }

    public cancelOrder() {
        if (this.currentOrder.length > 0) {
            this.orderHistory.push(this.currentOrder);
            this.currentOrder = [];
            return "Order canceled.";
        }
        return "No order to cancel.";
    }
}

export function sendInitialOptions(socket: Socket) {
    const options = `Welcome!
Select 1 to Place an order
Select 99 to checkout order
Select 98 to see order history
Select 97 to see current order
Select 0 to cancel order`;
    socket.emit('message', options);
}

export async function handleUserSelection(socket: Socket, msg: string) {
    const selection = msg.trim();
    switch(selection) {
        case '1': {
            // List food items for order placement:
            const items = getItemList();
            let message = 'Select items by number:\n';
            items.forEach((item, index) => {
                message += `${index+1}: ${item.name} - ${item.description}\n`;
            });
            socket.emit('message', message);
            break;
        }
        case '99': {
            // Checkout order
            const result = checkoutOrder(socket.id);
            socket.emit('message', result);
            // Optionally, ask for payment
            socket.emit('message', 'Enter payment amount:');
            break;
        }
        case '98': {
            // Show order history
            const history = getOrderHistory(socket.id);
            socket.emit('message', history);
            break;
        }
        case '97': {
            // Show current order
            const current = getCurrentOrder(socket.id);
            socket.emit('message', current);
            break;
        }
        case '0': {
            // Cancel order
            const cancelMsg = cancelOrder(socket.id);
            socket.emit('message', cancelMsg);
            break;
        }
        default: {
            // Handle potential payment amount input or invalid options
            if (!isNaN(Number(selection))) {
                // For simplicity, assume numeric input after checkout is payment amount.
                await handlePayment(socket, Number(selection));
            } else {
                socket.emit('message', 'Invalid option. Please try again.');
            }
        }
    }
}

export default OrderController;