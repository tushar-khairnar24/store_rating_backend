require("dotenv").config();
const express = require("express");
const { sequelize } = require("./models");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const authenticateToken = require("./middleware/authMiddleware");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(helmet());

// ✅ Fixed: Vite runs on 5173, not 3000
// const allowedOrigins = ["http://localhost:5173", "https://store-rating-app-beta.vercel.app",];
// const allowedOrigins = ["*"];
// app.use(
//   cors({
//     origin: allowedOrigins,
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     credentials: true,
//   })
// );


app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        "http://localhost:5173",
        "https://store-rating-app-beta.vercel.app",
      ];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);



app.use(express.json());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    status: 429,
    error: "Too many requests, please try again later.",
  },
});

app.use("/auth", apiLimiter);
app.use("/ratings", apiLimiter);

app.use("/auth", require("./routes/auth"));
app.use("/users", require("./routes/users"));
app.use("/stores", require("./routes/stores"));
app.use("/ratings", require("./routes/ratings"));

app.get("/dashboard", authenticateToken, (req, res) => {
  res.json({
    message: `Hello ${req.user.email}, you have access to the dashboard!`,
    user: req.user,
  });
});

app.get("/", (req, res) => {
  res.send("✅ Server is running...");
});

sequelize
  .authenticate()
  .then(() => {
    console.log("✅ Database connected");
    return sequelize.sync({ alter: false });
  })
  .then(() => {
    console.log("✅ All models synced with database");
    app.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err);
  });
