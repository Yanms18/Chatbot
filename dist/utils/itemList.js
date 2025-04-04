"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.itemList = void 0;
exports.getItemList = getItemList;
exports.itemList = [
    {
        id: 1,
        name: "Margherita Pizza",
        description: "Classic pizza with tomato sauce and mozzarella cheese.",
        options: [
            { size: "Small", price: 8.99 },
            { size: "Medium", price: 10.99 },
            { size: "Large", price: 12.99 }
        ]
    },
    {
        id: 2,
        name: "Cheeseburger",
        description: "Juicy beef patty with cheese, lettuce, and tomato.",
        options: [
            { size: "Single", price: 6.99 },
            { size: "Double", price: 8.99 }
        ]
    },
    {
        id: 3,
        name: "Caesar Salad",
        description: "Fresh romaine lettuce with Caesar dressing and croutons.",
        options: [
            { size: "Regular", price: 5.99 },
            { size: "Large", price: 7.99 }
        ]
    },
    {
        id: 4,
        name: "Spaghetti Carbonara",
        description: "Pasta with creamy sauce, pancetta, and parmesan cheese.",
        options: [
            { size: "Regular", price: 9.99 },
            { size: "Large", price: 11.99 }
        ]
    },
    {
        id: 5,
        name: "Tiramisu",
        description: "Classic Italian dessert made with coffee and mascarpone.",
        options: [
            { size: "Single", price: 4.99 },
            { size: "Double", price: 7.99 }
        ]
    }
];
function getItemList() {
    return exports.itemList;
}
