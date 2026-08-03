const express = require("express");

console.log("Seller route loaded");
const cors = require("cors");
const path = require("path");

const oracledb = require("oracledb");

const connectMongoDB = require("./config/mongodb");
const { getOracle } = require("./config/oracle");

const adminRoutes = require("./routes/adminRoutes");
const customerRoutes = require("./routes/customerRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const sellerRoutes = require("./routes/sellerRoutes");

console.log("SELLER ROUTES LOADED");

const Log = require("./models/Log");

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "../frontend")));

app.use("/api/admin", adminRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/seller", sellerRoutes);

app.use(express.static(path.join(__dirname, "../Frontend")));

connectMongoDB();

app.post("/api/register", async (req, res) => {
  let connection;

  const { full_name, email, username, password, phone, role } = req.body;

  if (!full_name || !email || !username || !password || !role) {
    return res.status(400).json({
      success: false,

      message: "All fields are required",
    });
  }

  const userRole = role.toUpperCase();

  if (userRole !== "CUSTOMER" && userRole !== "SELLER") {
    return res.status(400).json({
      success: false,

      message: "Invalid Role",
    });
  }

  try {
    connection = await getOracle();

    const checkUser = await connection.execute(
      `
            SELECT username
            FROM user_accounts
            WHERE username=:username
            `,

      {
        username,
      },
    );

    if (checkUser.rows.length > 0) {
      return res.status(409).json({
        success: false,

        message: "Username already exists",
      });
    }

    const checkEmail = await connection.execute(
      `
SELECT email
FROM customers
WHERE email=:email

UNION

SELECT email
FROM sellers
WHERE email=:email
`,

      {
        email,
      },
    );

    if (checkEmail.rows.length > 0) {
      return res.status(409).json({
        success: false,

        message: "Email already exists",
      });
    }

    let customer_id = null;

    let seller_id = null;

    if (userRole === "CUSTOMER") {
      const customer = await connection.execute(
        `
            INSERT INTO customers

            (
                full_name,
                email,
                phone,
                status
            )

            VALUES

            (
                :full_name,
                :email,
                :phone,
                'ACTIVE'
            )


            RETURNING customer_id INTO :customer_id

            `,

        {
          full_name,

          email,

          phone,

          customer_id: {
            dir: oracledb.BIND_OUT,

            type: oracledb.NUMBER,
          },
        },
      );

      customer_id = customer.outBinds.customer_id[0];

      await connection.execute(
        `
            INSERT INTO user_accounts

            (
                username,
                password,
                role,
                customer_id,
                status
            )

            VALUES

            (
                :username,
                :password,
                'CUSTOMER',
                :customer_id,
                'ACTIVE'
            )

            `,

        {
          username,

          password,

          customer_id,
        },
      );
    }

    if (userRole === "SELLER") {
      const seller = await connection.execute(
        `
            INSERT INTO sellers

            (
                shop_name,
                owner_name,
                email,
                phone,
                status
            )


            VALUES

            (
                :shop_name,
                :owner_name,
                :email,
                :phone,
                'PENDING'
            )


            RETURNING seller_id INTO :seller_id

            `,

        {
          shop_name: full_name + " Shop",

          owner_name: full_name,

          email,

          phone,

          seller_id: {
            dir: oracledb.BIND_OUT,

            type: oracledb.NUMBER,
          },
        },
      );

      seller_id = seller.outBinds.seller_id[0];

      await connection.execute(
        `
            INSERT INTO user_accounts

            (
                username,
                password,
                role,
                seller_id,
                status
            )

            VALUES

            (
                :username,
                :password,
                'SELLER',
                :seller_id,
                'ACTIVE'
            )

            `,

        {
          username,

          password,

          seller_id,
        },
      );
    }

    await connection.commit();

    await Log.create({
      username,

      role: userRole,

      action: "REGISTER",

      date: new Date(),
    });

    res.json({
      success: true,

      message: "Registration Successful",
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

app.post("/api/login", async (req, res) => {
  let connection;

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Username and Password required",
    });
  }

  try {
    connection = await getOracle();

    const result = await connection.execute(
      `
        SELECT 
            user_id,
            username,
            role,
            customer_id,
            seller_id

        FROM user_accounts

        WHERE username=:username

        AND password=:password

        AND status='ACTIVE'
        `,

      {
        username,
        password,
      },

      {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      },
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,

        message: "Invalid Username or Password",
      });
    }

    const user = result.rows[0];

    await Log.create({
      username: user.USERNAME,

      role: user.ROLE,

      action: "LOGIN",

      date: new Date(),
    });

    res.json({
      success: true,

      message: "Login Successful",

      user: user,
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

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on port ${process.env.PORT || 3000}`);
});
