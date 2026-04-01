# API Documentation - Farmer to Customer Marketplace

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## 1. Authentication Endpoints

### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "role": "CUSTOMER"  // or "FARMER"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "john@example.com",
      "fullName": "John Doe",
      "role": "CUSTOMER"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "email": "john@example.com",
      "fullName": "John Doe",
      "role": "CUSTOMER",
      "phone": "+1234567890",
      "address": "123 Main St"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "john@example.com",
      "fullName": "John Doe",
      "role": "CUSTOMER"
    }
  }
}
```

---

### Update Profile
```http
PUT /auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "fullName": "John Updated",
  "phone": "+9876543210",
  "address": "456 New Address"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": { ... }
  }
}
```

---

## 2. Product Endpoints

### Get All Products
```http
GET /products?category=vegetables&minPrice=10&maxPrice=100&page=1&limit=12&search=tomato
```

**Query Parameters:**
- `category` (optional): fruits, vegetables, grains, dairy
- `minPrice` (optional): Minimum price
- `maxPrice` (optional): Maximum price
- `search` (optional): Search by product name
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 12)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": 1,
        "name": "Fresh Tomatoes",
        "category": "vegetables",
        "price": 45,
        "quantity": 100,
        "unit": "kg",
        "description": "Fresh organic tomatoes",
        "images": ["/uploads/image1.jpg"],
        "rating": 4.5,
        "totalReviews": 10,
        "isOrganic": true,
        "farmer": {
          "id": 2,
          "fullName": "Rajesh Sharma",
          "email": "rajesh@example.com"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 12,
      "total": 50,
      "pages": 5
    }
  }
}
```

---

### Get Product by ID
```http
GET /products/1
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "product": {
      "id": 1,
      "name": "Fresh Tomatoes",
      "category": "vegetables",
      "price": 45,
      "quantity": 100,
      "unit": "kg",
      "description": "Fresh organic tomatoes",
      "images": ["/uploads/image1.jpg"],
      "rating": 4.5,
      "totalReviews": 10,
      "isOrganic": true,
      "harvestDate": "2024-03-20",
      "farmer": {
        "id": 2,
        "fullName": "Rajesh Sharma",
        "email": "rajesh@example.com",
        "phone": "9876543210",
        "address": "123 Farm Lane"
      },
      "reviews": [
        {
          "id": 1,
          "rating": 5,
          "comment": "Excellent quality",
          "customer": {
            "id": 4,
            "fullName": "Amit Kumar"
          },
          "createdAt": "2024-03-23T10:30:00Z"
        }
      ]
    }
  }
}
```

---

### Create Product (Farmer Only)
```http
POST /products
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "name": "Fresh Apples",
  "category": "fruits",
  "description": "Sweet red apples",
  "price": 80,
  "quantity": 200,
  "unit": "kg",
  "harvestDate": "2024-03-23",
  "isOrganic": true,
  "images": [file1.jpg, file2.jpg]
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "product": { ... }
  }
}
```

---

### Update Product (Farmer Only)
```http
PUT /products/1
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "name": "Fresh Apples Updated",
  "price": 85,
  "quantity": 150,
  "images": [file1.jpg]
}
```

---

### Delete Product (Farmer Only)
```http
DELETE /products/1
Authorization: Bearer <token>
```

---

### Get Farmer Products
```http
GET /products/farmer/2
```

---

## 3. Cart Endpoints

### Get Cart
```http
GET /cart
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "customerId": 4,
        "productId": 1,
        "quantity": 3,
        "product": {
          "id": 1,
          "name": "Fresh Tomatoes",
          "price": 45,
          "unit": "kg",
          "images": ["/uploads/image1.jpg"],
          "farmer": { ... }
        },
        "addedAt": "2024-03-23T10:00:00Z"
      }
    ],
    "total": 135.00,
    "itemCount": 1
  }
}
```

---

### Add to Cart
```http
POST /cart
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": 1,
  "quantity": 3
}
```

---

### Update Cart Item
```http
PUT /cart/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": 5
}
```

---

### Remove from Cart
```http
DELETE /cart/1
Authorization: Bearer <token>
```

---

### Clear Cart
```http
DELETE /cart
Authorization: Bearer <token>
```

---

## 4. Order Endpoints

### Create Order
```http
POST /orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "deliveryAddress": "789 City Center, Mumbai",
  "paymentMethod": "COD"  // or "ONLINE"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "order": {
      "id": 1,
      "customerId": 4,
      "orderNumber": "ORD-1711270000000-ABC123",
      "totalPrice": 225.00,
      "status": "PENDING",
      "paymentMethod": "COD",
      "paymentStatus": "PENDING",
      "deliveryAddress": "789 City Center, Mumbai",
      "items": [
        {
          "id": 1,
          "orderId": 1,
          "productId": 1,
          "quantity": 3,
          "priceAtOrder": 45,
          "product": { ... }
        }
      ],
      "createdAt": "2024-03-23T10:30:00Z"
    }
  }
}
```

---

### Get Customer Orders
```http
GET /orders/customer/orders?status=DELIVERED&page=1&limit=10
Authorization: Bearer <token>
```

**Query Parameters:**
- `status` (optional): PENDING, ACCEPTED, SHIPPED, DELIVERED, REJECTED
- `page` (optional): Page number
- `limit` (optional): Items per page

---

### Get Farmer Orders
```http
GET /orders/farmer/orders?status=PENDING
Authorization: Bearer <token>
```

---

### Get Order by ID
```http
GET /orders/1
Authorization: Bearer <token>
```

---

### Update Order Status (Farmer/Admin)
```http
PUT /orders/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "ACCEPTED"  // PENDING, ACCEPTED, REJECTED, SHIPPED, DELIVERED
}
```

---

## 5. Review Endpoints

### Add/Update Review
```http
POST /reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": 1,
  "rating": 5,
  "comment": "Excellent product quality"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Review added successfully",
  "data": {
    "review": {
      "id": 1,
      "productId": 1,
      "customerId": 4,
      "rating": 5,
      "comment": "Excellent product quality",
      "customer": {
        "id": 4,
        "fullName": "Amit Kumar"
      },
      "createdAt": "2024-03-23T10:30:00Z"
    }
  }
}
```

---

### Get Product Reviews
```http
GET /reviews/product/1?page=1&limit=10
```

---

### Get Customer Review for Product
```http
GET /reviews/product/1/customer
Authorization: Bearer <token>
```

---

### Delete Review
```http
DELETE /reviews/1
Authorization: Bearer <token>
```

---

## 6. Admin Endpoints (Admin Only)

### Get All Users
```http
GET /admin/users?role=FARMER&search=john&page=1&limit=10
Authorization: Bearer <token>
```

---

### Deactivate User
```http
PUT /admin/users/1/deactivate
Authorization: Bearer <token>
```

---

### Activate User
```http
PUT /admin/users/1/activate
Authorization: Bearer <token>
```

---

### Get All Products
```http
GET /admin/products?category=vegetables&page=1&limit=10
Authorization: Bearer <token>
```

---

### Get All Orders
```http
GET /admin/orders?status=DELIVERED&page=1&limit=10
Authorization: Bearer <token>
```

---

### Get Dashboard Stats
```http
GET /admin/dashboard/stats
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalUsers": 50,
    "totalProducts": 150,
    "totalOrders": 200,
    "totalRevenue": 50000.00,
    "ordersByStatus": [
      {
        "status": "DELIVERED",
        "count": 150
      }
    ],
    "usersByRole": [
      {
        "role": "CUSTOMER",
        "count": 30
      }
    ]
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Email already registered"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Unauthorized access"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Product not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Testing with cURL

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"John","email":"john@test.com","password":"test123","role":"CUSTOMER"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"test123"}'
```

### Get Products
```bash
curl http://localhost:5000/api/products?category=fruits
```

---

## Role-Based Access

| Endpoint | Admin | Farmer | Customer |
|----------|-------|--------|----------|
| Register/Login | ✅ | ✅ | ✅ |
| View Products | ✅ | ✅ | ✅ |
| Create Product | ❌ | ✅ | ❌ |
| Add to Cart | ❌ | ❌ | ✅ |
| Place Order | ❌ | ❌ | ✅ |
| View My Orders | ✅ | ✅ | ✅ |
| Add Review | ❌ | ❌ | ✅ |
| Manage Users | ✅ | ❌ | ❌ |
| Dashboard | ✅ | ✅ | ✅ |

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Server Error |

---

End of API Documentation
