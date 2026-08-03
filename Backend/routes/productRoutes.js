const express = require("express");
const router = express.Router();

const { getOracle } = require("../config/oracle");
const oracledb = require("oracledb");

router.get("/", async (req, res) => {
  let connection;

  try {
    connection = await getOracle();

    const result = await connection.execute(
      `
            SELECT

                p.product_id,
                p.product_name,
                p.price,
                p.stock_quantity,

                c.category_name,

                s.shop_name

            FROM products p

            JOIN categories c
            ON p.category_id = c.category_id

            JOIN sellers s
            ON p.seller_id = s.seller_id

            WHERE p.status = 'ACTIVE'
            AND p.stock_quantity > 0

            ORDER BY p.product_name
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
    if (connection) {
      await connection.close();
    }
  }
});

module.exports = router;
