import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export class PaymentService {
    private paystackUrl: string;
    private secretKey: string;

    constructor() {
        this.paystackUrl = 'https://api.paystack.co';
        this.secretKey = process.env.PAYSTACK_SECRET_KEY || '';
    }

    /**
     * Initiates a payment with Paystack.
     * @param amount Amount to be paid (in kobo, so multiply by 100 for NGN).
     * @param email Customer's email address.
     * @returns Payment initialization response, including the authorization URL.
     */
    public async initiatePayment(amount: number, email: string, reference: string): Promise<string> {
        try {
            const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
            const response = await axios.post(
                `${this.paystackUrl}/transaction/initialize`,
                {
                    email,
                    amount: amount * 100,
                    reference,
                    callback_url: `${baseUrl}/payment/callback`
                },
                {
                    headers: {
                        Authorization: `Bearer ${this.secretKey}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            return response.data.data.authorization_url;
        } catch (error) {
            if (error instanceof Error) {
                console.error('Error initiating payment:', error.message);
                throw new Error('Failed to initiate payment. Please try again.');
            } else {
                console.error('Unknown error initiating payment:', error);
                throw new Error('An unknown error occurred while initiating payment.');
            }
        }
    }

    /**
     * Verifies a payment with Paystack.
     * @param reference Payment reference returned by Paystack.
     * @returns Payment verification response.
     */
    public async confirmPayment(reference: string): Promise<boolean> {
        try {
            const response = await axios.get(
                `${this.paystackUrl}/transaction/verify/${reference}`,
                {
                    headers: {
                        Authorization: `Bearer ${this.secretKey}`,
                    },
                }
            );
            return response.data.data.status === 'success'; // Return true if payment was successful
        } catch (error) {
            if (error instanceof Error) {
                console.error('Error verifying payment:', error.message);
                throw new Error('Failed to verify payment. Please try again.');
            } else {
                console.error('Unknown error verifying payment:', error);
                throw new Error('An unknown error occurred while verifying payment.');
            }
        }
    }
}