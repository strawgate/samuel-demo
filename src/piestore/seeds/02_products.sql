INSERT INTO products (sku, name, description, price_cents, stock) VALUES
('PIE-APP-001', 'Classic Apple Pie', 'Golden-crusted double-crust apple pie with cinnamon and nutmeg. Made with Granny Smith apples.', 2499, 50),
('PIE-CHR-001', 'Tart Cherry Pie', 'Lattice-top cherry pie with Michigan sour cherries. Sweet and tart perfection.', 2799, 35),
('PIE-PMP-001', 'Pumpkin Spice Pie', 'Creamy pumpkin filling with warm spices in a flaky butter crust. Thanksgiving essential.', 2299, 60),
('PIE-PEC-001', 'Southern Pecan Pie', 'Rich, gooey pecan filling with toasted Georgia pecans. A Southern classic.', 3199, 25),
('PIE-BLU-001', 'Wild Blueberry Pie', 'Bursting with wild Maine blueberries under a buttery crumble topping.', 2699, 40),
('PIE-KEY-001', 'Key Lime Pie', 'Tangy key lime custard on a graham cracker crust with whipped cream.', 2499, 45),
('PIE-BAN-001', 'Banoffee Pie', 'Layers of banana, toffee, and whipped cream on a biscuit base. British classic.', 2899, 30),
('PIE-CHO-001', 'Chocolate Silk Pie', 'Velvety chocolate mousse in a chocolate cookie crust. Death by chocolate.', 3099, 35),
('PIE-LEM-001', 'Lemon Meringue Pie', 'Zesty lemon curd topped with toasted Swiss meringue peaks.', 2599, 40),
('PIE-COC-001', 'Coconut Cream Pie', 'Tropical coconut custard with toasted coconut flakes and whipped cream.', 2799, 30),
('PIE-STR-001', 'Strawberry Rhubarb Pie', 'Sweet strawberries meet tart rhubarb under a lattice crust. Seasonal favorite.', 2699, 25),
('PIE-PEA-001', 'Georgia Peach Pie', 'Juicy ripe peaches with a hint of vanilla in a flaky double crust.', 2599, 35),
('PIE-MIX-001', 'Mixed Berry Pie', 'Blackberries, raspberries, and blueberries in a buttery pastry shell.', 2899, 30),
('PIE-MAP-001', 'Maple Walnut Pie', 'Vermont maple syrup and toasted walnuts in a brown butter crust.', 3299, 20),
('PIE-SAL-001', 'Salted Caramel Apple Pie', 'Our classic apple pie drizzled with salted caramel. Indulgent upgrade.', 3099, 25)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO customers (email, name, is_admin) VALUES
('alice@example.com', 'Alice Johnson', false),
('bob@example.com', 'Bob Smith', false),
('carol@example.com', 'Carol Williams', false),
('dave@example.com', 'Dave Brown', false),
('admin@piestore.com', 'PieStore Admin', true)
ON CONFLICT (email) DO NOTHING;

INSERT INTO orders (customer_id, sku, qty, status) VALUES
(1, 'PIE-APP-001', 2, 'delivered'),
(1, 'PIE-CHR-001', 1, 'shipped'),
(2, 'PIE-PMP-001', 3, 'processing'),
(2, 'PIE-PEC-001', 1, 'delivered'),
(3, 'PIE-BLU-001', 2, 'shipped'),
(3, 'PIE-KEY-001', 1, 'delivered'),
(4, 'PIE-BAN-001', 1, 'processing'),
(4, 'PIE-CHO-001', 2, 'delivered'),
(1, 'PIE-LEM-001', 1, 'shipped'),
(2, 'PIE-COC-001', 1, 'delivered')
ON CONFLICT DO NOTHING;
