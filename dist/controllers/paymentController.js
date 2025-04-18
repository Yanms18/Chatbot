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
exports.handlePayment = handlePayment;
const paymentService_1 = require("../services/paymentService");
/**
 * Handles payment initiation and sends the payment URL to the client.
 * @param socket The Socket.IO connection to the client.
 * @param amount The amount to be paid (in Naira).
 * @param email The customer's email address.
 */
function handlePayment(socket, amount, email) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const paymentService = new paymentService_1.PaymentService();
            const reference = 'ref_' + Math.random().toString(36).substring(2, 12); // Generate a unique reference
            const paymentUrl = yield paymentService.initiatePayment(amount, email, reference);
            socket.emit('message', `Please complete your payment here: ${paymentUrl}`);
        }
        catch (error) {
            if (error instanceof Error) {
                console.error('Payment Error:', error.message);
                socket.emit('message', `Payment failed: ${error.message}`);
            }
            else {
                console.error('Unknown Payment Error:', error);
                socket.emit('message', 'An unknown error occurred while processing payment.');
            }
        }
    });
}
