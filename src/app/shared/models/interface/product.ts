export interface ProductOperation {
  id: string;
  name: string;
  price: number;
  stock: number;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  icon: string;
  iconColor: string;
}
