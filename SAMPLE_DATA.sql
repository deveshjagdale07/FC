-- Sample Data for Farmer Marketplace
-- Insert this into your MySQL database for testing

-- Note: Passwords are bcrypt hashed for 'test123'
-- To generate bcrypt hash: Use bcrypt online generator or npm install -g bcrypt-cli

/*
Sample User Logins:
==================

ADMIN:
Email: admin@test.com
Password: test123

FARMER 1:
Email: farmer1@test.com
Password: test123

FARMER 2:
Email: farmer2@test.com
Password: test123

CUSTOMER 1:
Email: customer1@test.com
Password: test123

CUSTOMER 2:
Email: customer2@test.com
Password: test123
*/

-- Note: Replace the hashed passwords with actual bcrypt hashes
-- Use https://bcrypt-generator.com/ to generate hashes for 'test123'

-- Insert Users
INSERT INTO users (email, password, fullName, phone, address, role, isActive, createdAt, updatedAt) VALUES
('admin@test.com', '$2a$10$2oIRPsHvHR2BPxrAqMQ3n.RxL1xZqhvJmTELmGPn1wfr5H2P74S4K', 'Admin User', '9999999999', 'Admin Office', 'ADMIN', true, NOW(), NOW()),
('farmer1@test.com', '$2a$10$2oIRPsHvHR2BPxrAqMQ3n.RxL1xZqhvJmTELmGPn1wfr5H2P74S4K', 'Rajesh Sharma', '9876543210', '123 Farm Lane, Village Ghazipur', 'FARMER', true, NOW(), NOW()),
('farmer2@test.com', '$2a$10$2oIRPsHvHR2BPxrAqMQ3n.RxL1xZqhvJmTELmGPn1wfr5H2P74S4K', 'Priya Patel', '9876543211', '456 Agriculture Road, Nashik', 'FARMER', true, NOW(), NOW()),
('customer1@test.com', '$2a$10$2oIRPsHvHR2BPxrAqMQ3n.RxL1xZqhvJmTELmGPn1wfr5H2P74S4K', 'Amit Kumar', '9876543212', '789 City Center, Mumbai', 'CUSTOMER', true, NOW(), NOW()),
('customer2@test.com', '$2a$10$2oIRPsHvHR2BPxrAqMQ3n.RxL1xZqhvJmTELmGPn1wfr5H2P74S4K', 'Neha Singh', '9876543213', '321 Downtown, Delhi', 'CUSTOMER', true, NOW(), NOW());

-- Insert Products from Farmer 1 (Rajesh Sharma)
INSERT INTO products (farmerId, name, category, description, price, quantity, unit, harvestDate, isOrganic, images, rating, totalReviews, isActive, createdAt, updatedAt) VALUES
(2, 'Fresh Tomatoes', 'vegetables', 'Certified organic, handpicked red tomatoes. Farm fresh and ripened naturally. No chemicals or pesticides used. Perfect for salads and cooking.', 45.00, 150, 'kg', '2024-03-20', true, '[]', 4.5, 0, true, NOW(), NOW()),
(2, 'Green Chillies', 'vegetables', 'Spicy green chillies. Perfect for Indian cuisine. Freshly harvested, no artificial ripening. Rich in vitamin C and very flavorful.', 60.00, 80, 'kg', '2024-03-21', true, '[]', 0, 0, true, NOW(), NOW()),
(2, 'Fresh Carrots', 'vegetables', 'Sweet and crunchy orange carrots. High in beta-carotene. Perfect for salads, cooking, or juice. No pesticides used.', 30.00, 120, 'kg', '2024-03-22', true, '[]', 0, 0, true, NOW(), NOW()),
(2, 'Organic Wheat', 'grains', 'Pure organic wheat from our farm. No chemicals, no preservatives. Excellent for making fresh flour. Tested for purity.', 50.00, 200, 'kg', '2024-03-15', true, '[]', 0, 0, true, NOW(), NOW());

-- Insert Products from Farmer 2 (Priya Patel)
INSERT INTO products (farmerId, name, category, description, price, quantity, unit, harvestDate, isOrganic, images, rating, totalReviews, isActive, createdAt, updatedAt) VALUES
(3, 'Fresh Milk', 'dairy', 'Pure fresh milk from our healthy cows. No added preservatives or colors. Daily production. Rich in calcium and nutrients. 3.5% fat content.', 55.00, 500, 'litre', '2024-03-23', false, '[]', 4.8, 0, true, NOW(), NOW()),
(3, 'Organic Apples', 'fruits', 'Sweet red apples. Naturally ripened. Rich source of fiber and antioxidants. Storage can last 2-3 weeks. Perfect for daily consumption.', 80.00, 100, 'kg', '2024-03-23', true, '[]', 0, 0, true, NOW(), NOW()),
(3, 'Fresh Bananas', 'fruits', 'Fresh yellow bananas. Naturally ripened. Rich in potassium and natural sugars. Great energy source. Perfect for breakfast or smoothies.', 35.00, 200, 'kg', '2024-03-23', false, '[]', 0, 0, true, NOW(), NOW()),
(3, 'Paneer (Cottage Cheese)', 'dairy', 'Homemade paneer. Made from fresh milk. No added preservatives. Rich protein source. Perfect for curries and snacks. Made fresh daily.', 350.00, 50, 'kg', '2024-03-23', false, '[]', 0, 0, true, NOW(), NOW());

-- Insert Reviews
INSERT INTO reviews (productId, customerId, rating, comment, createdAt, updatedAt) VALUES
(1, 4, 4, 'Great quality tomatoes! Very fresh and taste amazing. Will order again.', NOW(), NOW()),
(1, 5, 5, 'Best tomatoes I have ever bought. Highly recommended to everyone.', NOW(), NOW()),
(5, 4, 5, 'Fresh milk delivered on time. Great quality. This is my go-to dairy source now.', NOW(), NOW()),
(6, 5, 4, 'Sweet and delicious apples. They last long in refrigerator. Would buy again.', NOW(), NOW());

-- Update product ratings after reviews
UPDATE products SET rating = 4.5, totalReviews = 2 WHERE id = 1;
UPDATE products SET rating = 5, totalReviews = 1 WHERE id = 5;
UPDATE products SET rating = 4, totalReviews = 1 WHERE id = 6;

-- Insert Orders
INSERT INTO orders (customerId, totalPrice, status, paymentMethod, paymentStatus, deliveryAddress, orderNumber, createdAt, updatedAt) VALUES
(4, 225.00, 'DELIVERED', 'COD', 'PENDING', '789 City Center, Mumbai', 'ORD-1711270000000-ABC123', NOW(), NOW()),
(5, 330.00, 'ACCEPTED', 'ONLINE', 'COMPLETED', '321 Downtown, Delhi', 'ORD-1711270001000-DEF456', NOW(), NOW());

-- Insert Order Items
INSERT INTO order_items (orderId, productId, quantity, priceAtOrder, createdAt) VALUES
(1, 1, 3, 45.00, NOW()),  -- 3 kg tomatoes
(1, 3, 2, 30.00, NOW()),  -- 2 kg carrots
(2, 5, 5, 55.00, NOW()),  -- 5 litre milk
(2, 6, 2, 80.00, NOW());  -- 2 kg apples

-- Verify Data
-- Run these queries to verify the sample data was inserted:
/*
SELECT COUNT(*) FROM users;  -- Should show 5
SELECT COUNT(*) FROM products;  -- Should show 8
SELECT COUNT(*) FROM reviews;  -- Should show 4
SELECT COUNT(*) FROM orders;  -- Should show 2
SELECT COUNT(*) FROM order_items;  -- Should show 4
*/

-- View Data
/*
-- See all users
SELECT id, email, fullName, role FROM users;

-- See all products
SELECT id, name, category, price, quantity FROM products;

-- See all orders
SELECT id, orderNumber, totalPrice, status FROM orders;

-- See order details
SELECT o.orderNumber, oi.quantity, p.name, p.price
FROM order_items oi
JOIN orders o ON oi.orderId = o.id
JOIN products p ON oi.productId = p.id;
*/
