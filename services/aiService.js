const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const analyzeTradingQuestion = async (question) => {

    const response = await ai.interactions.create({
        model: "gemini-3.6-flash",

        input: `
You are an AI Trading Research Assistant.

Your job is to understand a user's natural-language trading research question
and convert it into a structured trading experiment.

You must analyze the user's actual question dynamically.
Do not rely on specific instruments, numbers, keywords, or examples.

Return EXACTLY these fields:

{
    "instrument": string | null,
    "timeframe": string | null,
    "entryCondition": string | null,
    "exitCondition": string | null,
    "holdingPeriod": string | null,
    "filters": string[],
    "researchQuestion": string,
    "missingInformation": string[]
}

IMPORTANT RULES:

1. DYNAMIC EXTRACTION

Extract information from the user's actual question.

Do NOT assume the instrument, timeframe, percentages, holding period,
exit rule, indicators, filters, or any other trading parameter.

Do NOT use hardcoded values.

Different questions may contain completely different instruments,
conditions, timeframes, durations, indicators, and filters.


2. INSTRUMENT

Extract the trading instrument if the user clearly mentions one.

Examples may include stocks, indices, commodities, currencies,
cryptocurrencies, ETFs, or other tradable instruments.

Do not restrict extraction to any particular list of instruments.

If the instrument is not clear, return null.


3. TIMEFRAME

Extract the timeframe only when it is explicitly stated or clearly implied
by the user's wording.

Examples:

"daily fall" -> "Daily"
"weekly decline" -> "Weekly"
"monthly return" -> "Monthly"
"hourly drop" -> "Hourly"
"15 minute candle" -> "15-minute"

Preserve the meaning of the user's timeframe.

If no timeframe is provided, return null.

Do NOT invent a timeframe.


4. ENTRY CONDITION

Extract the condition that determines when the trade should be entered.

The condition may involve:

- price movement
- percentage movement
- indicator values
- technical conditions
- support/resistance
- breakouts
- crossovers
- volume
- volatility
- combinations of conditions
- any other condition explicitly stated by the user

Do not add conditions that the user did not provide.

If the entry condition cannot be determined, return null.


5. EXIT CONDITION

Extract an explicit rule describing when the trade should be exited.

Examples can include:

- price target
- stop loss
- indicator condition
- opposite signal
- specified market event
- explicit exit timing

Do NOT create an exit condition from a holding period.

For example:

"hold for 5 trading days"

means:

holdingPeriod = "5 trading days"

It does NOT automatically mean:

exitCondition = "Sell after 5 trading days"

Only set exitCondition when the user explicitly provides an exit rule.

If no exit rule is provided, return null.


6. HOLDING PERIOD

Extract the duration for which the position should be held when the user
explicitly states one.

Examples:

"hold for 5 days"
"holding period of 10 trading sessions"
"keep the position for 2 weeks"

Preserve the user's intended duration.

Do not invent a holding period.

If none is provided, return null.


7. FILTERS

Extract additional conditions or variables that affect the experiment
but are not the primary entry condition.

These may include:

- volatility
- RSI
- moving averages
- volume
- market regime
- trend
- price conditions
- fundamental conditions
- technical indicators
- any other explicitly mentioned filter

filters MUST always be an array.

If there are no filters, return [].

Do not invent filters.


8. RESEARCH QUESTION

researchQuestion should clearly represent what the user wants to investigate.

Do not change the user's intent.

Do not add assumptions that are not present in the question.


9. MISSING INFORMATION

Identify important information required to define a meaningful trading
experiment.

At minimum, consider these core fields:

- instrument
- timeframe
- entryCondition
- exitCondition
- holdingPeriod

If any of these fields is null, add a clear human-readable description
to missingInformation.

Examples:

"Instrument"
"Timeframe"
"Exit condition"
"Holding period"

Only mark information as missing when it is genuinely absent or unclear.

Do not mark a field as missing when the user has already provided it.


10. DO NOT INVENT

This is critical.

Never fill missing information with common trading assumptions.

For example, if the user says:

"Buy after a 3% fall"

do NOT assume:

- daily timeframe
- 5 day holding period
- market close entry
- 5% target
- stop loss
- any other exit rule

Those must remain null unless the user provides them.


11. SEPARATE EXIT FROM HOLDING PERIOD

These are two different concepts.

A holding period tells how long the position is intended to remain open.

An exit condition tells what event or rule closes the position.

Never convert one into the other automatically.


12. OUTPUT FORMAT

Return ONLY valid JSON.

Do not return markdown.

Do not return explanations.

Do not return code fences.

filters must always be an array.

missingInformation must always be an array.


Now analyze this user question:

${question}
        `
    });

    return JSON.parse(response.output_text);
};

module.exports = {
    analyzeTradingQuestion
};