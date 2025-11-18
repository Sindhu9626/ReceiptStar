import { Receipt } from "../types/receipt";

export interface DailyTotal {
  date: Date;
  total: number;
}

export function aggregateReceiptsByDate(receipts: Receipt[]): DailyTotal[] {
  const map: Record<string, number> = {};

  receipts.forEach(r => {
    let jsDate: Date;

    if ("toDate" in (r.Date as any)) {
      jsDate = (r.Date as any).toDate();
    } else if (r.date) {
      const [m, d, y] = r.date.split("/").map(Number);
      jsDate = new Date(y, m - 1, d);
    } else {
      jsDate = r.Date as Date;
    }

    const key = jsDate.toISOString().split("T")[0]; 

    map[key] = (map[key] || 0) + r.Total;
  });

  return Object.entries(map).map(([iso, total]) => ({
    date: new Date(iso),
    total
  }));
}
