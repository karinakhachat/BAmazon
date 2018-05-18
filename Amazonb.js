var mySQL = require("mysql");
var inquirer = require("inquirer");
var Table = require("cli-table");
custOrder = [];

var connection = mySQL.createConnection({
    host: "localhost",
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "Ruby1234",
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    begin();
});

function begin() {
    connection.query("SELECT * FROM products", function (error, body) {
        if (error) throw error;
        console.log("you are connected");
        makeTable(body);
    });
}

function makeTable(results) {

    var table = new Table({
        head: ['Item Id#', 'Product Name', 'Price'],
        style: {
            head: [],
            compact: false,
            colAligns: ['center'],
        }
    });

    for (var k = 0; k < results.length; k++) {
        table.push([(parseInt([k]) + 1), results[k].product_name, ((results[k].price).toFixed(2))])
    }

    console.log(table.toString());
    makeOrder(results);
}

function makeOrder(orderData) {
    inquirer.prompt([
        {
            name: "order",
            type: "input",
            message: "Enter the # of the item you would like to purchase",
            validate: function (value) {
                if (isNaN(value) === false) {
                    return true;
                }
                return false; console.log("this is not a valid answer! you trickester");
            }
        }
    ]).then(function (answer) {
        if (answer.order) {

            var itemid = parseInt(answer.order);

            var querycheck = "SELECT product_name, stock_quantity, price FROM products WHERE ?"

            connection.query(querycheck, { item_id: itemid }, function (err, res) {

                console.log(JSON.stringify(res, null, 4));
                var productName = res[0].product_name;

                var departmentName = res[0].department_name;

                var Quantity = res[0].stock_quantity;

                var productPrice = res[0].price;
                Amount(Quantity, itemid, productName);
            })
        }
    });
};

function Amount(currentStock, itemID, productName) {

    inquirer
        .prompt([
            {
                name: "Amount",
                type: "input",
                message: "How many " + productName + "(s) would you like?",
                validate: function (value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    return false;
                }
            }
        ])
        .then(function (answer) {
            Amount = answer.Amount;
            if (Amount < currentStock) {
                inquirer
                    .prompt([
                        {
                            type: 'list',
                            name: 'UpdateQuantity',
                            message: "We only have" + currentStock + " in stock. What would you like to do?",
                            choices: [
                                'Update Quantity',
                                'Look for another awesome item',
                            ]
                        },
                    ])
                    .then(answers => {
                        if (answers.UpdateQuantity === "Update Quantity") {
                            ChangeQuant(Amount, itemID);
                        } else {
                            makeOrder();
                        }
                    });
            } else {
                console.log('Not enough socks, try again');
                makeOrder();
            }
        })
}
function ChangeQuant(quantity, itemID) {

    var UpdateQuery = "UPDATE products SET ? WHERE ?";
    connection.query(UpdateQuery,
        [
            {
                stock_quantity: quantity
            },
            {
                item_id: itemID
            }
        ], function(err, res) {
            console.log(err);
            console.log(res);
            connection.end();
        })
}
