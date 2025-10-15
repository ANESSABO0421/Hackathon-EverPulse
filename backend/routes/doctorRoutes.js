import express from "express";
import { registerDoctor, loginDoctor } from "../controllers/doctorController.js";

const doctorRouter = express.Router();

doctorRouter.post("/signup", registerDoctor);
doctorRouter.post("/login", loginDoctor);

export default doctorRouter;
