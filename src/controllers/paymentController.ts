import { Request, Response } from 'express';
import { PaymentService } from '../services/paymentService';
import { Socket } from 'socket.io';
import { processPayment } from '../services/paymentService';

export class PaymentController {
    private paymentService: PaymentService;

    constructor() {
        this.paymentService = new PaymentService();
    }

    public initiatePayment = async (req: Request, res: Response): Promise<void> => {
        const { amount, email } = req.body;
        try {
            // Use initiatePayment instead of createPayment
            const paymentUrl = await this.paymentService.initiatePayment(amount, email);
            res.status(200).json({ paymentUrl });
        } catch (error) {
            res.status(500).json({ message: 'Payment initiation failed', error });
        }
    };

    public confirmPayment = async (req: Request, res: Response): Promise<void> => {
        const { reference } = req.body;
        try {
            const paymentStatus = await this.paymentService.confirmPayment(reference);
            if (paymentStatus) {
                res.status(200).json({ message: 'Payment successful', paymentStatus });
            } else {
                res.status(400).json({ message: 'Payment verification failed' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Payment confirmation failed', error });
        }
    };
}

export async function handlePayment(socket: Socket, amount: number) {
    const success = await processPayment(amount, socket.id);
    if (success) {
        socket.emit('message', 'Payment successful. Returning to chatbot interface.');
        // Re-send options after payment
        socket.emit('message', 'Select an option:\n1: Place an order\n99: checkout order\n98: Order history\n97: Current order\n0: Cancel order');
    } else {
        socket.emit('message', 'Payment failed. Please try again.');
    }
}