//dependencies
const mysql = require('mysql');
const inquirer = require('inquirer');
const Table = require('cli-table');
const colors = require('colors');

//global variables
let chosenItem;
let remainingQuantity = 0;
let productSales = 0;
let subTotal = 0;
let custTotal = 0;

//creating mysql connection
const connection = mysql.createConnection({
	host: 'localhost',
	port: 3306,
	user: 'root',
	password: 'm240318420',
	database: 'bamazon'
});

connection.connect( err => {
	if (err) throw err;
	start();
});


//function that queries the database, displays a table of available items
//and prompts the user to select an item in the quantity they want purchase.
//also updates the stock quantity after the sale and logs the product sales
//to the database for Supervisor review.
function start() {
	console.log('Welcome customer!  Take a look at our inventory:'.bold.cyan);
	connection.query("SELECT * FROM products;", ( err, res ) => {
		if (err) throw err;
		let table = new Table({
		    head: ['Item ID'.bold.cyan, 'Product Name'.bold.cyan, 'Price'.bold.cyan, 'Quantity available'.bold.cyan],
		    colWidths: [ 10, 25, 10, 20 ]
		});
		for ( let i = 0; i < res.length; i++ ) {			
			table.push([ res[i].item_id, res[i].product_name, '$'+res[i].price, res[i].stock_quantity ]);
		} 
		console.log(table.toString());
		inquirer
		.prompt([
		{
			type: 'input',
			name: 'id',
			message: 'Enter the ID number of the item you would like to buy...',
			validate: int => {
				if ( /\D/.test(int) || int <= 0 || int  >res.length ) {
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
			message: 'How many of that item would you like to buy?',
			validate: int => {
				if ( /\D/.test(int) || int <= 0 ) {
					console.log(`  Please enter a whole number greater than zero.`.bold.cyan)
					return false;
				} else {
					return true;
				}
			}
		}
		]).then( response => {
			chosenItem =  () => {
				for ( let i = 0; i < res.length; i++ ) {
					if ( res[i].item_id === parseInt( response.id ) ) {
						return res[i];
					} 
				}
				return '';
			}

			if ( response.quantity <= chosenItem().stock_quantity ) {
				remainingQuantity = chosenItem().stock_quantity - response.quantity;
				subTotal = response.quantity * chosenItem().price;
				custTotal += subTotal;
				productSales = chosenItem().product_sales += subTotal;
				updateStock();
			} else if ( response.quantity > chosenItem().stock_quantity ) {
				console.log("There is insufficient quantity of that item.".bold.cyan);
				buyMore();
			} else if ( chosenItem() === '' ) {
				console.log('Your selection didn\'t match an item in our inventory...'.bold.cyan);
				buyMore();
			}
		});//end of 'then' method
	});//end of mysql query
} //end of start function

//function to check if the user would like to buy more items
function buyMore() {
	inquirer
	.prompt([
	{
		type: 'confirm',
		name: 'tryAgain',
		message: 'Would you like to purchase another item?',
		default: true
	}
	]).then( res => {
		if ( res.tryAgain ) {
			start();
		} else {
			console.log("Thank you for shopping at Bamazon.  Come again soon!".bold.cyan);
			connection.end();
		}
	});
}


//function that updates the stock quantity and product sales categories on the DB.
function updateStock() {
	connection.query("UPDATE products SET ? WHERE ?", 
		[{stock_quantity: remainingQuantity, product_sales: productSales }, {item_id: chosenItem().item_id}],
		 ( err, res ) => {
		 	if ( err ) throw err;
				console.log(`Your current total is $${custTotal}.`.bold.cyan);
				buyMore();
	});
}

