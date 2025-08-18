# Semsarak - Real Estate Platform

A modern real estate platform built with Angular 18, featuring a beautiful UI and comprehensive functionality for property search, management, and payment processing.

## 🏠 Features

- **Modern UI/UX**: Beautiful, responsive design with smooth animations
- **Property Search**: Advanced search functionality with filters and pagination
- **User Authentication**: Secure login and registration system
- **Property Management**: Add, edit, and manage properties with image upload
- **Booking System**: Complete booking workflow for renters
- **Payment Integration**: Paymob payment gateway for property advertising and booking
- **Admin Dashboard**: Comprehensive admin panel for user and property management
- **Responsive Design**: Works perfectly on all devices
- **Component-Based Architecture**: Modular and maintainable code structure

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Angular CLI

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd semsarak-app
```

2. Install dependencies:
```bash
npm install --legacy-peer-deps
```

3. Start the development server:
```bash
ng serve
```

4. Open your browser and navigate to `http://localhost:4200`

## 📁 Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── navbar/          # Navigation component
│   │   └── footer/          # Footer component
│   ├── pages/
│   │   ├── home/           # Home page with property search
│   │   ├── login/          # Login page
│   │   ├── register/       # Register page
│   │   ├── property-details/ # Property details page
│   │   ├── add-property/   # Add new property
│   │   ├── owner-properties/ # Property owner dashboard
│   │   ├── my-bookings/    # Renter bookings
│   │   ├── profile/        # User profile
│   │   ├── admin-layout/   # Admin layout wrapper
│   │   ├── admin-dashboard/ # Admin dashboard
│   │   ├── admin-user-details/ # Admin user management
│   │   ├── admin-property-details/ # Admin property management
│   │   ├── payment-success/ # Payment success page
│   │   └── payment-callback/ # Payment callback handler
│   ├── app.component.ts    # Main app component
│   ├── app.routes.ts       # Application routes
│   └── app.config.ts       # App configuration
├── styles.css              # Global styles
└── index.html              # Main HTML file
```

## 🎨 Design System

The project uses a consistent design system with:

- **Color Palette**: Blue and gold theme with CSS variables
- **Typography**: Inter font family
- **Components**: Bootstrap 5 for responsive grid and components
- **Icons**: Font Awesome for consistent iconography

### CSS Variables

```css
:root {
  --primary-blue: #1e3a8a;
  --secondary-blue: #3b82f6;
  --accent-gold: #f59e0b;
  --warm-gray: #6b7280;
  --light-gray: #f3f4f6;
  --white: #ffffff;
  --dark: #111827;
  --success-green: #10b981;
}
```

## 💳 Payment Integration

The platform integrates with Paymob payment gateway for:

- **Property Advertising**: Owners pay to advertise their properties
- **Booking Payments**: Renters pay to confirm bookings
- **Automatic Confirmation**: Payment status updates automatically
- **Transaction History**: Complete payment tracking

### Payment Flow

1. User initiates payment (advertise/booking)
2. Paymob iframe opens for payment processing
3. After successful payment, user is redirected back
4. Payment is automatically confirmed and status updated

## 🔧 Development

### Available Scripts

- `ng serve` - Start development server
- `ng build` - Build the project for production
- `ng test` - Run unit tests
- `ng lint` - Run linting

### Adding New Pages

1. Generate a new component:
```bash
ng generate component pages/new-page
```

2. Add the route in `app.routes.ts`:
```typescript
{ path: 'new-page', component: NewPageComponent }
```

3. Update navigation in `navbar.component.html`

### Adding New Components

1. Generate a new component:
```bash
ng generate component components/new-component
```

2. Import and use in other components as needed

## 📱 Responsive Design

The application is fully responsive and includes:

- Mobile-first approach
- Breakpoints for tablets and desktops
- Flexible grid system
- Touch-friendly interactions

## 🔐 Authentication & Authorization

The platform includes:

- **User Registration**: Complete registration with validation
- **User Login**: Secure authentication
- **Role-Based Access**: Owner, Renter, and Admin roles
- **Protected Routes**: Admin-only dashboard access

### User Roles

- **Owner**: Can add, edit, and manage properties
- **Renter**: Can search, view, and book properties
- **Admin**: Full system access and management

## 🏢 Admin Dashboard

Comprehensive admin panel featuring:

- **User Management**: View and manage all users
- **Property Management**: Monitor and manage properties
- **Dashboard Overview**: System statistics and insights
- **Secure Access**: Admin-only authentication

## 📱 Responsive Design

The application is fully responsive and includes:

- Mobile-first approach
- Breakpoints for tablets and desktops
- Flexible grid system
- Touch-friendly interactions

## 🎯 Implemented Features

- ✅ Property search with filters and pagination
- ✅ User authentication and registration
- ✅ Property management (add, edit, delete)
- ✅ Image upload and management
- ✅ Booking system
- ✅ Paymob payment integration
- ✅ Admin dashboard
- ✅ Responsive design
- ✅ Property status management
- ✅ Payment confirmation workflow

## 🚀 Future Enhancements

- [ ] Real-time notifications
- [ ] Map integration
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] Mobile app
- [ ] Advanced reporting
- [ ] Email notifications
- [ ] Social media integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please contact:
- Email: info@semsarak.com
- Phone: +20 123 456 7890

---

Built with ❤️ using Angular 18 and Paymob Payment Gateway
