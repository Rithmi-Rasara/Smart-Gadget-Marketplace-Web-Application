const express = require("express");
const router = express.Router();

const oracledb = require("oracledb");
const { getOracle } = require("../config/oracle");


router.get("/dashboard/:id", async(req,res)=>{

let connection;

try{

connection = await getOracle();

const id = req.params.id;


const ordersResult = await connection.execute(
`
SELECT COUNT(*) AS TOTAL
FROM orders
WHERE customer_id=:id
`,
{id},
{
outFormat:oracledb.OUT_FORMAT_OBJECT
}
);


const cartResult = await connection.execute(
`
SELECT COUNT(*) AS TOTAL
FROM cart
WHERE customer_id=:id
`,
{id},
{
outFormat:oracledb.OUT_FORMAT_OBJECT
}
);

const deliveryResult = await connection.execute(
`
SELECT COUNT(*) AS TOTAL
FROM deliveries d
JOIN orders o
ON d.order_id=o.order_id
WHERE o.customer_id=:id
`,
{id},
{
outFormat:oracledb.OUT_FORMAT_OBJECT
}
);


const spentResult = await connection.execute(
`
SELECT NVL(SUM(total_amount),0) AS TOTAL
FROM orders
WHERE customer_id=:id
`,
{id},
{
outFormat:oracledb.OUT_FORMAT_OBJECT
}
);



res.json({

orders: ordersResult.rows[0].TOTAL,

cart: cartResult.rows[0].TOTAL,

deliveries: deliveryResult.rows[0].TOTAL,

spent: spentResult.rows[0].TOTAL

});


}

catch(error){

console.log("Dashboard Error:",error);


res.status(500).json({

success:false,

message:error.message

});


}

finally{

if(connection)
await connection.close();

}


});



router.get("/products", async (req, res) => {
  let connection;

  try {
    connection = await getOracle();

    const result = await connection.execute(
      `
            SELECT

p.product_id AS PRODUCT_ID,

p.product_name AS PRODUCT_NAME,

p.price AS PRICE,

p.stock_quantity AS STOCK_QUANTITY,

p.created_date AS CREATED_DATE,

c.category_name AS CATEGORY_NAME,

s.shop_name AS SHOP_NAME


FROM products p


JOIN categories c
ON p.category_id = c.category_id


JOIN sellers s
ON p.seller_id = s.seller_id


WHERE p.status='ACTIVE'


ORDER BY p.created_date DESC


FETCH FIRST 7 ROWS ONLY
            `,

      [],

      {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      },
    );

    res.json(result.rows);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    if (connection) await connection.close();
  }
});

router.get("/orders/:customer_id", async (req, res) => {
  let connection;

  try {
    connection = await getOracle();

    const result = await connection.execute(
      `

SELECT

o.order_id,
o.order_date,
o.total_amount,
o.order_status,

p.product_name,
oi.quantity,
oi.unit_price,
oi.line_total,

s.shop_name,


-- DELIVERY DATA ADD HERE

d.delivery_id,
d.delivery_status,
d.delivery_address,
d.delivery_city,
d.estimated_date,
d.delivered_date


FROM orders o


JOIN order_items oi
ON o.order_id = oi.order_id


JOIN products p
ON oi.product_id = p.product_id


JOIN sellers s
ON p.seller_id = s.seller_id


LEFT JOIN deliveries d
ON o.order_id = d.order_id


WHERE o.customer_id=:customer_id

`,

      {
        customer_id: req.params.customer_id,
      },

      {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      },
    );

    res.json(result.rows);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
});


router.get("/order-details/:id", async (req, res) => {
  let connection;

  try {
    connection = await getOracle();

    const order_id = req.params.id;

    const result = await connection.execute(
      `

SELECT


o.order_id,

o.order_date,

o.total_amount,

o.order_status,


p.product_name,


oi.quantity,

oi.unit_price,

oi.line_total,


s.shop_name



FROM orders o



JOIN order_items oi

ON o.order_id = oi.order_id



JOIN products p

ON oi.product_id = p.product_id



JOIN sellers s

ON p.seller_id = s.seller_id



WHERE o.order_id=:order_id



ORDER BY oi.order_id



`,

      {
        order_id,
      },

      {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      },
    );

    res.json(result.rows);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,

      message: error.message,
    });
  } finally {
    if (connection) await connection.close();
  }
});

router.post("/cart", async (req, res) => {
  let connection;

  const {
    customer_id,

    product_id,

    quantity,
  } = req.body;

  try {
    connection = await getOracle();


    const check = await connection.execute(
      `

SELECT cart_id, quantity

FROM cart

WHERE customer_id=:customer_id

AND product_id=:product_id


`,

      {
        customer_id,

        product_id,
      },
    );

    if (check.rows.length > 0) {
      await connection.execute(
        `

UPDATE cart

SET quantity = quantity + :quantity


WHERE customer_id=:customer_id

AND product_id=:product_id


`,

        {
          quantity,

          customer_id,

          product_id,
        },
      );
    } else {
      await connection.execute(
        `

INSERT INTO cart

(

customer_id,

product_id,

quantity

)


VALUES

(

:customer_id,

:product_id,

:quantity

)



`,

        {
          customer_id,

          product_id,

          quantity,
        },
      );
    }

    await connection.commit();

    res.json({
      success: true,

      message: "Added to Cart",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,

      message: error.message,
    });
  } finally {
    if (connection) await connection.close();
  }
});

router.get("/cart/:customer_id", async (req, res) => {
  let connection;

  try {
    connection = await getOracle();

    const result = await connection.execute(
      `

SELECT


c.cart_id,


p.product_id,


p.product_name,


p.price,


c.quantity,


(p.price*c.quantity) AS TOTAL_PRICE,


s.shop_name



FROM cart c



JOIN products p

ON c.product_id=p.product_id



JOIN sellers s

ON p.seller_id=s.seller_id



WHERE c.customer_id=:customer_id



ORDER BY c.cart_id DESC



`,

      {
        customer_id: req.params.customer_id,
      },

      {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      },
    );

    res.json(result.rows);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,

      message: error.message,
    });
  } finally {
    if (connection) await connection.close();
  }
});

router.get("/delivery/:customer_id", async (req, res) => {
  let connection;

  try {
    connection = await getOracle();

    const result = await connection.execute(
      `

SELECT


d.delivery_id,


d.order_id,


d.delivery_address,


d.delivery_city,


d.delivery_status,


d.estimated_date,


d.delivered_date



FROM deliveries d



JOIN orders o

ON d.order_id=o.order_id



WHERE o.customer_id=:customer_id



ORDER BY d.delivery_id DESC



`,

      {
        customer_id: req.params.customer_id,
      },

      {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      },
    );

    res.json(result.rows);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,

      message: error.message,
    });
  } finally {
    if (connection) await connection.close();
  }
});

router.post("/payment", async (req, res) => {
  let connection;

  try {
    connection = await getOracle();

    const {
      order_id,

      payment_method,

      amount,
    } = req.body;

    await connection.execute(
      `

INSERT INTO payments

(

order_id,

payment_method,

payment_status,

amount

)


VALUES

(

:order_id,

:payment_method,

'PAID',

:amount

)



`,

      {
        order_id,

        payment_method,

        amount,
      },
    );

    await connection.commit();

    res.json({
      success: true,

      message: "Payment Successful",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,

      message: error.message,
    });
  } finally {
    if (connection) await connection.close();
  }
});

router.get("/profile/:id", async (req, res) => {
  let connection;

  try {
    connection = await getOracle();

    const result = await connection.execute(
      `
            SELECT
                CUSTOMER_ID,
                FULL_NAME,
                EMAIL,
                PHONE,
                ADDRESS,
                CITY,
                STATUS,
                CREATED_DATE
            FROM CUSTOMERS
            WHERE CUSTOMER_ID = :id
            `,

      { id: req.params.id },

      {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      },
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    if (connection) await connection.close();
  }
});

router.put("/profile/:id", async (req, res) => {
  let connection;

  try {
    connection = await getOracle();

    const { FULL_NAME, EMAIL, PHONE, ADDRESS, CITY } = req.body;

    await connection.execute(
      `
            UPDATE CUSTOMERS
            SET

                FULL_NAME = :FULL_NAME,
                EMAIL = :EMAIL,
                PHONE = :PHONE,
                ADDRESS = :ADDRESS,
                CITY = :CITY

            WHERE CUSTOMER_ID = :ID
            `,

      {
        FULL_NAME,
        EMAIL,
        PHONE,
        ADDRESS,
        CITY,
        ID: req.params.id,
      },

      {
        autoCommit: true,
      },
    );

    res.json({
      success: true,

      message: "Profile Updated Successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,

      message: error.message,
    });
  } finally {
    if (connection) await connection.close();
  }
});

module.exports = router;
