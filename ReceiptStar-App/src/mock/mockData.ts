import { LineItem } from "../types/items";
import { Receipt } from "../types/receipt";


function sum(items: LineItem[]): number {
  return Number(items.reduce((acc, i) => acc + i.itemCost, 0).toFixed(2));
}


const groceries1: LineItem[] = [
  { item: "Milk", itemCost: 3.99 },
  { item: "Bread", itemCost: 2.49 },
  { item: "Eggs", itemCost: 4.29 },
];

const groceries2: LineItem[] = [
  { item: "Chicken Breast", itemCost: 11.49 },
  { item: "Rice", itemCost: 3.29 },
  { item: "Spinach", itemCost: 2.79 },
];

const groceries3: LineItem[] = [
  { item: "Apples", itemCost: 4.19 },
  { item: "Bananas", itemCost: 1.59 },
  { item: "Cereal", itemCost: 5.49 },
];

const gas1: LineItem[] = [
  { item: "Fuel (Regular)", itemCost: 42.35 },
];

const gas2: LineItem[] = [
  { item: "Fuel (Premium)", itemCost: 53.89 },
];

const entertainment1: LineItem[] = [
  { item: "Movie Ticket", itemCost: 12.49 },
  { item: "Popcorn", itemCost: 5.29 },
  { item: "Drink", itemCost: 3.99 },
];

const entertainment2: LineItem[] = [
  { item: "Concert Ticket", itemCost: 45.00 },
  { item: "Parking", itemCost: 12.00 },
];

const misc1: LineItem[] = [
  { item: "Notebook", itemCost: 3.49 },
  { item: "Pens", itemCost: 2.29 },
  { item: "Tape", itemCost: 1.59 },
];

const misc2: LineItem[] = [
  { item: "Batteries", itemCost: 6.99 },
  { item: "Cleaning Spray", itemCost: 4.79 },
  { item: "Sponges", itemCost: 2.39 },
];



export const mockReceipts: Receipt[] = [
  // January
  {
    id: "mock1",
    Store: "Walmart",
    Category: "Groceries",
    Total: sum(groceries1),
    Items: groceries1,
    Date: new Date("2025-01-04"),
  },
  {
    id: "mock2",
    Store: "Shell",
    Category: "Gas",
    Total: sum(gas1),
    Items: gas1,
    Date: new Date("2025-01-06"),
  },
  {
    id: "mock3",
    Store: "Costco",
    Category: "Groceries",
    Total: sum(groceries2),
    Items: groceries2,
    Date: new Date("2025-01-10"),
  },
  {
    id: "mock4",
    Store: "AMC Theatres",
    Category: "Entertainment",
    Total: sum(entertainment1),
    Items: entertainment1,
    Date: new Date("2025-01-12"),
  },
  {
    id: "mock5",
    Store: "Target",
    Category: "Miscellaneous",
    Total: sum(misc1),
    Items: misc1,
    Date: new Date("2025-01-15"),
  },

  // Late January – Early February
  {
    id: "mock6",
    Store: "Trader Joe's",
    Category: "Groceries",
    Total: sum(groceries3),
    Items: groceries3,
    Date: new Date("2025-01-22"),
  },
  {
    id: "mock7",
    Store: "Circle K",
    Category: "Gas",
    Total: sum(gas2),
    Items: gas2,
    Date: new Date("2025-01-25"),
  },
  {
    id: "mock8",
    Store: "AMC Theatres",
    Category: "Entertainment",
    Total: 14.99,
    Items: [{ item: "Movie Rental", itemCost: 14.99 }],
    Date: new Date("2025-01-28"),
  },
  {
    id: "mock9",
    Store: "Staples",
    Category: "Miscellaneous",
    Total: sum(misc2),
    Items: misc2,
    Date: new Date("2025-01-30"),
  },

  // February
  {
    id: "mock10",
    Store: "Walmart",
    Category: "Groceries",
    Total: sum(groceries1),
    Items: groceries1,
    Date: new Date("2025-02-02"),
  },
  {
    id: "mock11",
    Store: "Shell",
    Category: "Gas",
    Total: sum(gas1),
    Items: gas1,
    Date: new Date("2025-02-03"),
  },
  {
    id: "mock12",
    Store: "AMC Theatres",
    Category: "Entertainment",
    Total: sum(entertainment2),
    Items: entertainment2,
    Date: new Date("2025-02-05"),
  },
  {
    id: "mock13",
    Store: "Target",
    Category: "Miscellaneous",
    Total: sum(misc1),
    Items: misc1,
    Date: new Date("2025-02-10"),
  },
  {
    id: "mock14",
    Store: "Trader Joe's",
    Category: "Groceries",
    Total: sum(groceries2),
    Items: groceries2,
    Date: new Date("2025-02-13"),
  },

  // Late Feb – March
  {
    id: "mock15",
    Store: "Circle K",
    Category: "Gas",
    Total: sum(gas2),
    Items: gas2,
    Date: new Date("2025-02-22"),
  },
  {
    id: "mock16",
    Store: "Netflix",
    Category: "Entertainment",
    Total: 15.49,
    Items: [{ item: "Subscription", itemCost: 15.49 }],
    Date: new Date("2025-02-25"),
  },
  {
    id: "mock17",
    Store: "Best Buy",
    Category: "Miscellaneous",
    Total: 19.99,
    Items: [{ item: "HDMI Cable", itemCost: 19.99 }],
    Date: new Date("2025-02-27"),
  },
  {
    id: "mock18",
    Store: "Publix",
    Category: "Groceries",
    Total: sum(groceries3),
    Items: groceries3,
    Date: new Date("2025-03-01"),
  },
  {
    id: "mock19",
    Store: "Shell",
    Category: "Gas",
    Total: sum(gas1),
    Items: gas1,
    Date: new Date("2025-03-03"),
  },
  {
    id: "mock20",
    Store: "Dave & Buster’s",
    Category: "Entertainment",
    Total: 32.50,
    Items: [
      { item: "Game Credits", itemCost: 20.00 },
      { item: "Snacks", itemCost: 12.50 },
    ],
    Date: new Date("2025-03-04"),
  },
];
