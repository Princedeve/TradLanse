const express = require("express");
const router = express.Router();

const researchController = require("../controllers/research.js");

router.get("/", researchController.renderHome);

router.post("/analyze", researchController.analyzeQuestion);

router.post("/clarify", researchController.clarifyExperiment);

module.exports = router;