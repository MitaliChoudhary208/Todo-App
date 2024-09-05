import express from "express";
import dotenv from "dotenv";
import UserRoutes from "./routes/userRoutes.js";
import TaskRoutes from "./routes/taskRoutes.js"
import mongoose from "mongoose";
import cors from "cors";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());

mongoose
  .connect(`mongodb://localhost:27017/${process.env.DB_NAME}`)
  .then(() => console.log("Database connected"))
  .catch((err) => console.log(err));

app.use(express.json());
app.use(UserRoutes);
app.use(TaskRoutes);

app.listen(PORT, (err) => {
  if (err) {
    throw Error(err);
  } else {
    console.log(`Server is running at http://localhost:${PORT}`);
  }
});
