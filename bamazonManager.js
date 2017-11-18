//dependencies
const mysql = require('mysql');
const inquirer = require('inquirer');
const Table = require('cli-table');
const colors = require('colors');

//creating mysql connection
const connection = mysql.createConnection({
	host: 'localhost',
	port: 3306,
	user: 'root',
	password: 'm240318420',
	database: 'bamazon'
});

connection.connect( err => {
	if ( err ) throw err;
	start();
});


//start function lets user choose what action to take and then routes them to the 
//correct function that will handle their response.
function start() {
	console.log('Welcome to Bamazon inventory management system (Manager view).'.bold.cyan)
	inquirer
	.prompt([
	{
		type: 'list',
		name: 'action',
		message: 'What action would you like to perform?',
		choices: ['View products for sale', 'View low inventory', 'Add to inventory', 'Add a new product']
	}
	]).then( res => {
		if (res.action.includes('View products')) {
			viewProducts();
		} else if (res.action.includes('low inventory')) {
			lowInventory();
		} else if (res.action.includes('Add to inventory')) {
			addToInventory();
		} else if (res.action.includes('new product')) {
			newProduct();
		}
	});
}

//function checks to see if they want to keep using the program
function newAction() {
	inquirer
	.prompt([
	{
		type: 'confirm',
		name: 'tryAgain',
		message: 'Would you like to continue managing your inventory?',
		default: true
	}
	]).then( res => {
		if ( res.tryAgain ) {
			start();
		} else {
			console.log("Thank you for using Bamazon inventory management system.  We value our managers more than your pay would suggest.".bold.cyan);
			connection.end();
		}
	});
}

//function queries the database and returns a table of products to display
function viewProducts(){
	connection.query("SELECT * FROM products;", ( err, res ) => {
		if ( err ) throw err;
		let table = new Table({
		    head: ['Item ID'.bold.cyan, 'Product Name'.bold.cyan, 'Price'.bold.cyan, 'Quantity available'.bold.cyan],
		    colWidths: [10, 25, 10, 20]
		});
		for ( let i = 0; i < res.length; i++ ) {			
			table.push([res[i].item_id, res[i].product_name, '$'+res[i].price, res[i].stock_quantity]);
		} 
		console.log(table.toString());
		newAction();
	});
}

//function queries the database for all items with less than 5 stock_quantity
//and returns them in a table.  If no items are returned, a message is displayed
function lowInventory() {
	connection.query("SELECT * FROM products WHERE stock_quantity<5;", ( err, res ) => {
		if ( err ) throw err;
		if (res.length>0) {
			let table = new Table({
			    head: ['Item ID'.bold.cyan, 'Product Name'.bold.cyan, 'Price'.bold.cyan, 'Quantity available'.bold.cyan],
			    colWidths: [10, 25, 10, 20]
			});
			for ( let i = 0; i < res.length; i++ ) {
					table.push([res[i].item_id, res[i].product_name, '$'+res[i].price, res[i].stock_quantity]);
			} 
			console.log(table.toString());
		} else {
			console.log('There are no items to display')
		} 
			newAction();
	});
} 

//function that allows user to add to the quantity of an item.
function addToInventory() {
	connection.query("SELECT * FROM products;", ( err, res ) => {
		if ( err ) throw err;
		let table = new Table({
		    head: ['Item ID'.bold.cyan, 'Product Name'.bold.cyan, 'Price'.bold.cyan, 'Quantity available'.bold.cyan],
		    colWidths: [10, 25, 10, 20]
		});
		for ( let i = 0; i < res.length; i++ ) {			
			table.push([res[i].item_id, res[i].product_name, '$'+res[i].price, res[i].stock_quantity]);
		} 
		console.log(table.toString());
		inquirer
		.prompt([
		{
			type: 'input',
			name: 'id',
			message: 'Enter the id number for the product you would like to add to:',
			validate: int => {
				if ( /\D/.test(int) || int <= 0 || int > res.length ) {
					console.log(`  Please enter a whole number between 1 and ${res.length}`.bold.cyan)
					return false;
				} else {
					return true;
				}
			}
		},
		{
			type: 'input',
			name: 'quantity',
			message: 'Enter the number of products you would like to add:',
			validate: int => {
				if (/\D/.test(int) || int <= 0 ) {
					console.log(`  Please enter a whole number greater than zero.`.bold.cyan)
					return false;
				} else {
					return true;
				}
			}
		}
		]).then( response => {

			let {id, quantity} = response;
			if (id<= res.length) {
				chosenItem = () => {
					for ( let i = 0; i < res.length; i++ ) {
						if (res[i].item_id === parseInt(id)) {
							return res[i];
						} 
					}
					return '';
				}
				let newQuantity = chosenItem().stock_quantity + parseInt(quantity);

				connection.query("UPDATE products SET ? WHERE ?", [{stock_quantity: newQuantity}, {item_id: id}], ( err, res ) => {
					if ( err ) throw err;
					console.log(`Product updated. The updated quantity will be: ${newQuantity}`.bold.cyan);
					inquirer.prompt([
						{
							type: 'confirm',
							name: 'updateItem',
							message: 'Would you like to update another item in the inventory?',
							default: true
						}
						]).then( res => {
							if ( res.updateItem ) {
								addToInventory();
							} else {
								newAction();
							}
						});
				});
			} else {
				console.log('That number isn\'t a valid product id.  Please try again.'.bold.cyan);
				addToInventory();
			}
		});//end of 'then' function
	});//end of mysql query
}//end of addToInventory function

//function that allows user to add a new product to the inventory, in a particular department
function newProduct() {
	connection.query('SELECT * FROM departments;', ( err,res ) => {
		if ( err ) throw err;
		inquirer
		.prompt([
		{
			type: 'input',
			name: 'name',
			message: 'What is the name of the product you would like to add?'
		}, 
		{
			type: 'list',
			name: 'department',
			message: 'What department would you like to add this product to?',
			choices: () => {
				let deptNames = [];
				for (let i = 0; i < res.length; i++) {
					deptNames.push(res[i].department_name);
				}
				return deptNames;
			}
		},
		{
			type: 'input',
			name: 'price',
			message: 'What is the price of this product?',
			validate: int => {
				if (/^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$/.test(int) && int>0) {
					return true;
				} else {
					console.log(`  Please enter a number greater than zero`.bold.cyan);
					return false;
				}
			}
		},
		{
			type: 'input',
			name: 'quantity',
			message: 'How many of this item will we have in stock?',
			validate: int => {
					if (/\D/.test(int) || int <= 0) {
						console.log(`  Please enter a whole number greater than zero`.bold.cyan);
						return false;
					} else {
						return true;
					}
				}
		}
		]).then( res => {
			let {name, department, price, quantity} = res;
			let sameItem = false;
			connection.query('SELECT * FROM products', ( err, res ) => {
				if ( err ) throw err;
				for ( let i = 0; i < res.length; i++ ) {
					if (res[i].product_name==name) {
						sameItem=true;
					}
				}
			
				if ( !sameItem ) {
					let item = {
					'product_name': name,
					'department_name': department,
					'price': price,
					'stock_quantity': quantity
					}
					connection.query(`INSERT INTO products SET ?`, item, ( err, res ) => {
						if ( err ) throw err;
						console.log(`${name} successfully added.`.bold.cyan);
						inquirer
						.prompt([
						{
							type: 'confirm',
							name: 'addItem',
							message: 'Would you like to add another item to the inventory?',
							default: true
						}
						]).then( res => {
							if ( res.addItem ) {
								newProduct();
							} else {
								newAction();
							}
						});
					});
				} else {
					console.log('That item already exists in inventory.'.bold.cyan);
					inquirer
					.prompt([
					{
						type: 'confirm',
						name: 'addItem',
						message: 'Would you like to add another item to the inventory?',
						default: true
					}
					]).then( res => {
						if (res.addItem) {
							newProduct();
						} else {
							newAction();
						}
					});
				}
			});
		});//end of 'then' method
	});//end of mysql query
}//end of newProduct function

