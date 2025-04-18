export interface Item {
    id: number;
    name: string;
    description: string;
    price: number;
}

export const itemList: Item[] = [
    {
        id: 1,
        name: "A plate of jollof rice",
        description: "Delicious jollof rice served with vegetables.",
        price: 2000,
    },
    {
        id: 2,
        name: "A plate of fried rice",
        description: "Tasty fried rice with mixed vegetables.",
        price: 2000,
    },
    {
        id: 3,
        name: "Fried chicken",
        description: "Crispy fried chicken.",
        price: 1500,
    },
    {
        id: 4,
        name: "Smoked beef",
        description: "Tender smoked beef slices.",
        price: 1000,
    },
    {
        id: 5,
        name: "A bottle of coke",
        description: "Chilled bottle of Coca-Cola.",
        price: 500,
    },
    {
        id: 6,
        name: "A bottle of fanta",
        description: "Chilled bottle of Fanta.",
        price: 500,
    },
    {
        id: 7,
        name: "A bottle of water",
        description: "Refreshing bottle of water.",
        price: 300,
    },
];

export function getItemList(): Item[] {
    return itemList;
}