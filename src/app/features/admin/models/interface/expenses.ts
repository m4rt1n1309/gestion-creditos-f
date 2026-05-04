export interface ExpenseCategory {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
}

export interface ExpenseCategoryRaw {
  id: string;
  name: string;
  active: boolean;
  created_at: string;
}
