# ServiceFinder Booking System

## Overview
A comprehensive booking system that allows customers to book services from providers and enables providers to manage their bookings efficiently.

## Features

### For Customers
- **Service Booking**: Book services directly from the service recommendation page
- **Booking Management**: View and manage all bookings in one place
- **Status Tracking**: Track booking status from pending to completion
- **Cancellation**: Cancel pending bookings
- **Contact Provider**: Direct phone contact with service providers

### For Service Providers
- **Booking Management**: View and manage all incoming bookings
- **Status Updates**: Update booking status through the workflow
- **Customer Communication**: Contact customers via phone or email
- **Booking Filtering**: Filter bookings by status

## Database Schema

### Booking Model
```prisma
model Booking {
  id              Int      @id @default(autoincrement())
  service         Service  @relation(fields: [serviceId], references: [id])
  serviceId       Int
  customer        User     @relation(fields: [customerId], references: [id])
  customerId      Int
  customerName    String
  customerEmail   String
  customerPhone   String
  customerAddress String
  scheduledDate   DateTime
  scheduledTime   String
  status          BookingStatus @default(PENDING)
  totalAmount     Float
  notes           String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum BookingStatus {
  PENDING
  CONFIRMED
  IN_PROGRESS
  COMPLETED
  CANCELLED
  REJECTED
}
```

## Booking Workflow

### Status Flow
1. **PENDING** → Customer creates booking
2. **CONFIRMED** → Provider accepts booking
3. **IN_PROGRESS** → Provider starts service
4. **COMPLETED** → Service finished
5. **CANCELLED** → Cancelled by customer or provider
6. **REJECTED** → Provider rejects booking

### Allowed Transitions
- **PENDING** → CONFIRMED, REJECTED, CANCELLED
- **CONFIRMED** → IN_PROGRESS, CANCELLED
- **IN_PROGRESS** → COMPLETED, CANCELLED
- **COMPLETED** → (Final state)
- **CANCELLED** → (Final state)
- **REJECTED** → (Final state)

## API Endpoints

### Bookings API (`/api/bookings`)
- **GET** - Fetch bookings (customer or provider)
- **POST** - Create new booking

### Individual Booking API (`/api/bookings/[id]`)
- **GET** - Fetch specific booking
- **PATCH** - Update booking status/notes
- **DELETE** - Delete booking (limited conditions)

## Components

### BookingForm (`/components/ui/booking-form.tsx`)
- Modal form for creating bookings
- Form validation and submission
- Service details display
- Customer information collection

### Customer Pages
- **Customer Bookings** (`/customer/bookings`) - View and manage customer bookings
- **Service Recommendation** - Updated with booking integration

### Provider Pages
- **Provider Bookings** (`/provider/bookings`) - Manage provider bookings

## Usage

### For Customers
1. Browse services on the recommendation page
2. Click "Book Service" on any service
3. Fill out the booking form with details
4. Submit booking (status: PENDING)
5. View booking status in "My Bookings"
6. Cancel if needed (only pending bookings)

### For Providers
1. Access booking management from dashboard
2. View all incoming bookings
3. Confirm or reject pending bookings
4. Update status as service progresses
5. Contact customers directly

## Security Features
- Authentication required for all booking operations
- Users can only access their own bookings
- Providers can only manage bookings for their services
- Status transition validation
- Permission-based actions

## Installation & Setup

1. Database schema is already updated
2. All API endpoints are configured
3. Components are ready to use
4. Navigation links added to existing pages

## File Structure
```
src/
├── app/
│   ├── api/bookings/
│   │   ├── route.ts
│   │   └── [id]/route.ts
│   ├── customer/bookings/page.tsx
│   └── provider/bookings/page.tsx
├── components/ui/
│   └── booking-form.tsx
└── prisma/schema.prisma (updated)
```

## Next Steps
1. Test the booking flow end-to-end
2. Add email notifications for booking updates
3. Implement payment integration
4. Add booking calendar view
5. Add review system after completion
6. Add booking analytics for providers

## Notes
- All times are stored as strings (e.g., "14:00")
- Dates are stored as DateTime objects
- Customer address is collected for each booking
- Notes field is optional for special requirements
- Total amount is calculated from service price