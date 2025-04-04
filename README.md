# Chatbot Ordering App

This project is a chatbot-based ordering system that allows users to place orders, check order history, and manage their current orders through a simple chat interface. The application integrates with the Paystack payment gateway for processing payments.

## Features

- User-friendly chatbot interface for ordering food.
- Options to place an order, check order history, view current orders, and cancel orders.
- Integration with Paystack for secure payment processing.
- Ability to manage user sessions based on devices.

## Project Structure

```
chatbot-ordering-app
├── src
│   ├── index.ts                # Entry point of the application
│   ├── chatbot.ts              # Main logic for the chatbot
│   ├── controllers
│   │   ├── orderController.ts  # Handles order-related functionalities
│   │   └── paymentController.ts # Handles payment processing
│   ├── services
│   │   ├── sessionService.ts    # Manages user sessions
│   │   ├── orderService.ts      # Manages orders
│   │   └── paymentService.ts    # Handles payment operations
│   └── utils
│       └── itemList.ts         # List of menu items available for ordering
├── package.json                 # npm configuration file
├── tsconfig.json                # TypeScript configuration file
└── README.md                    # Project documentation
```

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/chatbot-ordering-app.git
   ```

2. Navigate to the project directory:
   ```
   cd chatbot-ordering-app
   ```

3. Install the dependencies:
   ```
   npm install
   ```

## Usage

1. Start the application:
   ```
   npm start
   ```

2. Interact with the chatbot by selecting options to place orders, check order history, or manage current orders.

## Payment Integration

This application uses the Paystack API for payment processing. Ensure you have a Paystack test account to test the payment functionality.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.