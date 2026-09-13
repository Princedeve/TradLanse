const { analyzeTradingQuestion } = require("../services/aiService.js");
const Experiment = require("../models/experiment.js");

// HOME PAGE

module.exports.renderHome = (req, res) => {
    res.render("index.ejs");
};

// ANALYZE USER'S TRADING QUESTION

module.exports.analyzeQuestion = async (req, res) => {

    try {

        const { question } = req.body;


        // Validate question
        if (!question || !question.trim()) {
            return res.status(400).send("Question is required.");
        }


        console.log("User Question:", question);


        // Ask Gemini to understand the question
        const aiResult = await analyzeTradingQuestion(question);


        console.log("AI Result:", aiResult);

        // DYNAMIC MISSING INFORMATION CHECK

        const missingInformation = [
            ...(aiResult.missingInformation || [])
        ];


        // Check important fields directly.
        // These checks are dynamic and are NOT based
        // on specific instruments or question words.

        if (
            !aiResult.instrument &&
            !missingInformation.includes("Instrument")
        ) {
            missingInformation.push("Instrument");
        }


        if (
            !aiResult.timeframe &&
            !missingInformation.includes("Timeframe")
        ) {
            missingInformation.push("Timeframe");
        }


        if (
            !aiResult.entryCondition &&
            !missingInformation.includes("Entry condition")
        ) {
            missingInformation.push("Entry condition");
        }


        if (
            !aiResult.exitCondition &&
            !missingInformation.includes("Exit condition")
        ) {
            missingInformation.push("Exit condition");
        }


        if (
            !aiResult.holdingPeriod &&
            !missingInformation.includes("Holding period")
        ) {
            missingInformation.push("Holding period");
        }


        console.log(
            "Final Missing Information:",
            missingInformation
        );


        // -----------------------------------------
        // ASK USER FOR CLARIFICATION
        // -----------------------------------------

        if (missingInformation.length > 0) {

            return res.render("clarify.ejs", {

                experiment: {

                    question: question.trim(),

                    instrument:
                        aiResult.instrument || null,

                    timeframe:
                        aiResult.timeframe || null,

                    entryCondition:
                        aiResult.entryCondition || null,

                    exitCondition:
                        aiResult.exitCondition || null,

                    holdingPeriod:
                        aiResult.holdingPeriod || null,

                    filters:
                        Array.isArray(aiResult.filters)
                            ? aiResult.filters
                            : [],

                    researchQuestion:
                        aiResult.researchQuestion ||
                        question.trim(),

                    missingInformation
                }
            });
        }

        // ALL REQUIRED INFORMATION AVAILABLE

        const experiment = new Experiment({

            question: question.trim(),

            instrument:
                aiResult.instrument,

            timeframe:
                aiResult.timeframe,

            entryCondition:
                aiResult.entryCondition,

            exitCondition:
                aiResult.exitCondition,

            holdingPeriod:
                aiResult.holdingPeriod,

            filters:
                Array.isArray(aiResult.filters)
                    ? aiResult.filters
                    : [],

            researchQuestion:
                aiResult.researchQuestion,

            missingInformation: []
        });


        await experiment.save();


        console.log(
            "Experiment saved:",
            experiment._id
        );


        // Show final experiment
        res.render("experiment.ejs", {
            experiment
        });


    } catch (err) {

        console.error("AI Error:", err);

        // GEMINI QUOTA / RATE LIMIT ERROR

        const errorMessage =
            err?.message || "";


        if (
            errorMessage.includes("quota") ||
            errorMessage.includes("too_many_requests") ||
            errorMessage.includes("429") ||
            err?.code === "too_many_requests"
        ) {

            return res.status(429).render("error.ejs", {

                title: "AI Limit Reached",

                message:
                    "The AI service has temporarily reached its usage limit. Please try again later."
            });
        }

        // OTHER AI / SERVER ERROR

        return res.status(500).render("error.ejs", {

            title: "Something went wrong",

            message:
                "We couldn't analyze your trading question right now. Please try again."
        });
    }
};

// PROCESS CLARIFICATION

module.exports.clarifyExperiment = async (req, res) => {

    try {

        const {
            question,
            instrument,
            entryCondition,
            filters,
            researchQuestion,
            timeframe,
            exitCondition,
            holdingPeriod
        } = req.body;

        // CONVERT FILTERS INTO ARRAY

        const filterArray = filters
            ? filters
                .split("|")
                .map(filter => filter.trim())
                .filter(Boolean)
            : [];

        // CREATE FINAL EXPERIMENT

        const experiment = new Experiment({

            question:
                question?.trim(),

            instrument:
                instrument || null,

            timeframe:
                timeframe || null,

            entryCondition:
                entryCondition || null,

            exitCondition:
                exitCondition || null,

            holdingPeriod:
                holdingPeriod || null,

            filters:
                filterArray,

            researchQuestion:
                researchQuestion ||
                question?.trim(),

            missingInformation: []
        });


        // Save experiment
        await experiment.save();


        console.log(
            "Final experiment saved:",
            experiment._id
        );


        // Show final experiment
        res.render("experiment.ejs", {
            experiment
        });


    } catch (err) {

        console.error(
            "Clarification Error:",
            err
        );


        res.status(500).send(
            "Unable to process clarification."
        );
    }
};