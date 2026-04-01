# Farmer to Customer Marketplace - Complete Setup Guide

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Database Setup](#database-setup)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [Running the Application](#running-the-application)
6. [API Endpoints](#api-endpoints)
7. [Testing the Application](#testing-the-application)

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14+ recommended) - [Download](https://nodejs.org/)
- **MySQL Server** (local installation) - [Download XAMPP](https://www.apachefriends.org/) or [MySQL Installer](https://dev.mysql.com/downloads/mysql/)
- **Git** - [Download](https://git-scm.com/)
- **VS Code** (Optional but recommended)

Verify installations:
```bash
node --version
npm --version
mysql --version
```

---

## Database Setup

### Step 1: Create MySQL Database

1. **Start MySQL Server:**
   - If using XAMPP: Open XAMPP Control Panel and click "Start" next to MySQL
   - If using MySQL directly: MySQL should start as a service

2. **Create Database:**
   Open MySQL Command Line or use MySQL Workbench:

   ```sql
   CREATE DATABASE farmer_marketplace;
   USE farmer_marketplace;
   ```

3. **Verify Connection:**
   ```sql
   SHOW DATABASES;
   ```

### Step 2: Configure Backend for Database

1. Navigate to backend folder:
   ```bash
   cd backend
   ```

2. Create `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` file with your MySQL credentials:
   ```
   DATABASE_URL="mysql://root:@localhost:3306/farmer_marketplace"
   JWT_SECRET="your_super_secret_jwt_key_change_this_in_production"
   JWT_EXPIRE="7d"
   PORT=5000
   NODE_ENV="development"
   FRONTEND_URL="http://localhost:3000"
   ```

---

## Backend Setup

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

This will install all packages from `package.json`:
- Express.js - Web framework
- Prisma - ORM for database
- JWT - Authentication
- Bcryptjs - Password hashing
- Multer - File upload
- CORS - Cross-origin requests

### Step 2: Setup Prisma

1. Generate Prisma Client:
   ```bash
   npx prisma generate
   ```

2. Create Tables (Database Migration):
   ```bash
   npx prisma migrate dev --name init
   ```

   This will:
   - Create all tables from `schema.prisma`
   - Set up relationships
   - Create migrations folder

3. (Optional) View Database with Prisma Studio:
   ```bash
   npx prisma studio
   ```
   This opens a GUI at `http://localhost:5555` to view your database

### Step 3: Start Backend Server

```bash
npm run dev
```

**Expected Output:**
```
✅ Server is running on http://localhost:5000
📁 Upload folder: ./uploads
🌍 Frontend URL: http://localhost:3000
```

Keep this terminal open! The backend is running.

---

## Frontend Setup

### Step 1: Install Dependencies

Open a **new terminal** and navigate to frontend:

```bash
cd frontend
npm install
```

This will install:
- React 18
- React Router
- Axios (API calls)
- Tailwind CSS
- React Hot Toast (notifications)

### Step 2: Create Environment Variables

Create `.env.local` in frontend folder:

```bash
echo REACT_APP_API_URL=http://localhost:5000/api > .env.local
```

### Step 3: Start Frontend Server

```bash
npm start
```

**Expected Output:**
```
Compiled successfully!

You can now view farmer-marketplace-frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

Your browser should open automatically at `http://localhost:3000`

---

## Running the Application

### Requirements Met:
✅ Backend running on `http://localhost:5000`
✅ Frontend running on `http://localhost:3000`
✅ MySQL database connected

### Verify Everything:

1. **Backend Health Check:**
   ```bash
   curl http://localhost:5000/api/health
   ```
   Expected response: `{"message":"Server is running"}`

2. **Frontend:**
   Visit `http://localhost:3000` in your browser

3. **Database:**
   - Open Prisma Studio: `npx prisma studio` in backend folder
   - Or use MySQL Workbench

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)
- `PUT /api/auth/profile` - Update profile (requires auth)

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get product details
- `GET /api/products/farmer/:farmerId` - Get farmer's products
- `POST /api/products` - Create product (farmer only)
- `PUT /api/products/:id` - Update product (farmer only)
- `DELETE /api/products/:id` - Delete product (farmer only)

### Cart
- `GET /api/cart` - Get cart items (customer only)
- `POST /api/cart` - Add to cart (customer only)
- `PUT /api/cart/:cartItemId` - Update quantity (customer only)
- `DELETE /api/cart/:cartItemId` - Remove from cart (customer only)
- `DELETE /api/cart` - Clear cart (customer only)

### Orders
- `POST /api/orders` - Create order (customer only)
- `GET /api/orders/customer/orders` - Get customer orders (customer only)
- `GET /api/orders/farmer/orders` - Get farmer orders (farmer only)
- `GET /api/orders/:orderId` - Get order details
- `PUT /api/orders/:orderId` - Update order status

### Reviews
- `POST /api/reviews` - Add/Update review (customer only)
- `GET /api/reviews/product/:productId` - Get product reviews
- `GET /api/reviews/product/:productId/customer` - Get customer review
- `DELETE /api/reviews/:reviewId` - Delete review (customer only)

### Admin
- `GET /api/admin/users` - Get all users (admin only)
- `PUT /api/admin/users/:userId/deactivate` - Deactivate user
- `PUT /api/admin/users/:userId/activate` - Activate user
- `GET /api/admin/products` - Get all products
- `GET /api/admin/orders` - Get all orders
- `GET /api/admin/dashboard/stats` - Dashboard statistics

---

## Testing the Application

### Create Test Accounts

Open your browser and navigate to `http://localhost:3000`

#### 1. Register as Customer
- Click "Register" button
- Fill: Name: "John Customer", Email: "customer@test.com", Password: "test123", Role: "Customer"
- Click Register

#### 2. Register as Farmer
- Register again with different email
- Name: "Jane Farmer", Email: "farmer@test.com", Password: "test123", Role: "Farmer"
- Click Register

#### 3. Register as Admin (Manual Database Insert)
```sql
-- In MySQL
USE farmer_marketplace;
INSERT INTO users (email, password, fullName, role, isActive, createdAt, updatedAt)
VALUES (
  'admin@test.com',
  '$2a$10$...',  -- bcrypt hash of 'test123' - generate using online tool
  'Admin User',
  'ADMIN',
  true,
  NOW(),
  NOW()
);
```

### Test Customer Flow
1. Login as customer (customer@test.com / test123)
2. Browse products (may be empty initially)
3. Add to cart
4. Checkout
5. View orders in dashboard

### Test Farmer Flow
1. Login as farmer (farmer@test.com / test123)
2. Go to Dashboard → Products
3. Add a new product:
   - Name: "Fresh Tomatoes"
   - Category: "vegetables"
   - Price: 50
   - Quantity: 100
   - Unit: "kg"
   - Description: "Fresh red tomatoes from farm"
4. View in customer app under Products
5. Manage orders from customer in Orders tab

### Test Admin Panel
1. Login as admin (admin@test.com / test123)
2. Go to Admin Dashboard
3. View statistics, users, products, orders
4. Manage users (activate/deactivate)

---

## Folder Structure Reference

```
farmer-marketplace/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Business logic
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Authentication, etc.
│   │   ├── config/          # Configurations
│   │   ├── utils/           # Helper functions
│   │   └── server.js        # Main server file
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   └── migrations/      # Database migrations
│   ├── uploads/             # Uploaded product images
│   ├── package.json
│   ├── .env
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # React pages
│   │   ├── context/         # Context API
│   │   ├── services/        # API services
│   │   ├── App.js           # Main component
│   │   └── index.js         # Entry point
│   ├── public/
│   └── package.json
```

---

## Common Issues & Solutions

### Issue: "MySQL connection failed"
- Ensure MySQL is running
- Check DATABASE_URL in .env
- Verify credentials

### Issue: "Port 3000/5000 already in use"
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Issue: "Cannot find module '@prisma/client'"
```bash
cd backend
npx prisma generate
npm install
```

### Issue: "CORS error"
- Ensure backend CORS is configured correctly
- Check FRONTEND_URL in .env

---

## Next Steps

1. **Customize**: Modify colors, logo, business logic
2. **Add Features**: Wishlist, notifications, analytics
3. **Deploy**: Move to production server (Heroku, AWS, DigitalOcean)
4. **Real Payments**: Integrate Stripe, PayPal, Razorpay
5. **Cloud Database**: Move to cloud MySQL (AWS RDS, Google Cloud SQL)

---

## Support & Resources

- **Prisma Docs**: https://www.prisma.io/docs/
- **Express.js Docs**: https://expressjs.com/
- **React Docs**: https://react.dev/
- **Tailwind CSS**: https://tailwindcss.com/
- **MySQL Docs**: https://dev.mysql.com/doc/

---

**Happy Coding! 🚀**
