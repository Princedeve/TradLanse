const mongoose = require("mongoose");

const experimentSchema = new mongoose.Schema(
    {
        question: {
            type: String,
            required: true,
            trim: true
        },

        instrument: {
            type: String,
            default: null
        },

        timeframe: {
            type: String,
            default: null
        },

        entryCondition: {
            type: String,
            default: null
        },

        exitCondition: {
            type: String,
            default: null
        },

        holdingPeriod: {
            type: String,
            default: null
        },

        filters: {
            type: [String],
            default: []
        },

        researchQuestion: {
            type: String,
            default: null
        },

        missingInformation: {
            type: [String],
            default: []
        }
    },
    {
        timestamps: true
    }
);

const Experiment = mongoose.model("Experiment", experimentSchema);

module.exports = Experiment;