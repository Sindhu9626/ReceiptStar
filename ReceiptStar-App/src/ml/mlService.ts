import { DailyTotal } from "./aggregateReceipts";

interface Prediction {
  date: Date;
  predicted: number;
}


function trainLinearRegression(history: DailyTotal[]) {
  const n = history.length;
  if (n === 0) return { m: 0, b: 0 };


  const xs = history.map((_, i) => i);
  const ys = history.map(h => h.total);

  const sumX = xs.reduce((a, b) => a + b, 0);
  const sumY = ys.reduce((a, b) => a + b, 0);
  const sumXY = xs.reduce((sum, x, i) => sum + x * ys[i], 0);
  const sumX2 = xs.reduce((sum, x) => sum + x * x, 0);


  const m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX ** 2 || 1);
  const b = (sumY - m * sumX) / n;

  return { m, b };
}

function aggregateByMonth(history: DailyTotal[]) {
  const byMonth: Record<string, number> = {};

  history.forEach(h => {
    const d = h.date;
    const key = `${d.getFullYear()}-${(d.getMonth()+1)
      .toString()
      .padStart(2, "0")}`;

    byMonth[key] = (byMonth[key] || 0) + h.total;
  });

   
  return Object.entries(byMonth)
    .map(([key, total]) => {
      const [year, mon] = key.split("-").map(Number);
      return { date: new Date(year, mon - 1, 1), total };
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}


export function predictNextMonth(history: DailyTotal[]): Prediction | null {
  if (!history || history.length === 0) return null;

  
  const monthly = aggregateByMonth(history);
  if (monthly.length < 2) return null;  

   
  const { m, b } = trainLinearRegression(monthly);
  const lastIndex = monthly.length - 1;
  const lastDate = monthly[lastIndex].date;

  const x = lastIndex + 1;  
  const predicted = Math.max(m * x + b, 0);

   
  const next = new Date(lastDate);
  next.setMonth(lastDate.getMonth() + 1);

  return { date: next, predicted };
}



export function predictNextNDays(history: DailyTotal[], days: number): Prediction[] {
  if (!history || history.length < 1) return [];

  
  const sorted = [...history].sort((a,b) => a.date.getTime() - b.date.getTime());
  const lastDate = sorted[sorted.length - 1].date;

   
  const { m, b } = trainLinearRegression(sorted);
  const lastIndex = sorted.length - 1;

  const predictions: Prediction[] = [];

  for (let i = 1; i <= days; i++) {
    const x = lastIndex + i;
    const predicted = Math.max(m * x + b, 0);

    const d = new Date(lastDate);
    d.setDate(lastDate.getDate() + i);

    predictions.push({ date: d, predicted });
  }

  return predictions;
}
