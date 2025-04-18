import { Socket } from 'socket.io';
import { handlePayment } from './paymentController';

export async function processOrder(socket: Socket, amount: number): Promise<void> {
    const email = 'customer@example.com'; // Replace with the actual customer email
    await handlePayment(socket, amount, email);
}