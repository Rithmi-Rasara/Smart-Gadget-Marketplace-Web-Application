const express = require("express");

console.log("Seller route loaded");

const router = express.Router();

const oracledb = require("oracledb");

const { getOracle } = require("../config/oracle");

router.get("/products/:seller_id", async (req, res) => {
  let connection;

  try {
    connection = await getOracle();

    const result = await connection.execute(
      `
SELECT

p.product_id,
p.seller_id,
p.category_id,
p.product_name,
p.description,
p.price,
p.stock_quantity,
p.status,
p.created_date,
p.image_url,

c.category_name


FROM products p

LEFT JOIN categories c

ON p.category_id = c.category_id


WHERE p.seller_id=:seller_id


ORDER BY p.product_id DESC

`,

      {
        seller_id: req.params.seller_id,
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

router.post("/products", async (req, res) => {
  let connection;

  try {
    connection = await getOracle();

    const {
      product_name,
      category_id,
      price,
      stock_quantity,
      seller_id,
      description,
    } = req.body;

    await connection.execute(
      `
INSERT INTO products

(
seller_id,
category_id,
product_name,
description,
price,
stock_quantity,
status,
created_date
)

VALUES

(
:seller_id,
:category_id,
:product_name,
:description,
:price,
:stock_quantity,
'ACTIVE',
SYSDATE
)

`,

      {
        seller_id,
        category_id,
        product_name,
        description,
        price,
        stock_quantity,
      },
    );

    await connection.commit();

    res.json({
      success: true,

      message: "Product Added Successfully",
    });
  } catch (error) {
    console.log(error);

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

router.get("/product/:id", async (req, res) => {
  let connection;

  try {
    connection = await getOracle();

    const result = await connection.execute(
      `

SELECT

product_id,

product_name,

description,

price,

stock_quantity,

status

FROM products

WHERE product_id=:id


`,

      {
        id: req.params.id,
      },

      {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      },
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,

        message: "Product Not Found",
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
    if (connection) {
      await connection.close();
    }
  }
});

console.log("UPDATE ROUTE REGISTERED");

router.put("/products/:id", async (req, res) => {
  console.log("UPDATE ROUTE HIT");

  let connection;

  try {
    console.log("PRODUCT ID:", req.params.id);

    console.log("DATA:", req.body);

    connection = await getOracle();

    const result = await connection.execute(
      `

UPDATE products

SET

product_name=:product_name,

description=:description,

price=:price,

stock_quantity=:stock_quantity


WHERE product_id=:id


`,

      {
        product_name: req.body.product_name,

        description: req.body.description,

        price: req.body.price,

        stock_quantity: req.body.stock_quantity,

        id: req.params.id,
      },
    );

    console.log("ROWS:", result.rowsAffected);

    await connection.commit();

    res.json({
      success: true,

      message: "Product Updated Successfully",
    });
  } catch (error) {
    console.log(error);

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

router.delete("/products/:id", async (req, res) => {
  let connection;

  try {
    connection = await getOracle();

    await connection.execute(
      `

DELETE FROM products

WHERE product_id=:id

`,

      {
        id: req.params.id,
      },
    );

    await connection.commit();

    res.json({
      success: true,

      message: "Product Deleted",
    });
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

router.get("/orders/:seller_id", async (req, res) => {
  let connection;

  try {
    connection = await getOracle();

    const result = await connection.execute(
      `

SELECT


o.order_id,

o.order_date,

o.order_status,


c.full_name AS CUSTOMER_NAME,


p.product_name,


oi.quantity,


oi.unit_price,


oi.line_total,


d.delivery_id,


d.delivery_status,


d.estimated_date,


d.delivered_date



FROM orders o



JOIN order_items oi

ON o.order_id=oi.order_id



JOIN products p

ON oi.product_id=p.product_id



JOIN customers c

ON o.customer_id=c.customer_id



LEFT JOIN deliveries d

ON o.order_id=d.order_id



WHERE p.seller_id=:seller_id



ORDER BY o.order_date DESC


`,

      {
        seller_id: req.params.seller_id,
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

router.put("/delivery/update/:id", async (req, res) => {
  let connection;

  try {
    connection = await getOracle();

    const id = req.params.id;

    const status = req.body.status;

    await connection.execute(
      `

UPDATE deliveries

SET delivery_status=:status

WHERE delivery_id=:id


`,

      {
        status,

        id,
      },
    );

    if (status === "DELIVERED") {
      await connection.execute(
        `

UPDATE deliveries

SET delivered_date=SYSDATE

WHERE delivery_id=:id


`,

        {
          id,
        },
      );
    }

    await connection.commit();

    res.json({
      success: true,

      message: "Delivery Updated",
    });
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

router.get("/dashboard/:seller_id", async (req, res) => {
  let connection;

  try {
    connection = await getOracle();

    const result = await connection.execute(
      `

SELECT


COUNT(DISTINCT p.product_id) AS TOTAL_PRODUCTS,


COUNT(DISTINCT o.order_id) AS TOTAL_ORDERS,


NVL(SUM(oi.line_total),0) AS TOTAL_SALES



FROM products p


LEFT JOIN order_items oi

ON p.product_id=oi.product_id


LEFT JOIN orders o

ON oi.order_id=o.order_id



WHERE p.seller_id=:seller_id



`,

      {
        seller_id: req.params.seller_id,
      },

      {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      },
    );

    res.json(result.rows[0]);
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

router.put("/test/:id", (req, res) => {
  console.log("PUT ROUTE WORKING");

  res.json({
    success: true,

    message: "PUT working",
  });
});

router.get("/profile/:seller_id", async (req, res) => {
  console.log("PROFILE ROUTE HIT");
  console.log("Seller ID:", req.params.seller_id);

  let connection;

  try {
    connection = await getOracle();

    const result = await connection.execute(
      `
            SELECT *
            FROM sellers
            WHERE seller_id = :id
            `,
      {
        id: Number(req.params.seller_id),
      },
      {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      },
    );

    console.log(result.rows);

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Seller not found",
      });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: err.message,
    });
  } finally {
    if (connection) {
      await connection.close();
    }
  }
});

router.get("/hello", (req, res) => {
  res.send("Seller Route Working");
});

router.put("/profile/:seller_id", async (req, res) => {
  let connection;

  try {
    connection = await getOracle();

    const result = await connection.execute(
      `
UPDATE sellers

SET

shop_name=:shop_name,
owner_name=:owner_name,
email=:email,
phone=:phone,
address=:address,
city=:city

WHERE seller_id=:seller_id

`,

      {
        shop_name: req.body.shop_name,

        owner_name: req.body.owner_name,

        email: req.body.email,

        phone: req.body.phone,

        address: req.body.address,

        city: req.body.city,

        seller_id: req.params.seller_id,
      },
    );

    console.log("UPDATED ROWS:", result.rowsAffected);

    await connection.commit();

    if (result.rowsAffected === 0) {
      return res.status(404).json({
        success: false,

        message: "Seller not found",
      });
    }

    res.json({
      success: true,

      message: "Profile Updated Successfully",
    });
  } catch (error) {
    console.log(error);

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

router.put("/profile/:seller_id", async (req, res) => {
  let connection;

  try {
    connection = await getOracle();

    await connection.execute(
      `
UPDATE sellers

SET

shop_name=:shop_name,
owner_name=:owner_name,
email=:email,
phone=:phone,
address=:address,
city=:city

WHERE seller_id=:seller_id
`,

      {
        shop_name: req.body.shop_name,
        owner_name: req.body.owner_name,
        email: req.body.email,
        phone: req.body.phone,
        address: req.body.address,
        city: req.body.city,
        seller_id: req.params.seller_id,
      },
    );

    await connection.commit();

    res.json({
      success: true,
      message: "Profile Updated",
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
