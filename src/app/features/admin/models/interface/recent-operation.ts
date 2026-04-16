import { TypeOperation } from '../types/type-operation';

export interface RecentOperation {
  date: string;
  client: string;
  type: TypeOperation;
  amount: number;
  status: string;
  installments: string;
}
