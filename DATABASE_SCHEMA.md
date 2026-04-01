# Database Schema Documentation

## Overview

This document provides detailed information about the Farmer Marketplace database schema, relationships, and design decisions.

---

## Entity Relationship Diagram (ERD)

```
┌─────────────┐
│    users    │ (Farmers, Customers, Admins)
├─────────────┤
│ id (PK)     │
│ email       │
│ password    │
│ fullName    │
│ phone       │
│ address     │
│ role        │◄──────────┐
│ profileImage│           │
│ isActive    │           │
│ createdAt   │           │
│ updatedAt   │           │
└─────────────┘           │
    ▲                      │
    │                      │
    └──────────────────────┤
    │                      │
    │ 1:N                  │
    │                      ▼
    │          ┌─────────────────────┐
    │          │    products         │
    │          ├─────────────────────┤
    │          │ id (PK)             │
    │          │ farmerId (FK)───────┘
    │          │ name                │
    │          │ category            │
    │          │ description         │
    │          │ price               │
    │          │ quantity            │
    │          │ unit                │
    │          │ harvestDate         │
    │          │ isOrganic           │
    │          │ images (JSON)       │
    │          │ rating              │
    │          │ totalReviews        │
    │          │ isActive            │
    │          │ createdAt           │
    │          │ updatedAt           │
    │          └─────────────────────┘
    │                  ▲  │
    │                  │  │
    │           1:N    │  │ 1:N
    │                  │  └──────┐
    │                  │         │
    │          ┌───────────┐     │
    │          │ reviews   │     │
    │          ├───────────┤     │
    │          │ id (PK)   │     │
    │          │ productId │◄────┘
    │          │(FK)───────┘
    │          │ customerId│────┐
    │          │(FK)       │    │
    │          │ rating    │    │
    │          │ comment   │    │
    │          │ createdAt │    │
    │          │ updatedAt │    │
    │          └───────────┘    │
    │                           │
    └───────────────────────────┤
    │                           │
    │ 1:N                       │
    │                           │
    ├───────────────┐           │
    │               │           │
    │        ┌──────▼────┐      │
    │        │   orders  │      │
    │        ├───────────┤      │
    │        │ id (PK)   │      │
    │        │customerId ◄──────┘
    │        │(FK)       │
    │        │totalPrice │
    │        │ status    │
    │        │payment    │
    │        │ address   │
    │        │orderNumber│
    │        │ createdAt │
    │        │ updatedAt │
    │        └───────────┘
    │             │
    │      1:N    │
    │             ▼
    │        ┌──────────────────┐
    │        │   order_items    │
    │        ├──────────────────┤
    │        │ id (PK)          │
    │        │ orderId (FK)─────┐
    │        │ productId (FK)───┼─┐
    │        │ quantity         │ │
    │        │ priceAtOrder     │ │
    │        │ createdAt        │ │
    │        └──────────────────┘ │
    │                             │
    └─────────────────────────────┘
    │
    │ 1:N
    │
    ├──────────────┐
    │              │
    │       ┌──────▼────────┐
    │       │  cart_items   │
    │       ├───────────────┤
    │       │ id (PK)       │
    │       │ customerId(FK)│
    │       │ productId(FK) │
    │       │ quantity      │
    │       │ addedAt       │
    │       └───────────────┘
    │
    └────────────────────► (1:N relationships to other tables)
```

---

## Table Details

### 1. Users Table

**Purpose:** Store all user accounts (Farmers, Customers, Admins)

**Columns:**

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique user identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Email address for login |
| password | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| fullName | VARCHAR(255) | NOT NULL | User's full name |
| phone | VARCHAR(20) | NULL | Contact number |
| address | TEXT | NULL | Delivery address |
| role | ENUM | DEFAULT 'CUSTOMER' | CUSTOMER, FARMER, ADMIN |
| profileImage | VARCHAR(500) | NULL | Profile picture URL |
| isActive | BOOLEAN | DEFAULT true | Account status |
| createdAt | TIMESTAMP | DEFAULT NOW() | Account creation date |
| updatedAt | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Last update time |

**Indexes:**
```sql
CREATE INDEX idx_email ON users(email);
CREATE INDEX idx_role ON users(role);
```

**Example:**
```sql
INSERT INTO users VALUES (
  1,
  'farmer@example.com',
  '$2a$10$hash...',
  'Rajesh Sharma',
  '9876543210',
  '123 Farm Lane',
  'FARMER',
  '/uploads/profile.jpg',
  true,
  NOW(),
  NOW()
);
```

---

### 2. Products Table

**Purpose:** Store product listings created by farmers

**Columns:**

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique product identifier |
| farmerId | INT | FOREIGN KEY (users.id), ON DELETE CASCADE | Farmer who listed the product |
| name | VARCHAR(255) | NOT NULL | Product name |
| category | VARCHAR(50) | NOT NULL | fruits, vegetables, grains, dairy |
| description | LONGTEXT | NOT NULL | Detailed product description |
| price | DECIMAL(10,2) | NOT NULL | Price per unit |
| quantity | INT | NOT NULL | Available stock |
| unit | VARCHAR(20) | NOT NULL | kg, litre, piece, gram |
| harvestDate | DATE | NULL | When product was harvested |
| isOrganic | BOOLEAN | DEFAULT false | Organic certification |
| images | JSON | NULL | Array of image file paths |
| rating | FLOAT | DEFAULT 0 | Average rating (1-5) |
| totalReviews | INT | DEFAULT 0 | Number of reviews |
| isActive | BOOLEAN | DEFAULT true | Product availability |
| createdAt | TIMESTAMP | DEFAULT NOW() | Listing creation date |
| updatedAt | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Last update time |

**Indexes:**
```sql
CREATE INDEX idx_farmerId ON products(farmerId);
CREATE INDEX idx_category ON products(category);
CREATE INDEX idx_isActive ON products(isActive);
```

**Example:**
```sql
INSERT INTO products VALUES (
  1,
  1,
  'Fresh Tomatoes',
  'vegetables',
  'Fresh, organic red tomatoes...',
  45.00,
  150,
  'kg',
  '2024-03-20',
  true,
  '["uploads/tom1.jpg", "uploads/tom2.jpg"]',
  4.5,
  10,
  true,
  NOW(),
  NOW()
);
```

---

### 3. Reviews Table

**Purpose:** Store customer reviews and ratings for products

**Columns:**

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique review identifier |
| productId | INT | FOREIGN KEY (products.id), ON DELETE CASCADE | Product being reviewed |
| customerId | INT | FOREIGN KEY (users.id), ON DELETE CASCADE | Customer writing review |
| rating | INT | NOT NULL, CHECK (rating BETWEEN 1 AND 5) | Star rating (1-5) |
| comment | LONGTEXT | NULL | Review text |
| createdAt | TIMESTAMP | DEFAULT NOW() | Review creation date |
| updatedAt | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Last update time |

**Constraints:**
```sql
UNIQUE KEY unique_review (productId, customerId) -- One review per product per customer
```

**Indexes:**
```sql
CREATE INDEX idx_productId ON reviews(productId);
CREATE INDEX idx_customerId ON reviews(customerId);
```

**Example:**
```sql
INSERT INTO reviews VALUES (
  1,
  1,
  5,
  4,
  'Excellent quality tomatoes! Very fresh.',
  NOW(),
  NOW()
);
```

---

### 4. Orders Table

**Purpose:** Store customer orders

**Columns:**

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique order identifier |
| customerId | INT | FOREIGN KEY (users.id), ON DELETE CASCADE | Customer placing order |
| totalPrice | DECIMAL(12,2) | NOT NULL | Total order amount |
| status | ENUM | DEFAULT 'PENDING' | PENDING, ACCEPTED, REJECTED, SHIPPED, DELIVERED |
| paymentMethod | ENUM | NOT NULL | COD, ONLINE |
| paymentStatus | ENUM | DEFAULT 'PENDING' | PENDING, COMPLETED, FAILED |
| deliveryAddress | TEXT | NOT NULL | Full delivery address |
| orderNumber | VARCHAR(50) | UNIQUE, NOT NULL | Unique order reference number |
| createdAt | TIMESTAMP | DEFAULT NOW() | Order placement date |
| updatedAt | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Last update time |

**Indexes:**
```sql
CREATE INDEX idx_customerId ON orders(customerId);
CREATE INDEX idx_status ON orders(status);
CREATE INDEX idx_orderNumber ON orders(orderNumber);
```

**Example:**
```sql
INSERT INTO orders VALUES (
  1,
  5,
  225.00,
  'PENDING',
  'COD',
  'PENDING',
  '789 City Center, Mumbai',
  'ORD-1711270000000-ABC123',
  NOW(),
  NOW()
);
```

---

### 5. OrderItems Table

**Purpose:** Store individual items in each order

**Columns:**

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique item identifier |
| orderId | INT | FOREIGN KEY (orders.id), ON DELETE CASCADE | Which order this item belongs to |
| productId | INT | FOREIGN KEY (products.id), ON DELETE CASCADE | Which product was ordered |
| quantity | INT | NOT NULL | How many units ordered |
| priceAtOrder | DECIMAL(10,2) | NOT NULL | Price when order was placed (historical data) |
| createdAt | TIMESTAMP | DEFAULT NOW() | Item creation date |

**Indexes:**
```sql
CREATE INDEX idx_orderId ON order_items(orderId);
CREATE INDEX idx_productId ON order_items(productId);
```

**Why separate table?**
- Historical data: Stores price at order time (product price may change)
- Multiple items per order
- Easy to query order details
- Calculate order totals reliably

**Example:**
```sql
INSERT INTO order_items VALUES (
  1,
  1,
  1,
  3,
  45.00,
  NOW()
); -- Ordered 3 kg tomatoes at ₹45/kg
```

---

### 6. CartItems Table

**Purpose:** Store temporary shopping cart items for customers

**Columns:**

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique cart item identifier |
| customerId | INT | FOREIGN KEY (users.id), ON DELETE CASCADE | Which customer's cart |
| productId | INT | FOREIGN KEY (products.id), ON DELETE CASCADE | Which product in cart |
| quantity | INT | NOT NULL | Quantity in cart |
| addedAt | TIMESTAMP | DEFAULT NOW() | When item was added |

**Constraints:**
```sql
UNIQUE KEY unique_cart_item (customerId, productId) -- One entry per product per customer
```

**Indexes:**
```sql
CREATE INDEX idx_customerId ON cart_items(customerId);
```

**Example:**
```sql
INSERT INTO cart_items VALUES (
  1,
  5,
  1,
  2,
  NOW()
); -- Customer 5 has 2 kg of product 1 in cart
```

---

## Data Relationships

### One-to-Many Relationships

1. **User → Products** (Farmer creates many products)
2. **User → Orders** (Customer places many orders)
3. **User → Reviews** (Customer writes many reviews)
4. **User → CartItems** (Customer has cart with multiple items)
5. **Product → Reviews** (Product receives many reviews)
6. **Product → OrderItems** (Product appears in many orders)
7. **Product → CartItems** (Product can be in many carts)
8. **Order → OrderItems** (Order contains multiple items)

### Unique Constraints

1. **Users:** `email` - Each user has unique email
2. **Reviews:** `(productId, customerId)` - Each customer can review a product once
3. **CartItems:** `(customerId, productId)` - One entry per product per customer
4. **Orders:** `orderNumber` - Each order has unique reference number

---

## Enums

### Role Enum
```
CUSTOMER    - Buys products
FARMER      - Sells products
ADMIN       - Manages platform
```

### OrderStatus Enum
```
PENDING     - Awaiting farmer acceptance
ACCEPTED    - Farmer accepted the order
REJECTED    - Farmer rejected
SHIPPED     - On the way to customer
DELIVERED   - Received by customer
```

### PaymentMethod Enum
```
COD         - Cash on Delivery
ONLINE      - Online payment (dummy)
```

### PaymentStatus Enum
```
PENDING     - Payment not yet made
COMPLETED   - Payment successful
FAILED      - Payment failed
```

---

## Key Design Decisions

### 1. Order Items as Separate Table
- **Why:** Allows historical price tracking
- **Benefit:** If product price changes, order still shows original price

### 2. Rating in Products Table
- **Why:** Denormalization for performance
- **Benefit:** Quick product sorting/filtering by rating
- **Maintenance:** Updated whenever review is added/removed

### 3. Images as JSON
- **Why:** Flexible schema (variable number of images)
- **Benefit:** Easy to add/remove images without schema changes

### 4. Soft Delete (isActive flag)
- **Why:** Preserve historical data
- **Benefit:** Can reactivate products instead of deleting

### 5. Role-Based in Users Table
- **Why:** Single authentication table
- **Benefit:** Simpler queries, flexible role combinations

### 6. Cascade Delete
- **Why:** Maintain referential integrity
- **Benefit:** When user deleted, all related data cleaned up

---

## Query Examples

### Find all products by farmer
```sql
SELECT p.* FROM products p
WHERE p.farmerId = 2 AND p.isActive = true;
```

### Get order with all details
```sql
SELECT o.*, u.fullName, u.email,
       oi.quantity, p.name, p.price as priceAtOrder
FROM orders o
JOIN users u ON o.customerId = u.id
JOIN order_items oi ON o.id = oi.orderId
JOIN products p ON oi.productId = p.id
WHERE o.id = 1;
```

### Find products with average rating >4
```sql
SELECT * FROM products
WHERE rating >= 4 AND isActive = true
ORDER BY rating DESC;
```

### Get customer's purchase history
```sql
SELECT o.orderNumber, o.totalPrice, o.status, COUNT(oi.id) as itemCount
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.orderId
WHERE o.customerId = 5
GROUP BY o.id
ORDER BY o.createdAt DESC;
```

### Calculate farmer's sales
```sql
SELECT p.farmerId,
       SUM(oi.quantity) as totalSold,
       SUM(oi.quantity * oi.priceAtOrder) as totalRevenue,
       COUNT(DISTINCT o.id) as totalOrders
FROM order_items oi
JOIN products p ON oi.productId = p.id
JOIN orders o ON oi.orderId = o.id
WHERE o.status = 'DELIVERED'
GROUP BY p.farmerId;
```

---

## Migration Process

### Create tables with Prisma:
```bash
npx prisma migrate dev --name init
```

### View schema:
```bash
npx prisma studio
```

### Reset database:
```bash
npx prisma migrate reset
```

---

## Index Strategy

**Indexes created for performance:**
- `users.email` - Fast login lookup
- `products.farmerId` - Fast farmer product lookup
- `products.category` - Fast category filtering
- `orders.customerId` - Fast customer order lookup
- `orders.status` - Fast status filtering
- `reviews.productId` - Fast product review lookup

---

## Best Practices

1. ✅ Use CASCADE DELETE for related deletes
2. ✅ Store historical data in OrderItems
3. ✅ Denormalize ratings for performance
4. ✅ Use UNIQUE constraints for business rules
5. ✅ Index frequently queried columns
6. ✅ Use enums for restricted values
7. ✅ Timestamp all records

---

End of Database Schema Documentation
