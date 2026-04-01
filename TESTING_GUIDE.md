# Testing Guide

Complete testing procedures for the Farmer to Customer Marketplace application.

---

## Table of Contents

1. [Setup for Testing](#setup-for-testing)
2. [Test Accounts](#test-accounts)
3. [API Testing](#api-testing)
4. [Frontend Testing](#frontend-testing)
5. [End-to-End Scenarios](#end-to-end-scenarios)
6. [Postman Collection](#postman-collection)

---

## Setup for Testing

### Prerequisites
- MySQL database populated with SAMPLE_DATA.sql
- Backend running on `http://localhost:5000`
- Frontend running on `http://localhost:3000`
- Postman or cURL installed

### Load Sample Data
```bash
mysql -u root -p farmersDB < SAMPLE_DATA.sql
```

### Start Servers (Two Terminals)

**Terminal 1 - Backend:**
```bash
cd backend
npm install
npx prisma migrate dev --name init
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm start
```

---

## Test Accounts

### Admin Account
```
Email:    admin@farmersdb.com
Password: Admin@123
Role:     ADMIN
```

### Farmer Accounts
```
Email:    farmer1@example.com
Password: Farmer@123
Role:     FARMER
Products: 4 products (Tomatoes, Carrots, Wheat, Milk)

Email:    farmer2@example.com
Password: Farmer@123
Role:     FARMER
Products: 4 products (Oranges, Potatoes, Rice, Cheese)
```

### Customer Accounts
```
Email:    customer1@example.com
Password: Customer@123
Role:     CUSTOMER
HasOrders: No

Email:    customer2@example.com
Password: Customer@123
Role:     CUSTOMER
HasOrders: Yes (ORD-1711270000000-ABC123, ORD-1711271000000-XYZ789)
```

---

## API Testing

### 1. Authentication Tests

#### Test 1.1: User Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "testuser@example.com",
    "password": "TestPass@123",
    "phone": "9876543210",
    "role": "CUSTOMER"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 6,
      "fullName": "Test User",
      "email": "testuser@example.com",
      "role": "CUSTOMER"
    },
    "token": "eyJhbGc..."
  }
}
```

#### Test 1.2: User Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "farmer1@example.com",
    "password": "Farmer@123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 2,
      "fullName": "Rajesh Sharma",
      "email": "farmer1@example.com",
      "role": "FARMER"
    },
    "token": "eyJhbGc..."
  }
}
```

#### Test 1.3: Get Current User (Protected)
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <TOKEN>"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 2,
      "fullName": "Rajesh Sharma",
      "email": "farmer1@example.com",
      "role": "FARMER",
      "phone": "9876543210",
      "address": "123 Farm Lane, Punjab"
    }
  }
}
```

#### Test 1.4: Update Profile (Protected)
```bash
curl -X PUT http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Rajesh Sharma Updated",
    "phone": "9999999999",
    "address": "New address"
  }'
```

---

### 2. Product Tests

#### Test 2.1: Get All Products (Public)
```bash
curl -X GET "http://localhost:5000/api/products?category=vegetables&page=1"
```

**Query Parameters:**
- `category` - Filter by category (fruits, vegetables, grains, dairy)
- `minPrice` - Minimum price filter
- `maxPrice` - Maximum price filter
- `search` - Search by product name
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 12)

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": 1,
        "name": "Fresh Tomatoes",
        "category": "vegetables",
        "price": 45.00,
        "quantity": 150,
        "rating": 4.5,
        "totalReviews": 2,
        "farmer": {
          "id": 2,
          "fullName": "Rajesh Sharma"
        }
      }
    ],
    "totalPages": 2
  }
}
```

#### Test 2.2: Get Product by ID (Public)
```bash
curl -X GET http://localhost:5000/api/products/1
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "product": {
      "id": 1,
      "name": "Fresh Tomatoes",
      "category": "vegetables",
      "description": "Fresh, organic red tomatoes...",
      "price": 45.00,
      "quantity": 150,
      "unit": "kg",
      "isOrganic": true,
      "rating": 4.5,
      "totalReviews": 2,
      "images": ["uploads/tom1.jpg"],
      "farmer": {
        "id": 2,
        "fullName": "Rajesh Sharma",
        "email": "farmer1@example.com"
      }
    }
  }
}
```

#### Test 2.3: Create Product (Farmer Only)
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Authorization: Bearer <FARMER_TOKEN>" \
  -F "name=Organic Cucumbers" \
  -F "category=vegetables" \
  -F "description=Fresh green cucumbers" \
  -F "price=30" \
  -F "quantity=200" \
  -F "unit=kg" \
  -F "isOrganic=true" \
  -F "file=@/path/to/image.jpg"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "product": {
      "id": 9,
      "name": "Organic Cucumbers",
      "farmerId": 2,
      "category": "vegetables"
    }
  }
}
```

#### Test 2.4: Update Product (Farmer Only)
```bash
curl -X PUT http://localhost:5000/api/products/9 \
  -H "Authorization: Bearer <FARMER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "price": 35,
    "quantity": 180
  }'
```

#### Test 2.5: Delete Product (Farmer Only)
```bash
curl -X DELETE http://localhost:5000/api/products/9 \
  -H "Authorization: Bearer <FARMER_TOKEN>"
```

#### Test 2.6: Get Farmer's Products
```bash
curl -X GET "http://localhost:5000/api/products/farmer/2"
```

---

### 3. Cart Tests

#### Test 3.1: Get Cart (Customer Only)
```bash
curl -X GET http://localhost:5000/api/cart \
  -H "Authorization: Bearer <CUSTOMER_TOKEN>"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "cart": [
      {
        "id": 1,
        "customerId": 5,
        "product": {
          "id": 1,
          "name": "Fresh Tomatoes",
          "price": 45.00,
          "quantity": 150,
          "images": ["uploads/tom1.jpg"]
        },
        "quantity": 2
      }
    ]
  }
}
```

#### Test 3.2: Add to Cart (Customer Only)
```bash
curl -X POST http://localhost:5000/api/cart \
  -H "Authorization: Bearer <CUSTOMER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": 1,
    "quantity": 3
  }'
```

**Validation Checks:**
- ✅ Product exists
- ✅ Product quantity >= requested quantity
- ✅ Requested quantity > 0
- ✅ Only CUSTOMER role allowed

#### Test 3.3: Update Cart Item
```bash
curl -X PUT http://localhost:5000/api/cart/1 \
  -H "Authorization: Bearer <CUSTOMER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "quantity": 5
  }'
```

#### Test 3.4: Remove from Cart
```bash
curl -X DELETE http://localhost:5000/api/cart/1 \
  -H "Authorization: Bearer <CUSTOMER_TOKEN>"
```

#### Test 3.5: Clear Cart
```bash
curl -X DELETE http://localhost:5000/api/cart/clear \
  -H "Authorization: Bearer <CUSTOMER_TOKEN>"
```

---

### 4. Order Tests

#### Test 4.1: Create Order (Customer Only)
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer <CUSTOMER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "paymentMethod": "COD",
    "deliveryAddress": "Main Road, City"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "order": {
      "id": 3,
      "orderNumber": "ORD-1711272000000-DEF456",
      "status": "PENDING",
      "totalPrice": 270.00,
      "paymentMethod": "COD",
      "paymentStatus": "PENDING"
    }
  }
}
```

**Process Validation:**
1. Get items from customer's cart
2. Check product quantity for each item
3. Create order with PENDING status
4. Create OrderItems with priceAtOrder
5. Decrement product quantity
6. Clear customer's cart

#### Test 4.2: Get Customer Orders
```bash
curl -X GET http://localhost:5000/api/orders/customer \
  -H "Authorization: Bearer <CUSTOMER_TOKEN>"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": 1,
        "orderNumber": "ORD-1711270000000-ABC123",
        "totalPrice": 225.00,
        "status": "PENDING",
        "items": [
          {
            "id": 1,
            "productName": "Fresh Tomatoes",
            "quantity": 3,
            "priceAtOrder": 45.00
          }
        ]
      }
    ]
  }
}
```

#### Test 4.3: Get Farmer Orders
```bash
curl -X GET http://localhost:5000/api/orders/farmer \
  -H "Authorization: Bearer <FARMER_TOKEN>"
```

**Returns:** Orders containing items from farmer's products

#### Test 4.4: Update Order Status (Farmer Only)
```bash
curl -X PUT http://localhost:5000/api/orders/1/status \
  -H "Authorization: Bearer <FARMER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "ACCEPTED"
  }'
```

**Valid Status Values:**
- PENDING → ACCEPTED / REJECTED
- ACCEPTED → SHIPPED
- SHIPPED → DELIVERED
- REJECTED (terminal state)
- DELIVERED (terminal state)

#### Test 4.5: Get Order by ID
```bash
curl -X GET http://localhost:5000/api/orders/1 \
  -H "Authorization: Bearer <TOKEN>"
```

---

### 5. Review Tests

#### Test 5.1: Add Review (Customer Only)
```bash
curl -X POST http://localhost:5000/api/reviews \
  -H "Authorization: Bearer <CUSTOMER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": 1,
    "rating": 5,
    "comment": "Excellent quality tomatoes!"
  }'
```

**Constraints:**
- Only customers can review
- One review per product per customer
- Rating must be 1-5
- Product must exist

#### Test 5.2: Get Product Reviews (Public)
```bash
curl -X GET http://localhost:5000/api/reviews/product/1
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": 1,
        "rating": 5,
        "comment": "Excellent quality tomatoes!",
        "customer": {
          "fullName": "Priya Singh"
        },
        "createdAt": "2024-03-24T10:30:00Z"
      }
    ]
  }
}
```

#### Test 5.3: Update Review
```bash
curl -X PUT http://localhost:5000/api/reviews/1 \
  -H "Authorization: Bearer <CUSTOMER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 4,
    "comment": "Updated comment"
  }'
```

#### Test 5.4: Delete Review
```bash
curl -X DELETE http://localhost:5000/api/reviews/1 \
  -H "Authorization: Bearer <CUSTOMER_TOKEN>"
```

---

### 6. Admin Tests

#### Test 6.1: Get All Users (Admin Only)
```bash
curl -X GET "http://localhost:5000/api/admin/users?role=FARMER&page=1" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

**Query Parameters:**
- `role` - Filter by FARMER, CUSTOMER, ADMIN
- `page` - Page number
- `limit` - Items per page
- `search` - Search by name/email

#### Test 6.2: Deactivate User
```bash
curl -X PUT http://localhost:5000/api/admin/users/3/deactivate \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

#### Test 6.3: Activate User
```bash
curl -X PUT http://localhost:5000/api/admin/users/3/activate \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

#### Test 6.4: Get Dashboard Statistics
```bash
curl -X GET http://localhost:5000/api/admin/stats \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalUsers": 6,
      "totalProducts": 8,
      "totalOrders": 2,
      "totalRevenue": 450.00,
      "usersByRole": {
        "FARMER": 2,
        "CUSTOMER": 2,
        "ADMIN": 1
      },
      "ordersByStatus": {
        "PENDING": 1,
        "DELIVERED": 1,
        "REJECTED": 0
      }
    }
  }
}
```

---

## Frontend Testing

### Test User Flows

#### 1. Customer Journey
1. **Visit Homepage** → See all products, benefits, featured products
2. **Browse Products** → Filter by category, search, view details
3. **View Product Details** → See images, reviews, farmer info, rating
4. **Add to Cart** → Add product with quantity validation
5. **View Cart** → Modify quantities, remove items
6. **Checkout** → Enter delivery address, select payment method
7. **View Order History** → See all orders with status updates
8. **Leave Review** → Rate product, write comment
9. **View Dashboard** → Track orders in real-time

#### 2. Farmer Journey
1. **Login as Farmer** → Dashboard appears in navbar
2. **View Farmer Dashboard** → See two tabs: Orders and Products
3. **Manage Orders** → View incoming orders, update status (ACCEPT/REJECT)
4. **Create Product** → Fill form, upload image, submit
5. **Edit Product** → Update price, quantity, description
6. **Delete Product** → Remove from marketplace
7. **View Sales** → See orders containing their products

#### 3. Admin Journey
1. **Login as Admin** → Admin Dashboard appears in navbar
2. **View Statistics** → See total users, products, orders, revenue
3. **Manage Users** → Search, filter, activate/deactivate accounts
4. **View Products** → Browse all products in marketplace
5. **View Orders** → See all customer orders with status

### Frontend Validation Tests

**Test Case:** Add out-of-stock product to cart
```
1. Product with quantity=0
2. Try to add to cart
3. Expected: Error toast "Product out of stock"
```

**Test Case:** Cart quantity exceeds stock
```
1. Product with quantity=10
2. Add 5 to cart
3. Try to increase to 15
4. Expected: Error toast "Not enough stock available"
```

**Test Case:** Empty cart checkout
```
1. Empty cart
2. Click checkout
3. Expected: Toast "Your cart is empty"
```

**Test Case:** Unauthorized access
```
1. Not logged in
2. Try to visit /cart
3. Expected: Redirect to /login
```

**Test Case:** Role-based access
```
1. Login as customer
2. Try to access /farmer-dashboard
3. Expected: 403 error or redirect to home
```

---

## End-to-End Scenarios

### Scenario 1: Complete Purchase Flow

**Actors:** Customer, Farmer, Admin

1. **Customer browses products**
   - Navigate to Products page
   - Filter by vegetables
   - Click on "Fresh Tomatoes"
   - View details and reviews

2. **Customer adds to cart**
   - Quantity: 3 kg
   - Click "Add to Cart"
   - See success toast

3. **Customer adds more items**
   - Browse more products
   - Add "Fresh Carrots" (2 kg)
   - Add "Organic Milk" (1 litre)

4. **Customer checks out**
   - Go to cart (should have 3 items)
   - Click "Proceed to Checkout"
   - Enter delivery address: "123 Main St, Mumbai"
   - Select payment: "Cash on Delivery"
   - Place Order

5. **Farmer receives order**
   - Login as farmer (farmer1@example.com)
   - Go to Farmer Dashboard
   - See new order in "Orders" tab
   - Order contains: 3 kg Tomatoes, 2 kg Carrots
   - Update status: ACCEPTED → SHIPPED → DELIVERED

6. **Customer tracks order**
   - Go to Dashboard
   - See order status updates in real-time
   - After delivery, write review

7. **Admin monitors**
   - Login as admin
   - Dashboard shows:
     - New order added to "totalOrders"
     - Revenue increased
     - Order status distribution updated

### Scenario 2: Product Lifecycle Management

**Actors:** Farmer, Admin

1. **Farmer creates product**
   - Login as farmer
   - Go to Products tab
   - Click "Add New Product"
   - Fill details: "Organic Beans", vegetables, ₹50/kg, 100 kg
   - Upload image
   - Submit
   - See success notification

2. **Product appears in marketplace**
   - Go to home
   - Search "Organic Beans"
   - Verify it appears in results
   - Click and view details

3. **Farmer updates product**
   - Go to Farmer Dashboard
   - Click Edit on "Organic Beans"
   - Update price to ₹55/kg
   - Save changes

4. **Farmer deletes product**
   - Go to Farmer Dashboard
   - Click Delete on "Organic Beans"
   - Confirm deletion
   - Product vanishes from marketplace

### Scenario 3: Review and Rating System

**Actors:** Customer 1, Customer 2, Farmer

1. **Customer 1 makes purchase**
   - Complete order for Tomatoes

2. **Customer 1 writes review**
   - Go to Dashboard
   - Click on order
   - Add review: 5 stars, "Fresh and delicious!"
   - Submit

3. **Customer 2 sees review**
   - Browse products
   - View Tomatoes
   - See Customer 1's review with 5 stars
   - Rating displays as 5.0

4. **Customer 2 writes different review**
   - Add review: 4 stars, "Good quality"
   - Submit

5. **Product rating updates**
   - Overall rating becomes (5+4)/2 = 4.5 stars
   - totalReviews = 2
   - Displayed in product cards

6. **Farmer sees reviews**
   - Go to Product details as farmer
   - View all customer reviews
   - Use feedback to improve service

---

## Postman Collection

### Import Instructions

1. Download Postman: https://www.postman.com/downloads/
2. Create new Workspace
3. Create new Collection: "Farmers Marketplace"
4. Follow structure below to add requests

### Variable Setup

In Postman, set these variables:

| Variable | Value |
|----------|-------|
| `baseUrl` | http://localhost:5000 |
| `customerToken` | [Get from login] |
| `farmerToken` | [Get from login] |
| `adminToken` | [Get from login] |

### Collection Structure

```
📁 Farmers Marketplace
├── 📁 Auth
│   ├── POST Register
│   ├── POST Login
│   ├── GET Current User
│   └── PUT Profile
│
├── 📁 Products
│   ├── GET All Products
│   ├── GET Product by ID
│   ├── GET Farmer Products
│   ├── POST Create Product
│   ├── PUT Update Product
│   └── DELETE Product
│
├── 📁 Cart
│   ├── GET Cart
│   ├── POST Add to Cart
│   ├── PUT Update Item
│   ├── DELETE Remove Item
│   └── DELETE Clear Cart
│
├── 📁 Orders
│   ├── POST Create Order
│   ├── GET Customer Orders
│   ├── GET Farmer Orders
│   ├── GET Order by ID
│   └── PUT Update Status
│
├── 📁 Reviews
│   ├── POST Add Review
│   ├── GET Product Reviews
│   ├── PUT Update Review
│   └── DELETE Review
│
└── 📁 Admin
    ├── GET Users
    ├── PUT Deactivate User
    ├── PUT Activate User
    ├── GET Products
    ├── GET Orders
    └── GET Statistics
```

---

## Error Scenarios

### Test 401 Unauthorized
```bash
curl -X GET http://localhost:5000/api/auth/me
# Expected: 401 error "No token provided"
```

### Test 403 Forbidden
```bash
curl -X POST http://localhost:5000/api/admin/users/3/deactivate \
  -H "Authorization: Bearer <CUSTOMER_TOKEN>"
# Expected: 403 error "Access denied"
```

### Test 404 Not Found
```bash
curl -X GET http://localhost:5000/api/products/999
# Expected: 404 error "Product not found"
```

### Test 400 Bad Request
```bash
curl -X POST http://localhost:5000/api/cart \
  -H "Authorization: Bearer <CUSTOMER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"productId": 1, "quantity": -5}'
# Expected: 400 error "Quantity must be positive"
```

---

## Performance Testing

### Load Testing with Apache Bench

```bash
# Test homepage performance
ab -n 1000 -c 10 http://localhost:3000/

# Test API endpoint
ab -n 1000 -c 10 http://localhost:5000/api/products
```

### Recommended Metrics
- Response time: < 200ms
- Throughput: > 50 requests/sec
- Error rate: < 1%

---

## Security Testing

### Test Cases

1. **SQL Injection**
   ```bash
   # Should be safe with Prisma ORM
   email=' OR '1'='1
   ```

2. **XSS Attack**
   ```bash
   <script>alert('XSS')</script>
   # Frontend should sanitize, no script execution
   ```

3. **CSRF Protection**
   - Frontend uses tokens, API validates origin

4. **Password Strength**
   - Minimum 6 characters
   - Hashed with bcrypt (10 salt rounds)

---

End of Testing Guide
