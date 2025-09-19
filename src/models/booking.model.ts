
export interface Customer {
  id: string; // Unique ID, can be Israeli ID
  fullName: string;
  phone: string;
  email?: string;
}

export interface Booking {
  id: string; // Unique booking ID e.g., ORD-12345
  customer: Customer;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  notes?: string;
  totalAmount: number;
  depositPaid: number;
  status: 'pending' | 'confirmed' | 'canceled';
  signature?: string; // base64 image
  createdAt: number;
}
