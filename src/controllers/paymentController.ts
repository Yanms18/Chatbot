import { Socket } from 'socket.io';
import { PaymentService } from '../services/paymentService';

/**
 * Handles payment initiation and sends the payment URL to the client.
 * @param socket The Socket.IO connection to the client.
 * @param amount The amount to be paid (in Naira).
 * @param email The customer's email address.
 */
export async function handlePayment(socket: Socket, amount: number, email: string): Promise<void> {
    try {
        const paymentService = new PaymentService();
        const reference = 'ref_' + Math.random().toString(36).substring(2, 12); // Generate a unique reference
        const paymentUrl = await paymentService.initiatePayment(amount, email, reference);
        socket.emit('message', `Please complete your payment here: ${paymentUrl}`);
    } catch (error) {
        if (error instanceof Error) {
            console.error('Payment Error:', error.message);
            socket.emit('message', `Payment failed: ${error.message}`);
        } else {
            console.error('Unknown Payment Error:', error);
            socket.emit('message', 'An unknown error occurred while processing payment.');
        }
    }
}