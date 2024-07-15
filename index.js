import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import dbConnection from "./config/dbconnection.js";
import routes from "./routes/AdminRoutes.js";
import userRoutes from "./routes/UserRoutes.js";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database connection
dbConnection();

const app = express();
app.use(express.json());
app.use(cors());
app.use("/api/admin", routes);
app.use("/api/user", userRoutes);
app.get("/", (req, res) => {
    res.sendFile(__dirname + '/src/view/index.html');
})

app.use("/api", express.static(path.join(__dirname, "")));




const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(port);
});
