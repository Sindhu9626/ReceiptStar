import { Timestamp } from "firebase/firestore";
import { LineItem } from "./items";

export interface Receipt {
  id: string;         
  Store: string;
  Category?: string;
  Total: number;
  Items: LineItem[];
  
  
  Date: Timestamp | Date;
  
  date?: string; 
}
