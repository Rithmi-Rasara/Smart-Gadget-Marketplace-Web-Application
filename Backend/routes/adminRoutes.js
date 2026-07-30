const express = require("express");
const router = express.Router();

const oracledb = require("oracledb");
const { getOracle } = require("../config/oracle");

console.log("ADMIN ROUTES LOADED");

router.get("/test",(req,res)=>{

    res.json({
        message:"Admin route working"
    });

});

console.log("Admin route loaded");

router.get("/products", async(req,res)=>{


let connection;


try{

connection = await getOracle();

const result = await connection.execute(

`

SELECT

p.product_id,
p.product_name,
p.price,
p.stock_quantity,
p.status,

s.shop_name,

c.category_name

FROM products p
JOIN sellers s
ON p.seller_id=s.seller_id
LEFT JOIN categories c
ON p.category_id=c.category_id
ORDER BY p.product_id DESC

`,

{},

{
outFormat:oracledb.OUT_FORMAT_OBJECT
}

);

res.json(result.rows);

}

catch(error){

console.log(error);

res.status(500).json({

success:false,

message:error.message

});

}

finally{

if(connection){

await connection.close();

}

}

});


router.delete("/products/:id", async(req,res)=>{

let connection;

try{

connection = await getOracle();

await connection.execute(

`

DELETE FROM products
WHERE product_id=:id

`,

{

id:req.params.id

}

);

await connection.commit();

res.json({

success:true,

message:"Product Deleted Successfully"

});

}

catch(error){

console.log(error);

if(connection){

await connection.rollback();

}

res.status(500).json({

success:false,

message:error.message

});

}


finally{

if(connection){

await connection.close();

}

}

});


router.get("/categories", async(req,res)=>{

let connection;

try{

connection = await getOracle();

const result = await connection.execute(

`

SELECT
category_id,
category_name,
description
FROM categories
ORDER BY category_id DESC

`,

{},

{

outFormat:oracledb.OUT_FORMAT_OBJECT

}

);

res.json(result.rows);

}

catch(error){

console.log(error);

res.status(500).json({

success:false,

message:error.message

});


}

finally{

if(connection){

await connection.close();

}

}

});


router.post("/categories", async(req,res)=>{

let connection;

try{

connection = await getOracle();

const {

category_name,

description


}=req.body;

await connection.execute(


`

INSERT INTO categories

(

category_name,
description

)

VALUES

(

:category_name,
:description

)

`,

{


category_name,
description

}

);

await connection.commit();

res.json({

success:true,

message:"Category Added Successfully"

});

}


catch(error){

console.log(error);

if(connection){

await connection.rollback();

}

res.status(500).json({

success:false,

message:error.message

});

}


finally{

if(connection){

await connection.close();

}

}

});


router.delete("/categories/:id", async(req,res)=>{

let connection;

try{

connection = await getOracle();

await connection.execute(

`

DELETE FROM categories
WHERE category_id=:id

`,

{

id:req.params.id

}

);



await connection.commit();

res.json({

success:true,

message:"Category Deleted Successfully"

});

}

catch(error){

console.log(error);


if(connection){

await connection.rollback();

}

res.status(500).json({

success:false,

message:error.message

});

}

finally{

if(connection){

await connection.close();

}

}

});

router.get("/sellers", async(req,res)=>{

let connection;

try{

connection = await getOracle();

const result = await connection.execute(

`

SELECT
seller_id,
shop_name,
owner_name,
email,
phone,
address,
city,
status,
created_date
FROM sellers
ORDER BY seller_id DESC

`,

{},

{

outFormat:oracledb.OUT_FORMAT_OBJECT

}

);

res.json(result.rows);

}



catch(error){

console.log(error);

res.status(500).json({

success:false,

message:error.message

});


}

finally{

if(connection){

await connection.close();

}


}


});


router.put("/sellers/:id", async(req,res)=>{

let connection;

try{

connection = await getOracle();

const status = req.body.status;

console.log("UPDATE SELLER");
console.log("ID:", req.params.id);
console.log("STATUS:", status);

await connection.execute(

`

UPDATE sellers
SET status=:status
WHERE seller_id=:id

`,

{

status: status,

id: req.params.id

}

);

await connection.commit();

res.json({

success:true,

message:"Seller Status Updated Successfully"

});

}



catch(error){

console.log(error);

if(connection){

await connection.rollback();

}

res.status(500).json({

success:false,

message:error.message

});


}


finally{


if(connection){

await connection.close();

}


}



});


router.get("/customers", async(req,res)=>{

let connection;

try{

connection = await getOracle();

const result = await connection.execute(

`

SELECT
customer_id,
full_name,
email,
phone,
address,
city,
status,
created_date
FROM customers
ORDER BY customer_id DESC

`,

{},


{

outFormat:oracledb.OUT_FORMAT_OBJECT

}

);


res.json(result.rows);

}



catch(error){

console.log(error);

res.status(500).json({

success:false,

message:error.message

});


}



finally{

if(connection){

await connection.close();

}

}

});

router.delete("/customers/:id", async(req,res)=>{


let connection;

try{

connection = await getOracle();

const customer_id=req.params.id;


await connection.execute(

`

DELETE FROM user_accounts
WHERE customer_id=:id

`,

{

id:customer_id

}


);

await connection.execute(

`

DELETE FROM customers
WHERE customer_id=:id

`,

{

id:customer_id

}


);

await connection.commit();

res.json({

success:true,

message:"Customer Deleted Successfully"

});



}

catch(error){

console.log(error);

if(connection){

await connection.rollback();

}

res.status(500).json({

success:false,

message:error.message

});


}

finally{


if(connection){

await connection.close();

}

}


});

router.get("/orders", async(req,res)=>{


let connection;


try{


connection = await getOracle();


const result = await connection.execute(

`

SELECT
o.order_id,
c.full_name AS CUSTOMER_NAME,
o.order_date,
o.total_amount,
o.order_status,
d.delivery_status
FROM orders o
JOIN customers c
ON o.customer_id = c.customer_id
LEFT JOIN deliveries d
ON o.order_id = d.order_id
ORDER BY o.order_id DESC

`,

{},


{

outFormat:oracledb.OUT_FORMAT_OBJECT

}


);

res.json(result.rows);

}

catch(error){

console.log(error);

res.status(500).json({

success:false,

message:error.message

});


}

finally{

if(connection){

await connection.close();

}


}

});


router.get("/orders/:id", async(req,res)=>{


let connection;


try{


connection = await getOracle();

const order_id = req.params.id;

const orderResult = await connection.execute(


`
SELECT
o.order_id,
c.full_name AS CUSTOMER_NAME,
o.total_amount,
o.order_status
FROM orders o
JOIN customers c
ON o.customer_id = c.customer_id
ORDER BY o.order_date DESC

`,


{

id:order_id

},


{

outFormat:oracledb.OUT_FORMAT_OBJECT

}

);

const itemsResult = await connection.execute(


`

SELECT
p.product_name,
oi.quantity,
oi.unit_price,
oi.line_total
FROM order_items oi
JOIN products p
ON oi.product_id=p.product_id
WHERE oi.order_id=:id

`,


{

id:order_id

},


{

outFormat:oracledb.OUT_FORMAT_OBJECT

}



);

const deliveryResult = await connection.execute(

`

SELECT

delivery_address,
delivery_city,
delivery_status,
estimated_date,
delivered_date

FROM deliveries

WHERE order_id=:id

`,

{
id:order_id
},

{
outFormat:oracledb.OUT_FORMAT_OBJECT
}

);


res.json({


order:

orderResult.rows[0],



items:

itemsResult.rows,



delivery:

deliveryResult.rows[0] || {}



});





}



catch(error){


console.log(error);



res.status(500).json({

success:false,

message:error.message

});


}




finally{


if(connection){

await connection.close();

}


}


});


router.get("/reports", async(req,res)=>{

console.log("REPORT ROUTE HIT");

let connection;


try{


connection = await getOracle();

const customers =
await connection.execute(

`
SELECT COUNT(*) AS TOTAL
FROM customers
`,

{},
{
outFormat:oracledb.OUT_FORMAT_OBJECT
}

);

const sellers =
await connection.execute(

`
SELECT COUNT(*) AS TOTAL
FROM sellers
`,

{},
{
outFormat:oracledb.OUT_FORMAT_OBJECT
}

);

const products =
await connection.execute(

`
SELECT COUNT(*) AS TOTAL
FROM products
`,

{},
{
outFormat:oracledb.OUT_FORMAT_OBJECT
}

);

const orders =
await connection.execute(

`
SELECT COUNT(*) AS TOTAL
FROM orders
`,

{},
{
outFormat:oracledb.OUT_FORMAT_OBJECT
}

);

const revenue =
await connection.execute(

`
SELECT NVL(SUM(total_amount),0) AS TOTAL
FROM orders
WHERE NVL(order_status,'PENDING') <> 'CANCELLED'
`,

{},
{
outFormat:oracledb.OUT_FORMAT_OBJECT
}

);

const topProducts =
await connection.execute(

`

SELECT
p.product_name AS PRODUCT_NAME,
SUM(oi.quantity) AS QUANTITY_SOLD,
SUM(oi.line_total) AS REVENUE
FROM order_items oi
JOIN products p
ON oi.product_id=p.product_id
GROUP BY p.product_name
ORDER BY QUANTITY_SOLD DESC
FETCH FIRST 10 ROWS ONLY

`,

{},
{

outFormat:oracledb.OUT_FORMAT_OBJECT

}

);



res.json({

CUSTOMERS:
customers.rows[0].TOTAL,


SELLERS:
sellers.rows[0].TOTAL,


PRODUCTS:
products.rows[0].TOTAL,


ORDERS:
orders.rows[0].TOTAL,


REVENUE:
revenue.rows[0].TOTAL,


topProducts:
topProducts.rows


});


}



catch(error){


console.log(error);


res.status(500).json({

success:false,

message:error.message

});


}



finally{


if(connection){

await connection.close();

}


}


});

router.get("/dashboard", async (req, res) => {

    let connection;

    try {

        connection = await getOracle();

        const products = await connection.execute(
            `
            SELECT COUNT(*) AS TOTAL
            FROM products
            `,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        const customers = await connection.execute(
            `
            SELECT COUNT(*) AS TOTAL
            FROM customers
            `,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        const orders = await connection.execute(
            `
            SELECT COUNT(*) AS TOTAL
            FROM orders
            `,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        const revenue = await connection.execute(
            `
            SELECT NVL(SUM(total_amount),0) AS TOTAL
            FROM orders
            WHERE NVL(order_status,'PENDING') <> 'CANCELLED'
            `,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        res.json({

            TOTAL_PRODUCTS: products.rows[0].TOTAL,

            TOTAL_CUSTOMERS: customers.rows[0].TOTAL,

            TOTAL_ORDERS: orders.rows[0].TOTAL,

            TOTAL_REVENUE: revenue.rows[0].TOTAL

        });

    }
    catch (error) {

        console.log(error);

        res.status(500).json({

            success: false,
            message: error.message

        });

    }
    finally {

        if (connection)
            await connection.close();

    }

});

module.exports = router;