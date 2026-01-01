import express from "express";
import { getProducts, generateToken } from "../controllers/rakuten.controllers.mjs";

const router = express.Router();

router.post("/products", getProducts);
router.get("/token", generateToken);

export default router;
