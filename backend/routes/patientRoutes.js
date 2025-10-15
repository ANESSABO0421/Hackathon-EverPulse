import express from "express";
import { registerPatient, loginPatient } from "../controllers/patientController.js";

const patientRouter = express.Router();

patientRouter.post("/signup", registerPatient);
patientRouter.post("/login", loginPatient);

export default patientRouter;
