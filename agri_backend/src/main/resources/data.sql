-- =============================================
-- SAMPLE DATA FOR AGRI SUPPLY CHAIN SYSTEM
-- =============================================

-- PARTY
INSERT IGNORE INTO party (party_id, name, phone, address, type) VALUES
(1,  'Ravi Kumar',     '9876543201', 'Ludhiana, Punjab',       'FARMER'),
(2,  'Suresh Patel',   '9876543202', 'Anand, Gujarat',         'FARMER'),
(3,  'Meena Devi',     '9876543203', 'Nashik, Maharashtra',    'FARMER'),
(4,  'Arjun Singh',    '9876543204', 'Jaipur, Rajasthan',      'FARMER'),
(5,  'Lakshmi Reddy',  '9876543205', 'Guntur, Andhra Pradesh', 'FARMER'),
(6,  'Amit Sharma',    '9876543206', 'Delhi',                  'DEALER'),
(7,  'Priya Traders',  '9876543207', 'Mumbai, Maharashtra',    'DEALER'),
(8,  'GreenMart Co.',  '9876543208', 'Bangalore, Karnataka',   'DEALER'),
(9,  'FreshFoods Ltd', '9876543209', 'Chennai, Tamil Nadu',    'DEALER'),
(10, 'AgroHub',        '9876543210', 'Hyderabad, Telangana',   'DEALER');

-- FARMER
INSERT IGNORE INTO farmer (farmer_id, party_id) VALUES
(1, 1), (2, 2), (3, 3), (4, 4), (5, 5);

-- DEALER
INSERT IGNORE INTO dealer (dealer_id, party_id) VALUES
(1, 6), (2, 7), (3, 8), (4, 9), (5, 10);

-- TRANSPORTER
INSERT IGNORE INTO transporter (transporter_id, name, phone, vehicle_details, rate_per_km) VALUES
(1, 'FastMove Logistics', '9111111101', 'Truck - MH12AB1234, 10 Ton',          12.0),
(2, 'SpeedCargo',         '9111111102', 'Mini Truck - DL01CD5678, 5 Ton',       8.0),
(3, 'AgroTransport Co.',  '9111111103', 'Refrigerated Van - KA03EF9012, 3 Ton', 15.0),
(4, 'QuickHaul Services', '9111111104', 'Truck - TN07GH3456, 8 Ton',            10.0),
(5, 'RuralFreight',       '9111111105', 'Pickup - RJ14IJ7890, 2 Ton',           6.0);

-- PRODUCE LOT
INSERT IGNORE INTO produce_lot (lot_id, farmer_id, crop_type, quantity, unit, harvest_date, quality_grade, available_quantity) VALUES
(1,  1, 'Wheat',    1000.0, 'kg', '2024-03-15', 'A',   800.0),
(2,  1, 'Rice',      500.0, 'kg', '2024-03-20', 'B',   400.0),
(3,  2, 'Cotton',    800.0, 'kg', '2024-03-10', 'A',   650.0),
(4,  2, 'Groundnut', 600.0, 'kg', '2024-03-18', 'A',   400.0),
(5,  3, 'Grapes',    300.0, 'kg', '2024-03-22', 'A+',  250.0),
(6,  3, 'Onion',    2000.0, 'kg', '2024-03-05', 'B',  1500.0),
(7,  4, 'Mustard',   700.0, 'kg', '2024-03-12', 'A',   400.0),
(8,  4, 'Bajra',     900.0, 'kg', '2024-03-08', 'B',   500.0),
(9,  5, 'Chilli',    400.0, 'kg', '2024-03-25', 'A',   300.0),
(10, 5, 'Turmeric',  250.0, 'kg', '2024-03-17', 'A+',  200.0);

-- PURCHASE
INSERT IGNORE INTO purchase (purchase_id, dealer_id, purchase_date, status) VALUES
(1, 1, '2024-04-01', 'CONFIRMED'),
(2, 2, '2024-04-02', 'CONFIRMED'),
(3, 3, '2024-04-03', 'PENDING'),
(4, 4, '2024-04-04', 'CONFIRMED'),
(5, 5, '2024-04-05', 'PENDING');

-- PURCHASE ITEM
INSERT IGNORE INTO purchase_item (purchase_item_id, purchase_id, lot_id, quantity, price_per_unit) VALUES
(1,  1, 1,  200.0, 25.00),
(2,  1, 2,  100.0, 40.00),
(3,  2, 3,  150.0, 60.00),
(4,  2, 4,  200.0, 55.00),
(5,  3, 5,   50.0, 120.00),
(6,  3, 6,  500.0, 15.00),
(7,  4, 7,  300.0, 50.00),
(8,  4, 8,  400.0, 20.00),
(9,  5, 9,  100.0, 90.00),
(10, 5, 10,  50.0, 150.00);

-- SHIPMENT
INSERT IGNORE INTO shipment (shipment_id, transporter_id, from_party_id, to_party_id, status, shipment_date, delivery_date) VALUES
(1, 1, 1, 6,  'DELIVERED',  '2024-04-02', '2024-04-04'),
(2, 2, 2, 7,  'DELIVERED',  '2024-04-03', '2024-04-05'),
(3, 3, 3, 8,  'IN_TRANSIT', '2024-04-04', NULL),
(4, 4, 4, 9,  'DELIVERED',  '2024-04-05', '2024-04-07'),
(5, 5, 5, 10, 'IN_TRANSIT', '2024-04-06', NULL);

-- USERS (password = 'password123')
DELETE FROM users WHERE user_id IN (1,2,3,4,5,6,7,8);
INSERT IGNORE INTO users (user_id, username, password, role, name, entity_id) VALUES
(1,  'farmer1',      '$2a$10$Gvow3S2O18gJ7S4ptn/q2ut9bxeOtjDkFnZPVI08ss6ZZ61ITDOnu', 'FARMER',      'Ravi Kumar',     1),
(2,  'farmer2',      '$2a$10$Gvow3S2O18gJ7S4ptn/q2ut9bxeOtjDkFnZPVI08ss6ZZ61ITDOnu', 'FARMER',      'Suresh Patel',   2),
(3,  'farmer3',      '$2a$10$Gvow3S2O18gJ7S4ptn/q2ut9bxeOtjDkFnZPVI08ss6ZZ61ITDOnu', 'FARMER',      'Meena Devi',     3),
(4,  'dealer1',      '$2a$10$Gvow3S2O18gJ7S4ptn/q2ut9bxeOtjDkFnZPVI08ss6ZZ61ITDOnu', 'DEALER',      'Amit Sharma',    1),
(5,  'dealer2',      '$2a$10$Gvow3S2O18gJ7S4ptn/q2ut9bxeOtjDkFnZPVI08ss6ZZ61ITDOnu', 'DEALER',      'Priya Traders',  2),
(6,  'transporter1', '$2a$10$Gvow3S2O18gJ7S4ptn/q2ut9bxeOtjDkFnZPVI08ss6ZZ61ITDOnu', 'TRANSPORTER', 'FastMove Logistics', 1),
(7,  'transporter2', '$2a$10$Gvow3S2O18gJ7S4ptn/q2ut9bxeOtjDkFnZPVI08ss6ZZ61ITDOnu', 'TRANSPORTER', 'SpeedCargo',     2),
(8,  'admin',        '$2a$10$Gvow3S2O18gJ7S4ptn/q2ut9bxeOtjDkFnZPVI08ss6ZZ61ITDOnu', 'ADMIN',       'Admin User',     NULL);

-- PAYMENT
INSERT IGNORE INTO payment (payment_id, purchase_id, amount, payment_date, status) VALUES
(1, 1,  9000.00, '2024-04-03', 'PAID'),
(2, 2, 20000.00, '2024-04-04', 'PAID'),
(3, 3, 13500.00, '2024-04-05', 'PENDING'),
(4, 4, 23000.00, '2024-04-06', 'PAID'),
(5, 5, 16500.00, '2024-04-07', 'PENDING');
