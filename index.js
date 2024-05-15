import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import dbConnection from "./config/dbconnection.js";
import routes from "./routes/AdminRoutes.js";

dotenv.config();

// Database connection
dbConnection();

const app = express();
app.use(express.json());
app.use(cors());
app.use("/api/admin", routes);


const port = process.env.PORT;

app.listen(port, () => {
  console.log(port);
});
