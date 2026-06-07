require("dotenv").config();
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    dialect: "mysql",
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

// Test connection
(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Connected to MySQL DB:", process.env.DB_NAME);
  } catch (err) {
    console.error("❌ DB connection error:", err);
  }
})();

module.exports = sequelize;


