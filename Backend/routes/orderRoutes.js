const express = require("express");

const router = express.Router();

const oracledb = require("oracledb");

const { getOracle } = require("../config/oracle");

router.post("/create", async(req,res)=>{


let connection;


const {
    customer_id,
    address
}=req.body;



try{


connection = await getOracle();


const cart = await connection.execute(

`

SELECT

c.product_id AS PRODUCT_ID,
c.quantity AS QUANTITY,
p.price AS PRICE

FROM cart c

JOIN products p

ON c.product_id=p.product_id

WHERE c.customer_id=:customer_id

`,

{
customer_id
},

{
outFormat:oracledb.OUT_FORMAT_OBJECT
}

);



if(cart.rows.length===0){

return res.json({

success:false,

message:"Cart is empty"

});

}


let total_amount=0;


cart.rows.forEach(item=>{

total_amount += item.PRICE * item.QUANTITY;

});


const order = await connection.execute(

`

INSERT INTO orders

(
customer_id,
total_amount,
order_status
)

VALUES

(
:customer_id,
:total_amount,
'CONFIRMED'
)

RETURNING order_id INTO :order_id

`,

{

customer_id,

total_amount,

order_id:{
dir:oracledb.BIND_OUT,
type:oracledb.NUMBER
}

}

);



const order_id =
order.outBinds.order_id[0];


for(let item of cart.rows){


await connection.execute(

`

INSERT INTO order_items

(
order_id,
product_id,
quantity,
unit_price,
line_total
)

VALUES

(
:order_id,
:product_id,
:quantity,
:unit_price,
:line_total
)

`,

{

order_id,

product_id:item.PRODUCT_ID,

quantity:item.QUANTITY,

unit_price:item.PRICE,

line_total:item.PRICE * item.QUANTITY

}

);


}


await connection.execute(

`

INSERT INTO deliveries

(
order_id,
delivery_address,
delivery_city,
delivery_status,
estimated_date
)

VALUES

(
:order_id,
:address,
'Colombo',
'PROCESSING',
SYSDATE + 7
)

`,

{

order_id,

address:address || "Not Updated"

}

);

// Insert Order Items + Update Stock

for (let item of cart.rows) {

    await connection.execute(
        `
        INSERT INTO order_items
        (
            order_id,
            product_id,
            quantity,
            unit_price,
            line_total
        )
        VALUES
        (
            :order_id,
            :product_id,
            :quantity,
            :unit_price,
            :line_total
        )
        `,
        {
            order_id,
            product_id: item.PRODUCT_ID,
            quantity: item.QUANTITY,
            unit_price: item.PRICE,
            line_total: item.PRICE * item.QUANTITY
        }
    );

    await connection.execute(
        `
        UPDATE products
        SET stock_quantity = stock_quantity - :quantity
        WHERE product_id = :product_id
        AND stock_quantity >= :quantity
        `,
        {
            quantity: item.QUANTITY,
            product_id: item.PRODUCT_ID
        }
    );

}





// Clear Cart


await connection.execute(

`

DELETE FROM cart

WHERE customer_id=:customer_id

`,

{
customer_id
}

);





await connection.commit();




res.json({

success:true,

message:"Order Created Successfully",

order_id,

total:total_amount

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







// =================================
// CUSTOMER ORDERS VIEW
// =================================


router.get("/customer/:customer_id", async(req,res)=>{


let connection;


try{


connection = await getOracle();



const result = await connection.execute(

`

SELECT

o.order_id,

o.order_date,

o.total_amount,

o.order_status


FROM orders o


WHERE o.customer_id=:customer_id


ORDER BY o.order_date DESC


`,

{

customer_id:req.params.customer_id

},


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






module.exports = router;