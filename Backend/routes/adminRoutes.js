const express = require("express");
const router = express.Router();
const oracledb = require("oracledb");
const { getOracle } = require("../config/oracle");

router.get("/dashboard", async (req, res) => {
  let connection;

  try {
    connection = await getOracle();

    const result = await connection.execute(
      `
SELECT
(SELECT COUNT(*) FROM products) AS TOTAL_PRODUCTS,
(SELECT COUNT(*) FROM customers) AS TOTAL_CUSTOMERS,
(SELECT COUNT(*) FROM orders) AS TOTAL_ORDERS,
(SELECT NVL(SUM(total_amount),0) FROM orders) AS TOTAL_REVENUE
FROM dual
`,
      {},
      {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      },
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.log("ADMIN DASHBOARD ERROR:", error);

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

router.get("/orders", async (req, res) => {
  let connection;

  try {
    connection = await getOracle();

    const result = await connection.execute(
      `
SELECT
    o.ORDER_ID,
    c.FULL_NAME AS CUSTOMER_NAME,
    o.ORDER_DATE,
    o.TOTAL_AMOUNT,
    o.ORDER_STATUS,
    NVL(d.DELIVERY_STATUS, 'PENDING') AS DELIVERY_STATUS
FROM ORDERS o
JOIN CUSTOMERS c
    ON o.CUSTOMER_ID = c.CUSTOMER_ID
LEFT JOIN DELIVERIES d
    ON o.ORDER_ID = d.ORDER_ID
ORDER BY o.ORDER_DATE DESC
`,
      {},
      {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      }
    );

    res.json(result.rows);

  } catch (error) {
    console.log("ADMIN ORDERS ERROR:", error);

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

router.get("/sellers", async (req, res) => {
  let connection;

  try {
    connection = await getOracle();

    const result = await connection.execute(
      `
SELECT
SELLER_ID,
SHOP_NAME,
OWNER_NAME,
EMAIL,
PHONE,
CITY,
STATUS
FROM SELLERS
ORDER BY SELLER_ID DESC
`,
      {},
      {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      },
    );

    res.json(result.rows);
  } catch (error) {
    console.log("ADMIN SELLERS ERROR:", error);

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

router.put("/sellers/:id", async (req, res) => {
  let connection;

  try {
    const { status } = req.body;

    if (!status || !["APPROVED", "REJECTED", "PENDING"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Status",
      });
    }

    connection = await getOracle();

    const result = await connection.execute(
      `
UPDATE SELLERS
SET STATUS = :status
WHERE SELLER_ID = :id
`,
      {
        status,
        id: Number(req.params.id),
      },
    );

    await connection.commit();

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        message: "Seller Not Found",
      });
    }

    res.json({
      success: true,
      message: "Seller Status Updated",
    });
  } catch (error) {
    console.log("ADMIN SELLER UPDATE ERROR:", error);

    if (connection) {
      await connection.rollback();
    }

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

router.get("/reports", async (req, res) => {
  let connection;

  try {
    connection = await getOracle();

    const summaryResult = await connection.execute(
      `
SELECT
(SELECT COUNT(*) FROM customers) AS CUSTOMERS,
(SELECT COUNT(*) FROM sellers) AS SELLERS,
(SELECT COUNT(*) FROM products) AS PRODUCTS,
(SELECT COUNT(*) FROM orders) AS ORDERS,
(SELECT NVL(SUM(total_amount),0) FROM orders) AS REVENUE
FROM dual
`,
      {},
      {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      },
    );

    const topProductsResult = await connection.execute(
      `
SELECT
p.PRODUCT_NAME,
SUM(oi.QUANTITY) AS QUANTITY_SOLD,
SUM(oi.LINE_TOTAL) AS REVENUE
FROM ORDER_ITEMS oi
JOIN PRODUCTS p
ON oi.PRODUCT_ID = p.PRODUCT_ID
GROUP BY p.PRODUCT_NAME
ORDER BY SUM(oi.QUANTITY) DESC
FETCH FIRST 5 ROWS ONLY
`,
      {},
      {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      },
    );

    res.json({
      ...summaryResult.rows[0],
      topProducts: topProductsResult.rows,
    });
  } catch (error) {
    console.log("ADMIN REPORTS ERROR:", error);

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

router.get("/products", async (req, res) => {
  let connection;

  try {
    connection = await getOracle();

    const result = await connection.execute(
      `
SELECT
p.PRODUCT_ID,
p.PRODUCT_NAME,
p.PRICE,
p.STOCK_QUANTITY,
p.STATUS,
c.CATEGORY_NAME,
s.SHOP_NAME
FROM PRODUCTS p
LEFT JOIN CATEGORIES c
ON p.CATEGORY_ID = c.CATEGORY_ID
LEFT JOIN SELLERS s
ON p.SELLER_ID = s.SELLER_ID
ORDER BY p.PRODUCT_ID DESC
`,
      {},
      {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      },
    );

    res.json(result.rows);
  } catch (error) {
    console.log("ADMIN PRODUCTS ERROR:", error);

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

router.delete("/products/:id", async (req, res) => {
  let connection;

  try {
    connection = await getOracle();

    const result = await connection.execute(
      `
DELETE FROM PRODUCTS
WHERE PRODUCT_ID = :id
`,
      {
        id: Number(req.params.id),
      },
    );

    await connection.commit();

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        message: "Product Not Found",
      });
    }

    res.json({
      success: true,
      message: "Product Deleted",
    });
  } catch (error) {
    console.log("ADMIN PRODUCT DELETE ERROR:", error);

    if (connection) {
      await connection.rollback();
    }

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
