import express from "express";
import { registerAdmin, loginAdmin } from "../controllers/adminController.js";

const adminRouter = express.Router();

adminRouter.post("/signup", registerAdmin);
adminRouter.post("/login", loginAdmin);

export default adminRouter;
