// User types
export interface User {
  id: number;
  name: string | null;
  username: string;
  email: string;
  password?: string;
  userType: UserType;
  createdAt: Date;
  updatedAt: Date;
}

export type UserType = 'user' | 'admin' | 'provider';

export interface Customer extends User {
  userType: 'user';
  bookings?: Booking[];
  reviews?: Review[];
}

export interface Provider extends User {
  userType: 'provider';
  serviceType: string;
  description: string | null;
  phone: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  isVerified: boolean;
  services?: Service[];
  bookings?: Booking[];
  reviews?: Review[];
}

export interface Admin extends User {
  userType: 'admin';
}

// Service types
export interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string | null;
  providerId: number;
  provider: Provider;
  createdAt: Date;
  updatedAt: Date;
  bookings?: Booking[];
  reviews?: Review[];
  averageRating?: number;
  totalReviews?: number;
}

// Booking types
export interface Booking {
  id: number;
  serviceId: number;
  service: Service;
  customerId: number;
  customer: Customer;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: BookingStatus;
  bookingDate: Date;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
  reviews?: Review[];
}

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

// Review types
export interface Review {
  id: number;
  rating: number;
  comment: string | null;
  providerComment: string | null;
  customerId: number;
  customer: Customer;
  serviceId: number;
  service: Service;
  bookingId: number | null;
  booking?: Booking;
  createdAt: Date;
  updatedAt: Date;
}

// Notification types
export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  isRead: boolean;
  type: string;
  createdAt: Date;
  updatedAt: Date;
}

// Session types
export interface SessionUser {
  id: number;
  name: string | null;
  email: string;
  userType: UserType;
  image?: string | null;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Location types
export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Location {
  coordinates: Coordinates;
  address: string;
} 