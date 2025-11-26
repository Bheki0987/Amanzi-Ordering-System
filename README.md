# Amanzi Ordering System

![Amanzi Logo](frontend/public/images/Amanzi%20Logo.png)

A comprehensive water delivery ordering system designed for NWU Mahikeng Campus students and service providers. The system streamlines the process of ordering and delivering water to student residences.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [User Roles](#user-roles)
- [Team](#team)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### For Students (Customers)
- 🛒 **Easy Water Ordering** - Order water with minimum 5-liter requirement
- 📍 **Residence Selection** - Choose delivery location from available clusters
- ⏰ **Flexible Delivery Slots** - Select preferred delivery time slots
- 👤 **Provider Selection** - Choose from available service providers
- 💳 **Multiple Payment Options** - Cash on Delivery or Stripe integration
- 📱 **Order Tracking** - Real-time order status updates
- 📄 **Invoice Generation** - Download/print order invoices with provider details
- 🔔 **Notifications** - Get notified about order status changes
- 📊 **Order History** - View and filter past orders

### For Service Providers
- 📦 **Order Management** - View and manage incoming orders
- ✅ **Accept/Reject Orders** - Control which orders to fulfill
- 📈 **Analytics Dashboard** - View revenue and order statistics
- 📊 **Charts & Reports** - Revenue trends, delivery slot distribution, residence analytics
- 📞 **Contact Information** - Phone number displayed to customers for delivery coordination
- 🔔 **Order Notifications** - Real-time alerts for new orders
- 💰 **Revenue Tracking** - Monitor earnings and transaction history

### System Features
- 🔐 **Secure Authentication** - JWT-based authentication with role-based access
- 👥 **User Management** - Separate dashboards for customers and providers
- 📊 **Advanced Filtering** - Filter orders by status, date range, and search
- 🎨 **Modern UI/UX** - Clean, intuitive interface with responsive design
- 📧 **Email Notifications** - Password reset and order confirmation emails
- 💾 **Data Persistence** - MongoDB database for reliable data storage

## 🛠 Tech Stack

### Frontend
- **React** 18.2.0 - UI framework
- **React Router DOM** 6.x - Navigation and routing
- **Axios** - HTTP client for API calls
- **Chart.js** 4.x - Data visualization
- **React Chartjs 2** - React wrapper for Chart.js
- **Stripe** - Payment processing integration
- **Vite** - Fast build tool and dev server
- **CSS3** - Custom styling

### Backend
- **Node.js** - Runtime environment
- **Express.js** 4.x - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** 7.x - ODM for MongoDB
- **JWT (jsonwebtoken)** - Authentication tokens
- **Bcrypt.js** - Password hashing
- **Nodemailer** - Email service
- **Stripe** - Payment processing
- **CORS** - Cross-origin resource sharing
- **Dotenv** - Environment variable management

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** (v8 or higher) - Comes with Node.js
- **MongoDB Atlas Account** - [Sign up](https://www.mongodb.com/cloud/atlas)
- **Git** - [Download](https://git-scm.com/)
- **Stripe Account** (Optional for payment features) - [Sign up](https://stripe.com/)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/amanzi-ordering-system.git
cd amanzi-ordering-system
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

## ⚙️ Configuration

### Backend Configuration

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/amanzi?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
JWT_EXPIRE=7d

# Email Configuration (for password reset)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM=noreply@amanzi.com

# Stripe Configuration (Optional)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### Frontend Configuration

Create `.env.development` in the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

Create `.env.production` in the `frontend` directory:

```env
VITE_API_URL=https://your-production-api.com/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
```

### MongoDB Atlas Setup

1. Create a MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster (free tier available)
3. Add a database user with username and password
4. Whitelist your IP address (or use `0.0.0.0/0` for development)
5. Get your connection string from "Connect" → "Connect your application"
6. Replace `<username>`, `<password>`, and `<dbname>` in the connection string
7. Update `MONGODB_URI` in your `.env` file

### Email Setup (Gmail)

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account → Security → App Passwords
   - Create a new app password for "Mail"
   - Use this 16-character password in `EMAIL_PASSWORD`

## 🏃‍♂️ Running the Application

### Development Mode

**Terminal 1 - Backend Server:**
```bash
cd backend
npm run dev
```
Backend will run on http://localhost:5000

**Terminal 2 - Frontend Development Server:**
```bash
cd frontend
npm run dev
```
Frontend will run on http://localhost:5173

### Production Mode

**Backend:**
```bash
cd backend
npm start
```

**Frontend Build:**
```bash
cd frontend
npm run build
npm run preview
```

## 📁 Project Structure

```
amanzi-ordering-system2/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js                   # MongoDB connection with retry logic
│   │   │   └── stripe.js               # Stripe configuration
│   │   ├── controllers/
│   │   │   ├── authController.js       # User registration & login
│   │   │   ├── customerController.js   # Customer-specific operations
│   │   │   ├── orderController.js      # Order CRUD operations
│   │   │   ├── passwordController.js   # Password reset functionality
│   │   │   ├── paymentController.js    # Stripe payment processing
│   │   │   ├── providerController.js   # Provider statistics & analytics
│   │   │   └── webhookController.js    # Stripe webhook handling
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js       # JWT token verification
│   │   │   ├── errorHandler.js         # Global error handling
│   │   │   └── validation.js           # Input validation middleware
│   │   ├── models/
│   │   │   ├── Notification.js         # Notification schema
│   │   │   ├── Order.js                # Order schema with validations
│   │   │   └── User.js                 # User schema (Customer/Provider)
│   │   ├── routes/
│   │   │   ├── authRoutes.js           # Authentication routes
│   │   │   ├── customerRoutes.js       # Customer-specific routes
│   │   │   ├── orderRoutes.js          # Order management routes
│   │   │   ├── passwordRoutes.js       # Password reset routes
│   │   │   ├── paymentRoutes.js        # Payment processing routes
│   │   │   ├── providerRoutes.js       # Provider routes
│   │   │   └── webhookRoutes.js        # Webhook routes
│   │   ├── services/
│   │   │   └── emailService.js         # Email sending functionality
│   │   ├── app.js                      # Express app configuration
│   │   └── server.js                   # Server entry point with MongoDB connection
│   ├── .env                            # Environment variables (not in repo)
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── public/
│   │   └── images/
│   │       └── Amanzi Logo.png         # Application logo
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   │   ├── ForgotPassword.jsx      # Password reset request
│   │   │   │   ├── Login.jsx               # User login form
│   │   │   │   ├── PrivateRoute.jsx        # Protected route wrapper
│   │   │   │   ├── Register.jsx            # User registration form
│   │   │   │   └── ResetPassword.jsx       # Password reset with token
│   │   │   ├── Charts/
│   │   │   │   ├── DeliverySlotChart.jsx   # Delivery time slot analytics
│   │   │   │   ├── ResidenceChart.jsx      # Orders by residence
│   │   │   │   └── RevenueChart.jsx        # Revenue trends chart
│   │   │   ├── Dashboard/
│   │   │   │   ├── CustomerDashboard.jsx   # Customer main dashboard
│   │   │   │   └── ProviderDashboard.jsx   # Provider main dashboard
│   │   │   ├── Home/
│   │   │   │   └── Home.jsx                # Landing page
│   │   │   ├── Invoices/
│   │   │   │   ├── Invoice.jsx             # Printable invoice
│   │   │   │   └── InvoiceModal.jsx        # Invoice modal popup
│   │   │   ├── Notification/
│   │   │   │   ├── CustomerNotification.jsx  # Customer notifications
│   │   │   │   └── DeliveryReminders.jsx     # Delivery reminder alerts
│   │   │   ├── Order/
│   │   │   │   ├── CustomerOrderHistory.jsx  # Customer order list
│   │   │   │   ├── OrderForm.jsx             # New order form
│   │   │   │   └── ProviderOrderHistory.jsx  # Provider order management
│   │   │   └── Payment/
│   │   │       └── StripePayment.jsx         # Stripe payment component
│   │   ├── services/
│   │   │   ├── api.js                  # Axios instance configuration
│   │   │   ├── authService.js          # Authentication API calls
│   │   │   ├── orderService.js         # Order API calls
│   │   │   ├── passwordService.js      # Password reset API calls
│   │   │   ├── paymentService.js       # Payment API calls
│   │   │   └── providerService.js      # Provider API calls
│   │   ├── styles/
│   │   │   └── main.css                # Global styles
│   │   ├── App.jsx                     # Main app component with routing
│   │   └── index.jsx                   # Application entry point
│   ├── .env.development                # Development environment variables
│   ├── .env.production                 # Production environment variables
│   ├── index.html                      # HTML template
│   ├── package.json
│   ├── postcss.config.cjs
│   ├── tailwind.config.cjs
│   └── vite.config.js                  # Vite configuration
│
├── .gitignore                          # Git ignore rules
└── README.md                           # Project documentation
```

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user (customer/provider) | No |
| POST | `/auth/login` | Login user and get JWT token | Yes |
| GET | `/auth/me` | Get current user details | Yes |

### Order Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/orders` | Create new water order | Yes (Customer) |
| GET | `/orders` | Get all orders | Yes (Provider/Admin) |
| GET | `/orders/my-orders` | Get customer's orders | Yes (Customer) |
| GET | `/orders/:id` | Get single order details | Yes |
| PUT | `/orders/:id/status` | Update order status | Yes (Provider) |
| PUT | `/orders/:id/complete` | Mark order completed | Yes (Customer) |
| DELETE | `/orders/:id` | Cancel order | Yes (Customer) |

### Provider Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/providers` | Get all available providers | Yes |
| GET | `/providers/stats` | Get provider statistics | Yes (Provider) |
| GET | `/providers/revenue` | Get revenue analytics | Yes (Provider) |

### Payment Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/payments/create-intent` | Create Stripe payment intent | Yes |
| POST | `/payments/webhook` | Handle Stripe webhooks | No |

### Password Reset Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/password/forgot` | Request password reset email | No |
| POST | `/password/reset/:token` | Reset password with token | No |

## 👥 User Roles

### Customer (Student)
- Register with name, email, password, and residence
- Place water orders (minimum 5 liters)
- Select delivery time slots
- Choose preferred service provider
- Track order status in real-time
- View order history with filtering
- Download invoices with provider contact details
- Receive email and in-app notifications
- Complete orders upon delivery

### Provider (Service Provider)
- Register with name, email, password, and phone number (required)
- View incoming orders from customers
- Accept or reject orders based on availability
- Update order status (pending → accepted → completed)
- View analytics dashboard with:
  - Total revenue
  - Number of orders
  - Revenue trends over time
  - Delivery slot distribution
  - Orders by residence
- Contact information displayed to customers
- Receive notifications for new orders

## 👨‍💻 Team

This project was developed by a dedicated team of NWU Mahikeng Campus students:

### Development Team

**Bheki Mogola** - *Backend Developer* 
[LinkedIn](https://www.linkedin.com/in/bheki-mogola-8481122b7/) 
- Backend architecture and API development
- Database design and MongoDB integration
- Authentication and authorization implementation
- Payment processing integration
- Email service configuration

**Karabo Makau** - *Frontend Developer* 
[LinkedIn](https://www.linkedin.com/in/karabo-makau-399398221/) 
[GitHub](https://github.com/Karabo28Git) 
- React component development
- User interface design and implementation
- State management and routing
- Frontend API integration
- Responsive design and styling

**Potego Sethwape** - *Documentation Specialist*
- Project documentation
- User guides and manuals
- API documentation
- Testing documentation
- Requirements analysis

## 🤝 Contributing

Contributions are welcome! If you'd like to contribute to this project:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code structure and naming conventions
- Add comments for complex logic
- Test thoroughly before submitting
- Update documentation if needed
- Use meaningful commit messages

## 🐛 Known Issues & Limitations

- Payment processing requires active Stripe account and configuration
- Email functionality requires SMTP server setup (Gmail recommended)
- Real-time notifications require page refresh
- Mobile responsiveness can be improved in some areas

## 📝 Future Enhancements

- [ ] Real-time order updates using WebSockets
- [ ] Mobile application (React Native)
- [ ] SMS notifications for order updates
- [ ] GPS tracking for water deliveries
- [ ] Rating and review system for providers
- [ ] Multi-language support
- [ ] Advanced admin dashboard
- [ ] Automated reminder system
- [ ] Loyalty program for frequent customers
- [ ] Bulk order discounts

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- NWU Mahikeng Campus for the opportunity and inspiration
- All team members for their dedication and hard work
- Open source community for the amazing tools and libraries
- Lecturers and mentors for guidance and support

## 📞 Support & Contact

For questions, issues, or suggestions:

- Open an issue in the repository
- Contact the development team
- Email: 
  - Bheki: bhekimogola123@gmail.com
  - Karabo: makaukarabo538@gmail.com
  - Potego: 

## 🔗 Related Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [React Documentation](https://react.dev/)
- [Express.js Documentation](https://expressjs.com/)
- [Stripe Documentation](https://stripe.com/docs)
- [Node.js Documentation](https://nodejs.org/docs/)

---

**Made with ❤️ by NWU Mahikeng Campus Students**

**Amanzi Ordering System** - Bringing clean water to your doorstep, one order at a time! 💧
