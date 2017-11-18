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
	password: //redacted for security
	database: 'bamazon'
});

connection.connect( err => {
	if ( err ) throw err;
	start();
});

//start function lets user choose what action to take and then routes them to the 
//correct function that will handle their response.
function start() {
	console.log('Welcome to Bamazon inventory management system (Supervisor view).'.bold.cyan)
	inquirer
	.prompt([
	{
		type: 'list',
		name: 'action',
		message: 'Which action would you like to perform?',
		choices: ['View product sales by department', 'Create new department']
	}
	]).then( res => {
		if (res.action.includes('sales')) {
			viewSales();
		} else if(res.action.includes('Create')) {
			createDept();
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
		message: 'Would you like to continue overseeing your departments?',
		default: true
	}
	]).then( res => {
		if (res.tryAgain) {
			start();
		} else {
			console.log("Thank you for using Bamazon inventory management system.  We value our Supervisors much more than our Managers *wink*.".bold.cyan);
			connection.end();
		}
	});
}

//function that queries the database and returns a table that is a result of an inner join
//of products and departments
function viewSales() {	
	connection.query("SELECT products.product_sales, departments.department_name, departments.department_id, departments.over_head_costs, SUM(products.product_sales) as product_sales "+
					"FROM products "+
					"INNER JOIN departments ON products.department_name = departments.department_name GROUP BY department_name ORDER BY department_id;", 
					( err, res ) => {
		if ( err ) throw err;
		let table = new Table({
		    head: ['Department ID'.bold.cyan, 'Department Name'.bold.cyan, 'Overhead Costs'.bold.cyan, 'Product Sales'.bold.cyan, 'Total Profit'.bold.cyan],
		    colWidths: [15, 20, 20, 15, 15]
		});
		for ( let i = 0; i < res.length; i++ ) {
			let {product_sales, department_name, department_id, over_head_costs} = res[i];
			let profit = product_sales - over_head_costs;
			table.push([department_id, department_name, '$'+over_head_costs, '$'+product_sales, '$'+profit]);
		}
		console.log(table.toString());
		newAction();
	});	
}

//function that allows a user to create a new department and assign a value for
//overhead costs
function createDept() {
	inquirer
	.prompt([
	{
		type: 'input',
		name: 'dept',
		message: 'What is the name of the department you would like to add?'
	},
	{
		type: 'input',
		name: 'overhead',
		message: 'What are the overhead costs of this department?',
		validate: int => {
			if ( /^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$/.test(int) && int > 0 ) {
				return true;
			} else {
				console.log(`  Please enter a number greater than zero`.bold.cyan);
				return false;
			}
		}
	}
	]).then( response => {
		let {dept, overhead} = response;
		connection.query('INSERT INTO departments SET ?', {department_name: dept, over_head_costs: overhead}, ( err,res ) => {
			if ( err ) throw err;
			console.log(`${dept} department successfully added!`.bold.cyan);
			inquirer
			.prompt([
			{
				type: 'confirm',
				name: 'addAnother',
				message: 'Would you like to add another department?',
				default: true
			}
			]).then( res => {
				if ( res.addAnother ) {
					createDept();
				} else {
					newAction(); 
				}
			});
		});
	});
}

