# Project Structure & File Guide

Complete overview of all files in the Farmer to Customer Marketplace application.

---

## Directory Structure

```
farmers-marketplace/
│
├── backend/                                 # Node.js/Express backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── config.js                   # Environment configuration
│   │   │   └── multer.js                   # File upload configuration
│   │   │
│   │   ├── utils/
│   │   │   ├── jwt.js                      # JWT token functions
│   │   │   └── password.js                 # Password hashing functions
│   │   │
│   │   ├── middleware/
│   │   │   └── auth.js                     # Authentication & authorization
│   │   │
│   │   ├── controllers/
│   │   │   ├── authController.js           # User auth logic
│   │   │   ├── productController.js        # Product CRUD
│   │   │   ├── cartController.js           # Shopping cart logic
│   │   │   ├── orderController.js          # Order management
│   │   │   ├── reviewController.js         # Product reviews
│   │   │   └── adminController.js          # Admin functions
│   │   │
│   │   ├── routes/
│   │   │   ├── authRoutes.js               # /api/auth endpoints
│   │   │   ├── productRoutes.js            # /api/products endpoints
│   │   │   ├── cartRoutes.js               # /api/cart endpoints
│   │   │   ├── orderRoutes.js              # /api/orders endpoints
│   │   │   ├── reviewRoutes.js             # /api/reviews endpoints
│   │   │   └── adminRoutes.js              # /api/admin endpoints
│   │   │
│   │   ├── server.js                       # Express app setup
│   │   └── index.js                        # Server entry point
│   │
│   ├── prisma/
│   │   └── schema.prisma                   # Database schema
│   │
│   ├── uploads/                            # Product images directory
│   ├── .env.example                        # Environment template
│   ├── .gitignore                          # Git ignore rules
│   ├── package.json                        # Dependencies
│   └── README.md                           # Backend documentation
│
│
├── frontend/                                # React.js frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js                   # Navigation bar
│   │   │   └── Footer.js                   # Footer component
│   │   │
│   │   ├── pages/
│   │   │   ├── Home.js                     # Landing page
│   │   │   ├── Login.js                    # Login page
│   │   │   ├── Register.js                 # Sign up page
│   │   │   ├── Products.js                 # Product listing
│   │   │   ├── ProductDetail.js            # Product detail view
│   │   │   ├── Cart.js                     # Shopping cart
│   │   │   ├── Checkout.js                 # Order placement
│   │   │   ├── CustomerDashboard.js        # Customer order history
│   │   │   ├── FarmerDashboard.js          # Farmer management
│   │   │   └── AdminDashboard.js           # Admin panel
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.js              # Auth state management
│   │   │
│   │   ├── services/
│   │   │   └── api.js                      # API client & endpoints
│   │   │
│   │   ├── App.js                          # Main app component
│   │   ├── index.js                        # React entry point
│   │   ├── index.css                       # Global styles
│   │   └── logo.svg                        # Placeholder logo
│   │
│   ├── public/
│   │   └── index.html                      # HTML entry point
│   │
│   ├── .env.example                        # Environment template
│   ├── .gitignore                          # Git ignore rules
│   ├── package.json                        # Dependencies
│   ├── tailwind.config.js                  # Tailwind CSS config
│   ├── postcss.config.js                   # PostCSS config
│   └── README.md                           # Frontend documentation
│
│
├── Documentation/
│   ├── SETUP_GUIDE.md                      # Complete setup instructions
│   ├── API_DOCUMENTATION.md                # API reference with examples
│   ├── DATABASE_SCHEMA.md                  # Database design & queries
│   ├── TESTING_GUIDE.md                    # Testing procedures
│   ├── DEPLOYMENT_GUIDE.md                 # Deployment instructions
│   ├── TROUBLESHOOTING.md                  # Common issues & fixes
│   ├── PROJECT_STRUCTURE.md                # This file
│   └── SAMPLE_DATA.sql                     # Sample test data
│
│
├── README.md                               # Project overview
├── .gitignore                              # Global git ignore
└── DEPLOYMENT_CHECKLIST.md                 # Pre-deployment checklist
```

---

## File Descriptions

### Backend - Core Files

#### `backend/src/server.js` (80 lines)
**Purpose:** Express application setup and initialization
- Middleware configuration (CORS, JSON, URL-encoded)
- Route registration for all endpoints
- Static file serving for uploads
- Error handling middleware
- **Key Components:**
  - `express.json()` - Parse JSON requests
  - `express.static()` - Serve /uploads directory
  - `app.use()` - Register all routes
  - `app.listen()` - Start server on specified port

**Key Exports:** None, called directly

#### `backend/src/config/config.js` (30 lines)
**Purpose:** Centralized environment variable management
- Loads and validates .env variables
- Provides default values where applicable
- **Environment Variables:**
  ```
  NODE_ENV - Development/Production mode
  PORT - Server port (default: 5000)
  DATABASE_URL - MySQL connection string
  JWT_SECRET - Secret key for token signing
  JWT_EXPIRE - Token expiration time (default: 7d)
  FRONTEND_URL - Frontend domain for CORS
  MAX_FILE_SIZE - Maximum upload size (default: 5MB)
  UPLOAD_PATH - Directory for uploads (default: /uploads)
  ```

**Key Function:** `config.get(key, defaultValue)`

#### `backend/src/config/multer.js` (45 lines)
**Purpose:** Configure file upload handling with Multer
- **File Validation:**
  - MIME types: image/jpeg, image/png, image/gif
  - Max size: 5MB
  - Storage: Local filesystem
- **Filename Format:** `product-{timestamp}-${random}.{extension}`

**Key Exports:** `multerUpload` middleware

#### `backend/src/utils/jwt.js` (40 lines)
**Purpose:** JWT token management functions
- `generateToken(id, role)` - Create new token
- `verifyToken(token)` - Validate and decode token
- `decodeToken(token)` - Extract token payload
- **Token Payload:**
  ```json
  {
    "id": 1,
    "role": "CUSTOMER",
    "iat": 1234567890,
    "exp": 1234654290
  }
  ```

#### `backend/src/utils/password.js` (35 lines)
**Purpose:** Password hashing and comparison
- `hashPassword(password)` - Hash with bcrypt (10 salt rounds)
- `comparePassword(password, hash)` - Verify password
- Async functions using Promise-based API

#### `backend/src/middleware/auth.js` (50 lines)
**Purpose:** Authentication and authorization
- `authMiddleware()` - Verify JWT token
- `authorizeRole(...roles)` - Check user has required role
- **Response (401):** No token provided
- **Response (403):** Insufficient permissions

#### `backend/src/controllers/authController.js` (150 lines)
**Purpose:** Handle authentication logic
- **Functions:**
  - `register()` - Create new user account
  - `login()` - Authenticate and return token
  - `getCurrentUser()` - Get logged-in user details
  - `updateProfile()` - Update user information
- **Validation:** email format, password length, phone format

#### `backend/src/controllers/productController.js` (250 lines)
**Purpose:** Product management
- **Functions:**
  - `createProduct()` - Add product (farmers only)
  - `getAllProducts()` - List with filters/pagination
  - `getProductById()` - Get single product details
  - `updateProduct()` - Modify product (farmer only)
  - `deleteProduct()` - Remove product (farmer only)
  - `getFarmerProducts()` - Get farmer's products
- **Filters:** category, price range, search term, pagination

#### `backend/src/controllers/cartController.js` (200 lines)
**Purpose:** Shopping cart operations
- **Functions:**
  - `getCart()` - Get user's cart items
  - `addToCart()` - Add product with quantity
  - `updateCartItem()` - Change item quantity
  - `removeFromCart()` - Delete item from cart
  - `clearCart()` - Empty entire cart
- **Validations:**
  - Product existence
  - Stock availability
  - Quantity constraints
  - Unique constraint (one entry per product per customer)

#### `backend/src/controllers/orderController.js` (300 lines)
**Purpose:** Order management
- **Functions:**
  - `createOrder()` - Place order from cart
  - `getCustomerOrders()` - Get user's orders
  - `getFarmerOrders()` - Get orders for farmer's products
  - `getOrderById()` - Get order details
  - `updateOrderStatus()` - Farmer updates order status
  - `generateOrderNumber()` - Create unique order ID
- **Status Flow:** PENDING → ACCEPTED/REJECTED → SHIPPED → DELIVERED
- **Process:**
  1. Fetch cart items
  2. Verify stock
  3. Create order with OrderItems
  4. Store price at order time
  5. Decrement product quantity
  6. Clear cart

#### `backend/src/controllers/reviewController.js` (150 lines)
**Purpose:** Product reviews and ratings
- **Functions:**
  - `addReview()` - Add new review (customers only)
  - `updateReview()` - Modify existing review
  - `deleteReview()` - Remove review
  - `getProductReviews()` - List product reviews
  - `getCustomerReview()` - Get customer's review for product
  - Auto-calculates product rating after review changes
- **Constraints:** One review per product per customer

#### `backend/src/controllers/adminController.js` (200 lines)
**Purpose:** Administrative functions
- **Functions:**
  - `getAllUsers()` - List all users with filtering
  - `deactivateUser()` - Deactivate account (admin only)
  - `activateUser()` - Reactivate account (admin only)
  - `getAllProducts()` - View all products
  - `getAllOrders()` - View all orders
  - `getDashboardStats()` - Get platform statistics
- **Statistics Include:**
  - Total users, products, orders, revenue
  - Distribution by role and status
  - Pagination support

#### `backend/src/routes/authRoutes.js` (25 lines)
**Endpoints:**
```
POST   /api/auth/register        - Register new user
POST   /api/auth/login           - Login user
GET    /api/auth/me              - Get current user (protected)
PUT    /api/auth/profile         - Update profile (protected)
```

#### `backend/src/routes/productRoutes.js` (35 lines)
**Endpoints:**
```
GET    /api/products             - Get all products (public)
GET    /api/products/:id         - Get product by ID (public)
GET    /api/products/farmer/:id  - Get farmer's products (public)
POST   /api/products             - Create product (farmer, file upload)
PUT    /api/products/:id         - Update product (farmer)
DELETE /api/products/:id         - Delete product (farmer)
```

#### `backend/src/routes/cartRoutes.js` (25 lines)
**Endpoints:**
```
GET    /api/cart                 - Get cart (customer)
POST   /api/cart                 - Add to cart (customer)
PUT    /api/cart/:id             - Update cart item (customer)
DELETE /api/cart/:id             - Remove from cart (customer)
DELETE /api/cart/clear           - Clear cart (customer)
```

#### `backend/src/routes/orderRoutes.js` (30 lines)
**Endpoints:**
```
POST   /api/orders               - Create order (customer)
GET    /api/orders/customer      - Get customer's orders (customer)
GET    /api/orders/farmer        - Get farmer's orders (farmer)
GET    /api/orders/:id           - Get order details (protected)
PUT    /api/orders/:id/status    - Update status (farmer)
```

#### `backend/src/routes/reviewRoutes.js` (25 lines)
**Endpoints:**
```
POST   /api/reviews              - Add review (customer)
GET    /api/reviews/product/:id  - Get product reviews (public)
GET    /api/reviews/customer/:id - Get customer review (protected)
PUT    /api/reviews/:id          - Update review (customer)
DELETE /api/reviews/:id          - Delete review (customer)
```

#### `backend/src/routes/adminRoutes.js` (30 lines)
**Endpoints:** (All admin-protected)
```
GET    /api/admin/users          - List users with filters
PUT    /api/admin/users/:id/deactivate  - Deactivate user
PUT    /api/admin/users/:id/activate    - Activate user
GET    /api/admin/products       - List all products
GET    /api/admin/orders         - List all orders
GET    /api/admin/stats          - Get statistics
```

#### `backend/prisma/schema.prisma` (200 lines)
**Database Models:**

1. **User** (13 fields)
   - id, email (unique), password, fullName, phone, address
   - role (FARMER/CUSTOMER/ADMIN), profileImage, isActive
   - createdAt, updatedAt
   - Relations: products, orders, reviews, cartItems

2. **Product** (13 fields)
   - id, farmerId, name, category, description, price, quantity, unit
   - harvestDate, isOrganic, images (JSON), rating, totalReviews, isActive
   - Relations to: Farmer (User), reviews, orderItems, cartItems

3. **Review** (7 fields)
   - id, productId, customerId, rating (1-5), comment
   - createdAt, updatedAt
   - Unique constraint: (productId, customerId)

4. **CartItem** (5 fields)
   - id, customerId, productId, quantity, addedAt
   - Unique constraint: (customerId, productId)

5. **Order** (10 fields)
   - id, customerId, totalPrice, status, paymentMethod
   - paymentStatus, deliveryAddress, orderNumber (unique)
   - createdAt, updatedAt

6. **OrderItem** (5 fields)
   - id, orderId, productId, quantity, priceAtOrder

7. **Enums:**
   - Role: FARMER, CUSTOMER, ADMIN
   - OrderStatus: PENDING, ACCEPTED, REJECTED, SHIPPED, DELIVERED
   - PaymentMethod: COD, ONLINE
   - PaymentStatus: PENDING, COMPLETED, FAILED

#### `backend/.env.example`
Template for environment variables:
```env
NODE_ENV=development
PORT=5000
DATABASE_URL=mysql://root:password@localhost:3306/farmersDB
JWT_SECRET=your_secret_key_minimum_32_chars_recommended
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
MAX_FILE_SIZE=5242880
UPLOAD_PATH=/uploads
```

#### `backend/package.json`
**Key Dependencies:**
- express 4.18.2 - Web framework
- prisma 5.0.0 - ORM
- jsonwebtoken 9.0.0 - JWT tokens
- bcryptjs 2.4.3 - Password hashing
- multer 1.4.5 - File uploads
- cors 2.8.5 - Cross-origin requests
- dotenv 16.0.3 - Environment variables
- express-validator 7.0.0 - Input validation

---

### Frontend - Core Files

#### `frontend/src/App.js` (100 lines)
**Purpose:** Main React app component
- **Features:**
  - BrowserRouter setup
  - Protected routes with role-based access
  - Route definitions for all pages
  - Toaster for notifications
  - AuthProvider wrapper
- **Protected Routes Require:**
  - Authentication (valid token)
  - Correct role (CUSTOMER/FARMER/ADMIN)

#### `frontend/src/index.js` (10 lines)
**Purpose:** React DOM entry point
- Renders App inside AuthProvider
- Mounts on root element

#### `frontend/src/index.css` (70 lines)
**Purpose:** Global styles with Tailwind
- Tailwind directives
- Custom component classes:
  - `.btn-primary` - Green button
  - `.btn-secondary` - Amber button
  - `.btn-outline` - Outlined button
  - `.card` - Card styling
  - `.container-main` - Main container padding

#### `frontend/src/context/AuthContext.js` (120 lines)
**Purpose:** Global authentication state
- **State:**
  - `user` - Current logged-in user
  - `token` - JWT token
  - `loading` - Loading indicator
  - `isAuthenticated` - Boolean auth status
- **Functions:**
  - `register(formData)` - Sign up
  - `login(email, password)` - Sign in
  - `logout()` - Sign out
  - `updateProfile(data)` - Update user info
- **Persistence:** localStorage for token and user

#### `frontend/src/services/api.js` (150 lines)
**Purpose:** API client with endpoints
- **Axios Instance:** With interceptors
  - Auto-adds token to requests
  - Redirects on 401 error
- **Endpoints organized by feature:**
  - authAPI - Register, login, profile
  - productAPI - Create, read, update, delete
  - cartAPI - Manage shopping cart
  - orderAPI - Create and track orders
  - reviewAPI - Write and read reviews
  - adminAPI - Administrative functions

#### `frontend/src/components/Navbar.js` (120 lines)
**Purpose:** Navigation header
- **Features:**
  - Responsive design (hamburger menu)
  - Links conditional on auth/role
  - Cart link for customers
  - Dashboard link with role routing
  - Logout button
- **Roles Visibility:**
  - Guest: Home, Products, Login, Register
  - Customer: Products, Cart, Dashboard, Logout
  - Farmer: Products, Dashboard, Logout
  - Admin: Dashboard, Logout

#### `frontend/src/components/Footer.js` (100 lines)
**Purpose:** Footer component
- **Sections:**
  - Company info
  - Quick links
  - Categories
  - Social media

#### `frontend/src/pages/Home.js` (120 lines)
**Purpose:** Landing page
- **Sections:**
  - Hero section with CTA
  - Features (4 key benefits)
  - Call-to-action for farmers
  - Statistics section

#### `frontend/src/pages/Login.js` (80 lines)
**Purpose:** User login
- Email/password form
- Form validation
- Links to register
- Error handling with toast

#### `frontend/src/pages/Register.js` (110 lines)
**Purpose:** User sign up
- Full name, email, phone, password
- Role selection (CUSTOMER/FARMER)
- Password validation (min 6 chars)
- Role-specific signup paths

#### `frontend/src/pages/Products.js` (200 lines)
**Purpose:** Product listing and discovery
- **Features:**
  - Product grid layout
  - Category filtering (sidebar)
  - Search functionality
  - Pagination (12 items per page)
  - Product cards with:
    - Image
    - Name, rating, reviews count
    - Description, price, unit
    - Stock status badge
    - Link to detail page

#### `frontend/src/pages/ProductDetail.js` (320 lines)
**Purpose:** Single product view
- **Sections:**
  - Image gallery
  - Product info (name, category, price, stock)
  - Farmer details card
  - Product attributes
  - Quantity selector with +/- buttons
  - Add to cart button (customers only)
  - Reviews section
  - Customer review form with 5-star rating
  - Review list with ratings

#### `frontend/src/pages/Cart.js` (220 lines)
**Purpose:** Shopping cart
- **Features:**
  - Cart items list with images
  - Quantity controls (+/- buttons)
  - Item subtotals
  - Remove item buttons
  - Clear cart option
  - Right sidebar with:
    - Order summary
    - Subtotal, shipping, tax
    - Total price
  - "Proceed to Checkout" button
  - Empty state with icon

#### `frontend/src/pages/Checkout.js` (180 lines)
**Purpose:** Order placement
- **Form Fields:**
  - Delivery address (textarea)
  - Payment method (COD/ONLINE radio)
  - Demo payment note
- **Sidebar:**
  - Order summary
  - Delivery address confirmation
  - Payment method display
- **Action:** Place order button

#### `frontend/src/pages/CustomerDashboard.js` (200 lines)
**Purpose:** Customer order history
- **Features:**
  - Status filtering buttons
    - All, PENDING, ACCEPTED, SHIPPED, DELIVERED, REJECTED
  - Order cards showing:
    - Order number, total price, date
    - Status badge with color
    - Line items with quantity/price
    - Delivery address
    - Payment status
  - Loading spinner
  - Empty state

#### `frontend/src/pages/FarmerDashboard.js` (400 lines)
**Purpose:** Farmer management interface
- **Two Tabs:**
  - **Orders Tab:**
    - List of farmer's orders
    - Action dropdown for status updates
    - Item details and customer info
  - **Products Tab:**
    - "Add New Product" button
    - Collapsible form with fields:
      - Name, category, description
      - Price, quantity, unit
      - Harvest date, organic checkbox
      - Image upload
    - Product grid with edit/delete buttons
    - Success/error toast notifications

#### `frontend/src/pages/AdminDashboard.js` (450 lines)
**Purpose:** Admin control panel
- **Four Tabs:**
  1. **Statistics Tab:**
     - 4 metric cards (users, products, orders, revenue)
     - Icons and progress bars
     - Order status distribution chart
     - User role distribution chart
  2. **Users Tab:**
     - Searchable/filterable user table
     - Columns: name, email, role, active status
     - Deactivate/activate buttons
  3. **Products Tab:**
     - Product grid view
     - Search and filter options
  4. **Orders Tab:**
     - Order table with columns:
     - Order number, customer, amount
     - Item count, status
     - Filtering options

#### `frontend/.env.example`
```env
REACT_APP_API_URL=http://localhost:5000
```

#### `frontend/tailwind.config.js`
**Configuration:**
- Colors:
  - Primary: #10b981 (green)
  - Secondary: #f59e0b (amber)
  - Dark: #1f2937
- Content paths configured for JSX files

#### `frontend/postcss.config.js`
**Plugins:**
- tailwindcss
- autoprefixer

#### `frontend/package.json`
**Key Dependencies:**
- react 18.2.0
- react-dom 18.2.0
- react-router-dom 6.8.0 - Routing
- axios 1.3.2 - HTTP client
- tailwindcss 3.2.4 - Styling
- react-hot-toast 2.4.0 - Notifications
- react-icons 4.7.1 - Icons

---

### Documentation Files

#### `SETUP_GUIDE.md` (450 lines)
**Sections:**
1. Prerequisites validation
2. MySQL setup
3. Backend installation and configuration
4. Prisma database migrations
5. Frontend setup
6. Running both servers
7. API overview
8. Testing workflows with sample accounts
9. Folder structure reference
10. Common issues and solutions
11. Next steps for customization

#### `API_DOCUMENTATION.md` (600 lines)
**Contents:**
- All 6 endpoint groups (Auth, Products, Cart, Orders, Reviews, Admin)
- 52+ total endpoints documented
- Request/response examples in JSON
- Query parameters documentation
- Error response examples
- cURL testing examples
- Role-based access matrix
- HTTP status codes reference

#### `DATABASE_SCHEMA.md` (300 lines)
**Contents:**
- Entity Relationship Diagram
- Detailed table descriptions
- Column specifications
- Indexes and constraints
- Data relationships
- Enum definitions
- Design decision explanations
- Query examples
- Migration instructions
- Best practices

#### `TESTING_GUIDE.md` (500 lines)
**Contents:**
- Setup for testing
- Test accounts (admin, farmers, customers)
- API testing with cURL examples
- Frontend testing workflows
- End-to-end scenarios
- Postman collection structure
- Error scenario testing
- Performance testing
- Security testing

#### `DEPLOYMENT_GUIDE.md` (700 lines)
**Contents:**
- Pre-deployment checklist
- Backend deployment (Heroku, AWS EC2, DigitalOcean)
- Frontend deployment (Vercel, Netlify, AWS S3)
- Database setup (RDS, DigitalOcean)
- Environment configuration
- SSL/HTTPS setup
- Monitoring and maintenance
- Backup and recovery
- Performance optimization
- Security hardening
- Troubleshooting deployment
- Rollback procedures

#### `TROUBLESHOOTING.md` (400 lines)
**Contents:**
- Installation issues
- Database connection issues
- Backend startup problems
- Frontend rendering issues
- API errors (404, 401, 403, 500)
- Authentication problems
- File upload issues
- Deployment issues
- Common error messages table
- Debugging steps

#### `README.md` (400 lines)
**Contents:**
- Project overview
- Key features (11 customer, 7 farmer, 4 admin)
- Technology stack
- Quick start guide
- Folder structure overview
- Database schema summary
- API overview
- User roles and permissions
- Development setup
- Deployment guidelines
- Performance features
- Security features
- Future enhancements

#### `SAMPLE_DATA.sql` (150 lines)
**Data Included:**
- 5 test users (1 admin, 2 farmers, 2 customers)
- 8 products with images and details
- 4 reviews with ratings
- 2 orders with items
- Documentation of test credentials

#### `.gitignore`
**Ignores:**
- node_modules/
- .env (environment variables)
- .env.local
- build/
- dist/
- uploads/
- *.log
- .DS_Store (macOS)
- .vscode/ (IDE settings)

---

## File Statistics

### Backend
- **Total Files:** 20+
- **Total Lines:** 2000+
- **Controller Files:** 6 (~1000 lines)
- **Route Files:** 6 (~300 lines)
- **Config Files:** 2 (~75 lines)
- **Utility Files:** 2 (~75 lines)
- **Middleware Files:** 1 (~50 lines)
- **Database Schema:** 1 (~200 lines)

### Frontend
- **Total Files:** 21+
- **Total Lines:** 2500+
- **Page Components:** 9 (~2000 lines)
- **Layout Components:** 2 (~220 lines)
- **Context/Services:** 2 (~270 lines)
- **Configuration Files:** 3 (~100 lines)

### Documentation
- **Total Files:** 8
- **Total Lines:** 3000+
- **SETUP_GUIDE.md:** 450 lines
- **API_DOCUMENTATION.md:** 600 lines
- **DATABASE_SCHEMA.md:** 300 lines
- **TESTING_GUIDE.md:** 500 lines
- **DEPLOYMENT_GUIDE.md:** 700 lines
- **TROUBLESHOOTING.md:** 400 lines
- **PROJECT_STRUCTURE.md:** 300 lines (this file)
- **README.md:** 400 lines

### Total Project
- **Code Files:** 40+
- **Documentation Files:** 8
- **Configuration Files:** 10+
- **Total Lines of Code:** 4500+
- **Total Documentation:** 3000+ lines

---

## Dependencies Summary

### Backend (package.json)

**Framework & Server:**
- express 4.18.2

**Database & ORM:**
- @prisma/client 5.0.0
- prisma 5.0.0

**Security:**
- jsonwebtoken 9.0.0
- bcryptjs 2.4.3

**File Upload:**
- multer 1.4.5

**Validation:**
- express-validator 7.0.0

**Utilities:**
- cors 2.8.5
- dotenv 16.0.3

### Frontend (package.json)

**React & Routing:**
- react 18.2.0
- react-dom 18.2.0
- react-router-dom 6.8.0

**HTTP Client:**
- axios 1.3.2

**Styling:**
- tailwindcss 3.2.4
- postcss 8.4.24
- autoprefixer 10.4.14

**UI Components:**
- react-hot-toast 2.4.0
- react-icons 4.7.1

---

## Database Schema Quick Reference

| Table | Rows | Purpose |
|-------|------|---------|
| users | 6 | Store users (farmers, customers, admins) |
| products | 8 | Product listings by farmers |
| reviews | 4 | Customer product reviews and ratings |
| orders | 2 | Customer orders |
| order_items | 3+ | Items within each order |
| cart_items | Variable | Shopping cart items |

---

## Environment Variables Summary

### Backend `.env`
```
NODE_ENV = production/development
PORT = 5000 (default)
DATABASE_URL = mysql://user:pass@host:port/db
JWT_SECRET = (32+ char random string)
JWT_EXPIRE = 7d (default)
FRONTEND_URL = https://frontend-domain.com
MAX_FILE_SIZE = 5242880 (5MB)
UPLOAD_PATH = /uploads
```

### Frontend `.env`
```
REACT_APP_API_URL = https://api-domain.com
```

---

## Deployment Targets

### Backend
- ✅ Heroku (PaaS)
- ✅ AWS EC2 (VPS)
- ✅ DigitalOcean (VPS)
- ✅ Self-hosted (VPS)

### Frontend
- ✅ Vercel (Recommended)
- ✅ Netlify
- ✅ AWS S3 + CloudFront
- ✅ GitHub Pages

### Database
- ✅ AWS RDS (Managed)
- ✅ DigitalOcean Database (Managed)
- ✅ Self-hosted MySQL
- ✅ Google Cloud SQL

---

## API Endpoints Overview

### Auth Routes (5 endpoints)
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me
- PUT /api/auth/profile

### Products Routes (6 endpoints)
- GET /api/products
- GET /api/products/:id
- GET /api/products/farmer/:id
- POST /api/products
- PUT /api/products/:id
- DELETE /api/products/:id

### Cart Routes (5 endpoints)
- GET /api/cart
- POST /api/cart
- PUT /api/cart/:id
- DELETE /api/cart/:id
- DELETE /api/cart/clear

### Orders Routes (5 endpoints)
- POST /api/orders
- GET /api/orders/customer
- GET /api/orders/farmer
- GET /api/orders/:id
- PUT /api/orders/:id/status

### Reviews Routes (5 endpoints)
- POST /api/reviews
- GET /api/reviews/product/:id
- GET /api/reviews/customer/:id
- PUT /api/reviews/:id
- DELETE /api/reviews/:id

### Admin Routes (6 endpoints)
- GET /api/admin/users
- PUT /api/admin/users/:id/deactivate
- PUT /api/admin/users/:id/activate
- GET /api/admin/products
- GET /api/admin/orders
- GET /api/admin/stats

**Total: 32 API endpoints**

---

## Getting Started Paths

### For Development
1. Read: SETUP_GUIDE.md
2. Run: `npm install` in both folders
3. Configure: `.env` files
4. Launch: `npm run dev` (backend) + `npm start` (frontend)
5. Test: Use TESTING_GUIDE.md

### For Production
1. Read: DEPLOYMENT_GUIDE.md
2. Choose: Hosting platform
3. Configure: Environment variables
4. Deploy: Using platform-specific instructions
5. Monitor: Using monitoring guide

### For API Integration
1. Read: API_DOCUMENTATION.md
2. Check: SAMPLE_DATA.sql for test data
3. Test: Using TESTING_GUIDE.md
4. Implement: Using request/response examples

### For Database Work
1. Read: DATABASE_SCHEMA.md
2. Understand: Entity relationships
3. Reference: Query examples
4. Migrate: Using Prisma commands

### For Troubleshooting
1. Reference: TROUBLESHOOTING.md
2. Check: Logs and console
3. Verify: Configuration files
4. Test: Using examples from guides

---

## Quick Command Reference

### Backend
```bash
cd backend

# Installation
npm install

# Development
npm run dev

# Database
npx prisma migrate dev
npx prisma studio
npx prisma migrate reset

# Production
npm run build
npm start
```

### Frontend
```bash
cd frontend

# Installation
npm install

# Development
npm start

# Production build
npm run build

# Test build
npm run build && npm start
```

### Database
```bash
# Connect to MySQL
mysql -u root -p

# Backup
mysqldump -u root -p dbname > backup.sql

# Restore
mysql -u root -p dbname < backup.sql

# Prisma
npx prisma migrate dev --name migration_name
npx prisma studio
npx prisma db seed
```

---

End of Project Structure & File Guide

**For detailed information about any file, refer to the specific documentation files mentioned above.**
