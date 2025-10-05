-- ================================================
-- SEEDS PARA BASE DE DATOS INVENTARIO
-- ================================================

-- ===== PRODUCTOS =====

-- ALIMENTOS (A001-A020)
INSERT INTO productos (codigo, nombre, precio_unitario, cantidad) VALUES 
('A001', 'Arroz Diana x 500g', 2900, 85),
('A002', 'Frijoles Roa x 500g', 4500, 62),
('A003', 'Aceite Girasol x 1L', 8000, 45),
('A004', 'Azúcar Manuelita x 1kg', 3200, 92),
('A005', 'Sal Marina x 500g', 1500, 120),
('A006', 'Pasta Doria x 500g', 2100, 78),
('A007', 'Lenteja x 500g', 3800, 55),
('A008', 'Atún Van Camps', 4200, 68),
('A009', 'Sardinas Isabel', 3500, 71),
('A010', 'Harina de Trigo x 1kg', 2800, 43),
('A011', 'Avena Quaker x 500g', 5800, 61),
('A012', 'Chocolate Corona x 500g', 12500, 38),
('A013', 'Café Sello Rojo x 500g', 16000, 52),
('A014', 'Panela x Libra', 3200, 98),
('A015', 'Chocolate Milo x 400g', 14500, 44),
('A016', 'Gelatina Royal x 6', 4200, 73),
('A017', 'Mayonesa Fruco', 6500, 56),
('A018', 'Salsa de Tomate Fruco', 5200, 68),
('A019', 'Vinagre x 500ml', 2800, 84),
('A020', 'Salsa de Ajo', 4800, 49);

-- LÁCTEOS (L001-L015)
INSERT INTO productos (codigo, nombre, precio_unitario, cantidad) VALUES 
('L001', 'Leche Colanta x 1L', 3500, 95),
('L002', 'Queso Campesino', 12000, 38),
('L003', 'Yogurt Alpina x 200ml', 4200, 82),
('L004', 'Mantequilla Colanta', 6800, 47),
('L005', 'Kumis Alpina x 1L', 5200, 65),
('L006', 'Arequipe Alpina', 4800, 53),
('L007', 'Queso Mozzarella', 15000, 29),
('L008', 'Crema de Leche', 3200, 61),
('L009', 'Leche Condensada', 5500, 44),
('L010', 'Cuajada', 8500, 36),
('L011', 'Huevos AA x 30', 18000, 47),
('L012', 'Quesito x 10', 6200, 58),
('L013', 'Leche Deslactosada x 1L', 4500, 72),
('L014', 'Yogurt Griego', 5800, 41),
('L015', 'Queso Tajado x 500g', 9500, 55);

-- BEBIDAS (B001-B015)
INSERT INTO productos (codigo, nombre, precio_unitario, cantidad) VALUES 
('B001', 'Coca Cola 1.5L', 3000, 110),
('B002', 'Jugo Hit Mora x 1L', 2500, 88),
('B003', 'Agua Cristal x 600ml', 1800, 145),
('B004', 'Cerveza Poker x 330ml', 2800, 92),
('B005', 'Energizante Vive100', 4500, 57),
('B006', 'Colombiana 1.5L', 2800, 76),
('B007', 'Té Hatsu', 2200, 63),
('B008', 'Jugo Del Valle', 3500, 51),
('B009', 'Avena Alpina', 3200, 68),
('B010', 'Pony Malta', 2100, 94),
('B011', 'Gatorade', 3800, 65),
('B012', 'RedBull', 6500, 42),
('B013', 'Sprite 1.5L', 2900, 78),
('B014', 'Cerveza Águila', 2700, 86),
('B015', 'Malta Leona', 2400, 71);

-- PANADERÍA (P001-P015)
INSERT INTO productos (codigo, nombre, precio_unitario, cantidad) VALUES 
('P001', 'Pan Tajado Bimbo', 4200, 72),
('P002', 'Pan Integral', 5500, 48),
('P003', 'Pan Perro', 3800, 55),
('P004', 'Tostadas Doria', 4600, 41),
('P005', 'Pan Hamburguesa x 6', 5200, 38),
('P006', 'Arepa Congelada x 5', 4800, 62),
('P007', 'Croissant x 6', 6500, 33),
('P008', 'Pan Dulce', 3200, 58),
('P009', 'Buñuelo x 10', 5800, 45),
('P010', 'Pandebono x 8', 6200, 37),
('P011', 'Galletas Ducales', 3800, 69),
('P012', 'Ponqué Ramo', 4500, 51),
('P013', 'Rosquitas x 12', 3600, 64),
('P014', 'Pan Baguette', 4200, 43),
('P015', 'Almojábanas x 6', 5500, 38);

-- SNACKS (S001-S015)
INSERT INTO productos (codigo, nombre, precio_unitario, cantidad) VALUES 
('S001', 'Galletas Festival', 3200, 89),
('S002', 'Papas Margarita', 2800, 103),
('S003', 'Chocolatina Jet', 1800, 156),
('S004', 'Chicles Trident', 2200, 87),
('S005', 'Maní Salado', 3500, 64),
('S006', 'Doritos', 4200, 71),
('S007', 'Chocorramo', 2500, 98),
('S008', 'Wafer Nucita', 2800, 82),
('S009', 'Platanitos Margarita', 3100, 76),
('S010', 'Gomas Trululu', 2400, 91),
('S011', 'Cheetos', 3800, 68),
('S012', 'Oreo', 4500, 55),
('S013', 'Chips Ahoy', 4200, 61),
('S014', 'Pringles', 8500, 34),
('S015', 'M&Ms', 3900, 73);

-- ASEO (M001-M015) - M de Mercancía/Miscelánea
INSERT INTO productos (codigo, nombre, precio_unitario, cantidad) VALUES 
('M001', 'Detergente Ariel x 500g', 15000, 48),
('M002', 'Jabón Protex x 3', 7500, 62),
('M003', 'Shampoo Sedal', 12000, 53),
('M004', 'Papel Higiénico Familia x 12', 14000, 41),
('M005', 'Toallas Nosotras x 10', 8500, 57),
('M006', 'Cepillo Dental Colgate', 4200, 68),
('M007', 'Crema Dental Colgate', 6800, 59),
('M008', 'Desodorante Rexona', 9500, 44),
('M009', 'Jabón Líquido x 1L', 11000, 36),
('M010', 'Suavizante Suavitel', 8200, 51),
('M011', 'Cloro x 1L', 5500, 73),
('M012', 'Esponjilla Scotch Brite', 3200, 95),
('M013', 'Jabón en Polvo Ace', 13500, 42),
('M014', 'Limpiapisos Fabuloso', 9800, 38),
('M015', 'Servilletas x 100', 4500, 81);

-- CARNES (C001-C010)
INSERT INTO productos (codigo, nombre, precio_unitario, cantidad) VALUES 
('C001', 'Pollo x Libra', 6500, 85),
('C002', 'Carne de Res x Libra', 15000, 62),
('C003', 'Pescado Mojarra x Libra', 12000, 48),
('C004', 'Chorizo Ranchero x Libra', 11000, 55),
('C005', 'Jamón Premium x Libra', 18000, 37),
('C006', 'Salchicha x Libra', 8500, 71),
('C007', 'Carne Molida x Libra', 13000, 58),
('C008', 'Costilla de Cerdo x Libra', 16000, 43),
('C009', 'Pechuga x Libra', 14000, 52),
('C010', 'Chicharrón x Libra', 19000, 34);

-- FRUTAS (F001-F010)
INSERT INTO productos (codigo, nombre, precio_unitario, cantidad) VALUES 
('F001', 'Manzana x Libra', 4500, 95),
('F002', 'Banano x Libra', 3200, 118),
('F003', 'Naranja x Libra', 3800, 102),
('F004', 'Fresa x Libra', 6500, 67),
('F005', 'Papaya x Libra', 5200, 73),
('F006', 'Sandía x Libra', 2800, 88),
('F007', 'Piña x Unidad', 5500, 56),
('F008', 'Uva x Libra', 8500, 41),
('F009', 'Pera x Libra', 5800, 62),
('F010', 'Mango x Libra', 4200, 79);

-- VERDURAS (V001-V010)
INSERT INTO productos (codigo, nombre, precio_unitario, cantidad) VALUES 
('V001', 'Tomate x Libra', 3500, 108),
('V002', 'Cebolla Cabezona x Libra', 2800, 124),
('V003', 'Papa x Libra', 2500, 145),
('V004', 'Zanahoria x Libra', 3200, 96),
('V005', 'Lechuga x Unidad', 2100, 87),
('V006', 'Pepino x Libra', 2800, 73),
('V007', 'Cilantro x Manojo', 1500, 115),
('V008', 'Aguacate x Unidad', 2500, 92),
('V009', 'Pimentón x Libra', 4200, 64),
('V010', 'Ahuyama x Libra', 2200, 81);

-- Mensaje de confirmación
SELECT 'Seeds creados exitosamente!' as mensaje;
SELECT 'Credenciales:' as info;
SELECT 'Admin: admin1 / 123456' as credencial;
SELECT 'Admin: admin2 / 123456' as credencial;
SELECT 'Cajero: cajero1-5 / ABCD' as credencial;