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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
exports.handlePayment = handlePayment;
const paymentService_1 = require("../services/paymentService");
const paymentService_2 = require("../services/paymentService");
class PaymentController {
    constructor() {
        this.initiatePayment = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { amount, email } = req.body;
            try {
                // Use initiatePayment instead of createPayment
                const paymentUrl = yield this.paymentService.initiatePayment(amount, email);
                res.status(200).json({ paymentUrl });
            }
            catch (error) {
                res.status(500).json({ message: 'Payment initiation failed', error });
            }
        });
        this.confirmPayment = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { reference } = req.body;
            try {
                const paymentStatus = yield this.paymentService.confirmPayment(reference);
                if (paymentStatus) {
                    res.status(200).json({ message: 'Payment successful', paymentStatus });
                }
                else {
                    res.status(400).json({ message: 'Payment verification failed' });
                }
            }
            catch (error) {
                res.status(500).json({ message: 'Payment confirmation failed', error });
            }
        });
        this.paymentService = new paymentService_1.PaymentService();
    }
}
exports.PaymentController = PaymentController;
function handlePayment(socket, amount) {
    return __awaiter(this, void 0, void 0, function* () {
        const success = yield (0, paymentService_2.processPayment)(amount, socket.id);
        if (success) {
            socket.emit('message', 'Payment successful. Returning to chatbot interface.');
            // Re-send options after payment
            socket.emit('message', 'Select an option:\n1: Place an order\n99: checkout order\n98: Order history\n97: Current order\n0: Cancel order');
        }
        else {
            socket.emit('message', 'Payment failed. Please try again.');
        }
    });
}
