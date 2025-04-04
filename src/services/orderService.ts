import { Item, itemList } from '../utils/itemList';

export class OrderService {
    private currentOrder: Item[] = [];
    private orderHistory: Item[][] = [];

    public getMenu(): Item[] {
        return itemList;
    }

    public addItemToOrder(item: Item): void {
        this.currentOrder.push(item);
    }

    public placeOrder(): string {
        if (this.currentOrder.length === 0) {
            return "No items in the order to place.";
        }
        this.orderHistory.push([...this.currentOrder]);
        this.currentOrder = [];
        return "Order placed successfully.";
    }

    public getCurrentOrder(): Item[] {
        return this.currentOrder;
    }

    public getOrderHistory(): Item[][] {
        return this.orderHistory;
    }

    public cancelOrder(): string {
        if (this.currentOrder.length === 0) {
            return "No current order to cancel.";
        }
        this.currentOrder = [];
        return "Current order has been canceled.";
    }
}

interface Order {
    items: string[];
    placed: boolean;
}

const orders = new Map<string, Order>();

export function createOrder(userId: string, item: string): string {
    let order = orders.get(userId) || { items: [], placed: false };
    order.items.push(item);
    orders.set(userId, order);
    return `Item "${item}" added to your order.`;
}

export function checkoutOrder(userId: string): string {
    const order = orders.get(userId);
    if (order && order.items.length > 0 && !order.placed) {
        order.placed = true;
        orders.set(userId, order);
        return 'Order placed';
    }
    return 'No order to place';
}

export function getOrderHistory(userId: string): string {
    // For demonstration, we use the order stored on this session.
    return 'Order History: ' + JSON.stringify(orders.get(userId) || {});
}

export function getCurrentOrder(userId: string): string {
    return 'Current Order: ' + JSON.stringify(orders.get(userId) || {});
}

export function cancelOrder(userId: string): string {
    if (orders.has(userId)) {
        orders.delete(userId);
        return 'Order cancelled';
    }
    return 'No order to cancel';
}