CREATE DATABASE bamazon;

USE bamazon;

CREATE TABLE products(
	item_id INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(100) NOT NULL,
    department_name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INTEGER(10) NOT NULL,
    product_sales DECIMAL(10,2) NOT NULL DEFAULT 0;
);

INSERT INTO products(product_name, department_name, price, stock_quantity)
VALUES('cheese', 'groceries', 7, 108),
	('ficas', 'decor', 20, 35),
	('boombox', 'electronics', 75, 20),
	('hand sanitizer', 'HBA', 2, 15),
	('parka', 'clothing', 50, 12),
	('work boots', 'clothing', 60, 23),
	('mascara', 'HBA', 10, 88),
	('pleather couch', 'decor', 200, 22),
	('apples', 'groceries', 2, 100),
    ('headphones', 'electronics', 15.5, 42),
    ('hammer', 'tools', 20, 15),
    ('screwdriver', 'tools', 10, 24),
    ('lamp', 'decor', 35, 47),
    ('socks', 'clothing', 4, 200),
    ('how to code', 'books', 10000, 1),
	('war and peace', 'books', 10, 5);

CREATE TABLE departments(
	department_id INT AUTO_INCREMENT PRIMARY KEY,
    department_name VARCHAR(45) NOT NULL,
    over_head_costs DECIMAL(10,2) NOT NULL
);

INSERT INTO departments(department_name, over_head_costs) 
VALUES('groceries',500),
	('HBA',200),
	('tools',1000),
	('books',600),
	('decor',750),
	('clothing',290),
	('electronics', 500);

SELECT * FROM products;
SELECT * FROM departments;