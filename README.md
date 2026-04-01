# Farmer to Customer Marketplace - Complete Project

A full-stack web application connecting farmers directly with customers for fresh, quality produce. Built with React, Node.js, Express, and MySQL.

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Folder Structure](#folder-structure)
- [Database Schema](#database-schema)
- [API Overview](#api-overview)
- [User Roles](#user-roles)
- [Development](#development)
- [Deployment](#deployment)

---

## About

This project eliminates middlemen in agricultural supply chains by creating a direct marketplace between farmers and customers. Farmers can list and manage their products, while customers can browse, rate, and purchase directly from source.

**Key Benefits:**
- 🌾 Fresh produce directly from farmers
- 💰 Better prices (no middlemen)
- ⭐ Transparent ratings and reviews
- 🚚 Direct delivery from farm to home
- 🔐 Secure authentication with JWT

---

## Features

### For Customers
- ✅ User registration and authentication
- ✅ Browse products by category, price, location
- ✅ Search for specific products
- ✅ Add items to cart
- ✅ Place orders with delivery address
- ✅ Choose payment method (COD/Online)
- ✅ View order history
- ✅ Rate and review products
- ✅ View farmer profiles

### For Farmers
- ✅ User registration and authentication
- ✅ Create and manage product listings
- ✅ Upload product images
- ✅ Set prices and quantities
- ✅ View orders from customers
- ✅ Accept/reject orders
- ✅ Update order status
- ✅ View performance metrics

### For Admin
- ✅ View all users (farmers, customers)
- ✅ Manage user accounts (activate/deactivate)
- ✅ View all products
- ✅ View all orders
- ✅ Dashboard with statistics
- ✅ Monitor marketplace health

---

## Tech Stack

### Frontend
- **React** 18.2.0 - UI library
- **React Router** 6.8.0 - Client-side routing
- **Axios** 1.3.2 - HTTP client
- **Tailwind CSS** 3.2.4 - Styling
- **React Hot Toast** 2.4.0 - Notifications
- **React Icons** 4.7.1 - Icon library

### Backend
- **Node.js** - Runtime
- **Express.js** 4.18.2 - Web framework
- **Prisma** 5.0.0 - ORM
- **MySQL** - Relational database
- **JWT** 9.0.0 - Authentication
- **Bcryptjs** 2.4.3 - Password hashing
- **Multer** 1.4.5 - File upload

### Database
- **MySQL** - Local relational database
- **Prisma** - Database ORM and migrations

---

## Quick Start

### Prerequisites
- Node.js v14+
- MySQL Server running locally
- npm or yarn package manager

### Installation

1. **Clone repository:**
   ```bash
   cd farmer-marketplace
   ```

2. **Setup Backend:**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your MySQL credentials
   npm install
   npx prisma migrate dev --name init
   npm run dev
   ```

3. **Setup Frontend (in new terminal):**
   ```bash
   cd frontend
   npm install
   npm start
   ```

4. **Access Application:**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000
   - API Docs: See [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

---

## Folder Structure

```
farmer-marketplace/
│
├── backend/
│   ├── src/
│   │   ├── controllers/         # Business logic for each feature
│   │   │   ├── authController.js
│   │   │   ├── productController.js
│   │   │   ├── cartController.js
│   │   │   ├── orderController.js
│   │   │   ├── reviewController.js
│   │   │   └── adminController.js
│   │   │
│   │   ├── routes/              # API endpoints
│   │   │   ├── authRoutes.js
│   │   │   ├── productRoutes.js
│   │   │   ├── cartRoutes.js
│   │   │   ├── orderRoutes.js
│   │   │   ├── reviewRoutes.js
│   │   │   └── adminRoutes.js
│   │   │
│   │   ├── middleware/          # Authentication & validation
│   │   │   └── auth.js
│   │   │
│   │   ├── config/              # Configuration files
│   │   │   ├── config.js
│   │   │   └── multer.js        # File upload config
│   │   │
│   │   ├── utils/               # Utility functions
│   │   │   ├── jwt.js
│   │   │   └── password.js
│   │   │
│   │   └── server.js            # Express server setup
│   │
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema
│   │   └── migrations/          # Database version control
│   │
│   ├── uploads/                 # Product image uploads
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js        # Navigation bar
│   │   │   └── Footer.js        # Footer
│   │   │
│   │   ├── pages/               # React pages/screens
│   │   │   ├── Home.js
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Products.js
│   │   │   ├── ProductDetail.js
│   │   │   ├── Cart.js
│   │   │   ├── Checkout.js
│   │   │   ├── CustomerDashboard.js
│   │   │   ├── FarmerDashboard.js
│   │   │   └── AdminDashboard.js
│   │   │
│   │   ├── context/             # React Context API
│   │   │   └── AuthContext.js
│   │   │
│   │   ├── services/            # API calls
│   │   │   └── api.js
│   │   │
│   │   ├── App.js               # Main component with routing
│   │   ├── index.js             # Entry point
│   │   └── index.css            # Global styles
│   │
│   ├── public/
│   │   └── index.html
│   │
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── .gitignore
│
├── SETUP_GUIDE.md               # Complete setup instructions
├── API_DOCUMENTATION.md         # API endpoint reference
├── SAMPLE_DATA.sql              # Sample data for testing
└── README.md                    # This file
```

---

## Database Schema

### Users Table
- `id` - Primary key
- `email` - Unique email
- `password` - Hashed password
- `fullName` - User's name
- `phone` - Contact number
- `address` - Address
- `role` - FARMER, CUSTOMER, or ADMIN
- `profileImage` - Profile photo URL
- `isActive` - Account status
- `createdAt`, `updatedAt` - Timestamps

### Products Table
- `id` - Primary key
- `farmerId` - Foreign key to User
- `name`, `category`, `description`
- `price`, `quantity`, `unit`
- `harvestDate`, `isOrganic`
- `images` - JSON array of image paths
- `rating`, `totalReviews`
- `isActive` - Availability status

### Orders Table
- `id` - Primary key
- `customerId` - Foreign key to User
- `totalPrice`, `status`
- `paymentMethod` (COD/ONLINE)
- `paymentStatus`
- `deliveryAddress`, `orderNumber`
- Timestamps

### OrderItems Table
- `id` - Primary key
- `orderId`, `productId` - Foreign keys
- `quantity`, `priceAtOrder`

### Reviews Table
- `id` - Primary key
- `productId`, `customerId` - Foreign keys
- `rating` (1-5), `comment`
- Timestamps

### CartItems Table
- `id` - Primary key
- `customerId`, `productId` - Foreign keys
- `quantity`

---

## API Overview

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Products
- `GET /api/products` - List products with filters
- `GET /api/products/:id` - Product details
- `POST /api/products` - Create product (Farmer)
- `PUT /api/products/:id` - Edit product (Farmer)
- `DELETE /api/products/:id` - Delete product (Farmer)

### Cart
- `GET /api/cart` - View cart
- `POST /api/cart` - Add to cart
- `PUT /api/cart/:itemId` - Update quantity
- `DELETE /api/cart/:itemId` - Remove item
- `DELETE /api/cart` - Clear cart

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/customer/orders` - Customer orders
- `GET /api/orders/farmer/orders` - Farmer orders
- `GET /api/orders/:id` - Order details
- `PUT /api/orders/:id` - Update status

### Reviews
- `POST /api/reviews` - Add review
- `GET /api/reviews/product/:id` - Product reviews
- `DELETE /api/reviews/:id` - Delete review

### Admin
- `GET /api/admin/users` - All users
- `PUT /api/admin/users/:id/deactivate` - Deactivate user
- `GET /api/admin/dashboard/stats` - Dashboard stats

See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for complete API reference.

---

## User Roles

### Customer
- View and search products
- Add to cart
- Place orders
- View order history
- Rate and review products
- Manage profile

### Farmer
- Register and create product listings
- Upload product images
- View orders from customers
- Accept/reject orders
- Update order status
- Track sales
- Manage products

### Admin
- Oversee marketplace
- View all users, products, orders
- Manage user accounts
- Monitor analytics
- Ensure platform health

---

## Development

### Running Locally

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

### Database Operations

```bash
# View database with Prisma Studio
cd backend
npx prisma studio

# Create new migration
npx prisma migrate dev --name migration_name

# Reset database
npx prisma migrate reset
```

### Testing Accounts

```
Admin:
- Email: admin@test.com
- Password: test123

Farmer:
- Email: farmer@test.com
- Password: test123

Customer:
- Email: customer@test.com
- Password: test123
```

See [SAMPLE_DATA.sql](SAMPLE_DATA.sql) for more sample data.

---

## Deployment

### Backend Deployment (Heroku example)

```bash
# Create Heroku app
heroku create app-name

# Set environment variables
heroku config:set DATABASE_URL=mysql://username:password@host/db
heroku config:set JWT_SECRET=your_secret_key

# Deploy
git push heroku main
```

### Frontend Deployment (Vercel example)

```bash
# Deploy with Vercel
vercel --prod
```

### Database Migration

```bash
# Run migrations on production
heroku run npx prisma migrate deploy
```

---

## Performance Optimization

- ✅ Image optimization
- ✅ Pagination (12 products per page)
- ✅ JWT token caching
- ✅ Database indexing on frequently queried fields
- ✅ CORS for better API calls
- ✅ File upload size limiting

---

## Security Features

- ✅ Password hashing with bcryptjs
- ✅ JWT-based authentication
- ✅ Protected API endpoints with role-based access control
- ✅ File upload validation (images only)
- ✅ Input validation with express-validator
- ✅ CORS protection

---

## Future Enhancements

- [ ] Real payment gateway integration (Stripe, Razorpay)
- [ ] Email notifications
- [ ] SMS updates
- [ ] Wishlist feature
- [ ] Recommendation engine
- [ ] Live chat between farmers and customers
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Subscription/recurring orders
- [ ] GST tax calculation

---

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## License

This project is open source and available under the MIT License.

---

## Support

For issues, questions, or suggestions:
- Check [SETUP_GUIDE.md](SETUP_GUIDE.md) for troubleshooting
- Review [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for API help
- Create an issue on GitHub

---

## Acknowledgments

- Built with ❤️ for farmers and customers
- Inspired by direct-to-consumer agricultural initiatives
- Designed for transparency and fair pricing

---

**Happy Farming! 🌾**

Last Updated: March 2024
