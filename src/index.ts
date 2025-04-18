import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import path from 'path';
import ChatBot from './chatbot';
import { PaymentService } from './services/paymentService';
import { orderReferences } from './utils/orderReferences';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files
app.use(express.static(path.join(__dirname, '..', 'Public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'Public', 'index.html'));
});

// Paystack payment callback route
app.get('/payment/callback', async (req, res) => {
    const reference = req.query.reference as string;
    if (!reference) {
        res.send('No payment reference provided.');
        return;
    }
    const paymentService = new PaymentService();
    try {
        const success = await paymentService.confirmPayment(reference);
        const order = orderReferences.get(reference);
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
        } else {
            res.send('Payment failed or order not found.');
        }
    } catch (err) {
        res.send('Error verifying payment.');
    }
});

// Socket.IO connection
io.on('connection', (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);
    new ChatBot(socket);
    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});