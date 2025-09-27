# Tax Management System - Laravel Backend

This directory contains the Laravel backend API for the Tax Management System.

## Setup Instructions

1. Install Laravel and dependencies:
```bash
composer install
```

2. Set up environment:
```bash
cp .env.example .env
php artisan key:generate
```

3. Configure database in .env file

4. Run migrations:
```bash
php artisan migrate
```

5. Seed database:
```bash
php artisan db:seed
```

6. Start development server:
```bash
php artisan serve
```

## API Endpoints

### Authentication
- POST `/api/auth/login` - User login
- POST `/api/auth/register` - User registration
- POST `/api/auth/logout` - User logout
- POST `/api/auth/refresh` - Refresh token
- POST `/api/auth/forgot-password` - Send password reset email
- POST `/api/auth/reset-password` - Reset password

### User Management
- GET `/api/users` - List users (Admin/Super Admin)
- POST `/api/users` - Create user (Admin/Super Admin)
- GET `/api/users/{id}` - Get user details
- PUT `/api/users/{id}` - Update user
- DELETE `/api/users/{id}` - Delete user (Admin/Super Admin)

### Tax Returns
- GET `/api/tax-returns` - List tax returns
- POST `/api/tax-returns` - Create tax return
- GET `/api/tax-returns/{id}` - Get tax return details
- PUT `/api/tax-returns/{id}` - Update tax return
- DELETE `/api/tax-returns/{id}` - Delete tax return
- POST `/api/tax-returns/{id}/submit` - Submit tax return

### Payments
- GET `/api/payments` - List payments
- POST `/api/payments` - Create payment
- GET `/api/payments/{id}` - Get payment details
- PUT `/api/payments/{id}` - Update payment status
- POST `/api/payments/{id}/process` - Process payment

### Audits
- GET `/api/audits` - List audits
- POST `/api/audits` - Create audit
- GET `/api/audits/{id}` - Get audit details
- PUT `/api/audits/{id}` - Update audit
- POST `/api/audits/{id}/complete` - Complete audit

### Reports
- GET `/api/reports/dashboard-stats` - Dashboard statistics
- GET `/api/reports/revenue` - Revenue reports
- GET `/api/reports/compliance` - Compliance reports
- GET `/api/reports/taxpayer-activity` - Taxpayer activity reports

### File Management
- POST `/api/files/upload` - Upload file
- GET `/api/files/{id}` - Download file
- DELETE `/api/files/{id}` - Delete file

## Database Schema

See `database/migrations/` for detailed schema information.

## Testing

Run tests with:
```bash
php artisan test
```