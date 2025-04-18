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
exports.PaymentService = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class PaymentService {
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
    initiatePayment(amount, email, reference) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield axios_1.default.post(`${this.paystackUrl}/transaction/initialize`, {
                    email,
                    amount: amount * 100,
                    reference,
                    callback_url: `http://localhost:3000/payment/callback`
                }, {
                    headers: {
                        Authorization: `Bearer ${this.secretKey}`,
                        'Content-Type': 'application/json',
                    },
                });
                return response.data.data.authorization_url;
            }
            catch (error) {
                if (error instanceof Error) {
                    console.error('Error initiating payment:', error.message);
                    throw new Error('Failed to initiate payment. Please try again.');
                }
                else {
                    console.error('Unknown error initiating payment:', error);
                    throw new Error('An unknown error occurred while initiating payment.');
                }
            }
        });
    }
    /**
     * Verifies a payment with Paystack.
     * @param reference Payment reference returned by Paystack.
     * @returns Payment verification response.
     */
    confirmPayment(reference) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const response = yield axios_1.default.get(`${this.paystackUrl}/transaction/verify/${reference}`, {
                    headers: {
                        Authorization: `Bearer ${this.secretKey}`,
                    },
                });
                return response.data.data.status === 'success'; // Return true if payment was successful
            }
            catch (error) {
                if (error instanceof Error) {
                    console.error('Error verifying payment:', error.message);
                    throw new Error('Failed to verify payment. Please try again.');
                }
                else {
                    console.error('Unknown error verifying payment:', error);
                    throw new Error('An unknown error occurred while verifying payment.');
                }
            }
        });
    }
}
exports.PaymentService = PaymentService;
