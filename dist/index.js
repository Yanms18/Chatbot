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
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const path_1 = __importDefault(require("path"));
const chatbot_1 = __importDefault(require("./chatbot"));
const paymentService_1 = require("./services/paymentService");
const orderReferences_1 = require("./utils/orderReferences");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server);
// Serve static files
app.use(express_1.default.static(path_1.default.join(__dirname, '..', 'Public')));
app.get('/', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '..', 'Public', 'index.html'));
});
// Paystack payment callback route
app.get('/payment/callback', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const reference = req.query.reference;
    if (!reference) {
        res.send('No payment reference provided.');
        return;
    }
    const paymentService = new paymentService_1.PaymentService();
    try {
        const success = yield paymentService.confirmPayment(reference);
        const order = orderReferences_1.orderReferences.get(reference);
        if (success && order) {
            const itemsList = order.items.map(i => i.name).join(', ');
            const total = order.amount;
            const time = new Date().toLocaleString();
            res.send(`
                <div style="font-family:sans-serif;max-width:400px;margin:40px auto;padding:24px;border:1px solid #eee;border-radius:8px;text-align:center;">
                    <div style="font-size:2em;color:green;">✅ Payment Successful!</div>
                    <div style="margin:16px 0;font-size:1.2em;">${itemsList}</div>
                    <div style="font-size:1.5em;">₦${total}</div>
                    <div style="margin:8px 0;">Total ₦${total}</div>
                    <div style="margin:8px 0;">Reference: ${reference}</div>
                    <div style="margin:8px 0;">Time: ${time}</div>
                    <div style="margin:16px 0;">
                        <a href="/" style="display:inline-block;padding:10px 20px;background:#007bff;color:#fff;text-decoration:none;border-radius:4px;">Return to Chatbot</a>
                    </div>
                </div>
            `);
        }
        else {
            res.send('Payment failed or order not found.');
        }
    }
    catch (err) {
        res.send('Error verifying payment.');
    }
}));
// Socket.IO connection
io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);
    new chatbot_1.default(socket);
    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
    });
});
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
