export type WorkspaceMode = "demo" | "user";

export interface ProductRecord {
  id: string;
  user_id?: string;
  name: string;
  category: string;
  price: number;
  cost_price: number;
  stock: number;
  created_at?: string;
}

export interface TransactionRecord {
  id: string;
  user_id?: string;
  created_at: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
}

export interface BusinessProfileRecord {
  user_id: string;
  store_name: string;
  category: string;
  location: string;
}

export type BusinessProfileInput = Omit<BusinessProfileRecord, "user_id">;
