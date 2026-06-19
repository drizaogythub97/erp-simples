export type Product = {
  id: string;
  user_id: string;
  name: string;
  barcode: string | null;
  price: number;
  track_stock: boolean;
  stock_quantity: number | null;
  created_at: string;
  updated_at: string;
};

export type SaleItemInput = {
  product_id: string | null;
  name: string;
  unit_price: number;
  quantity: number;
};
