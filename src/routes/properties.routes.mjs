import express from "express";

import { generateMLSToken , getProperties, getSavedProperties } from "../controllers/property.controller.mjs";

const router = express.Router();

router.get("/", getProperties);
router.get("/saved", getSavedProperties);
router.post("/token", generateMLSToken);


export default router;