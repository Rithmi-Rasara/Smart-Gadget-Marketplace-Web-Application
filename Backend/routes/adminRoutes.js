const express = require("express");
const router = express.Router();
const oracledb = require("oracledb");
const { getOracle } = require("../config/oracle");

router.get("/orders/:id", async (req, res) => {
  console.log("ORDER DETAILS ROUTE HIT");

  let connection;

  try {
    const order_id = Number(req.params.id);

    if (!order_id) {
      return res.status(400).json({
        success: false,

        message: "Invalid Order ID",
      });
    }

    connection = await getOracle();

    const orderResult = await connection.execute(
      `
SELECT

o.ORDER_ID,
c.FULL_NAME AS CUSTOMER_NAME,
c.EMAIL,
c.PHONE,
c.ADDRESS,
c.CITY,
o.ORDER_DATE,
o.TOTAL_AMOUNT,
o.ORDER_STATUS

FROM ORDERS o

JOIN CUSTOMERS c

ON o.CUSTOMER_ID = c.CUSTOMER_ID

WHERE o.ORDER_ID = :id

`,

      {
        id: order_id,
      },

      {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      },
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,

        message: "Order Not Found",
      });
    }

    const itemsResult = await connection.execute(
      `

SELECT

p.PRODUCT_NAME,

oi.QUANTITY,

oi.UNIT_PRICE,

oi.LINE_TOTAL

FROM ORDER_ITEMS oi

JOIN PRODUCTS p

ON oi.PRODUCT_ID = p.PRODUCT_ID

WHERE oi.ORDER_ID = :id

`,

      {
        id: order_id,
      },

      {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      },
    );

    const deliveryResult = await connection.execute(
      `

SELECT

DELIVERY_ADDRESS,

DELIVERY_CITY,

DELIVERY_STATUS,

ESTIMATED_DATE,

DELIVERED_DATE

FROM DELIVERIES

WHERE ORDER_ID = :id

`,

      {
        id: order_id,
      },

      {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      },
    );

    res.json({
      success: true,

      order: orderResult.rows[0],

      items: itemsResult.rows,

      delivery: deliveryResult.rows[0] || null,
    });
  } catch (error) {
    console.log("ORDER DETAILS ERROR:", error);

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

module.exports = router;