# TradeLens — AI Trading Research Assistant

TradeLens is an AI-powered trading research assistant that converts natural-language trading questions into structured trading experiments.

Instead of directly assuming missing trading parameters, TradeLens uses AI to understand the user's question, extract the important experiment details, identify missing information, and ask the user for clarification before creating the final experiment.

---

## Project Overview

A user can ask a trading research question in natural language, for example:

> Does buying TCS after a 3% daily fall and holding for 5 trading days work better during high volatility?

TradeLens analyzes the question and identifies:

* Instrument
* Timeframe
* Entry condition
* Exit condition
* Holding period
* Filters / additional variables
* Research objective

If an important parameter is missing, the system does not blindly assume a value. Instead, it asks the user to provide the missing information.

The final result is displayed as a structured trading experiment.

---

## Workflow

```text
                 User Question
                       │
                       ▼
              ┌─────────────────┐
              │   AI Analysis   │
              │     Gemini      │
              └────────┬────────┘
                       │
                       ▼
          Extract Trading Parameters
                       │
          ┌────────────┴────────────┐
          │                         │
          ▼                         ▼
   Information Complete       Information Missing
          │                         │
          │                         ▼
          │                Clarification Page
          │                         │
          │                  User provides
          │                  missing details
          │                         │
          └────────────┬────────────┘
                       ▼
             Structured Experiment
                       │
                       ▼
                MongoDB Storage
```

---

## How It Works

### 1. Ask

The user enters a natural-language trading research question.

Example:

```text
Does buying TCS after a 3% daily fall and holding for 5 trading days work better during high volatility?
```

### 2. Understand

The AI analyzes the question and extracts the experiment parameters.

Example:

```text
Instrument: TCS
Timeframe: Daily
Entry Condition: 3% daily fall
Holding Period: 5 trading days
Filters: High volatility
```

### 3. Identify Missing Information

TradeLens checks whether important experiment parameters are missing.

For example, if the user does not specify an exit condition:

```text
Missing Information:
- Exit condition
```

The application asks the user to provide it instead of automatically inventing one.

### 4. Clarify

The user provides the missing information through the clarification form.

Example:

```text
Exit Condition:
Sell when the position reaches the defined exit rule.
```

### 5. Define

After clarification, TradeLens combines the AI-generated information with the user's answers and creates the final structured experiment.

### 6. Store

The completed experiment is stored in MongoDB using Mongoose.

### 7. Display

The final experiment is presented in a clean, readable UI.

---

## Key Design Decision: No Blind Assumptions

One of the main design goals of TradeLens is to avoid silently inventing important trading parameters.

For example, if a user says:

```text
Buy TCS after a 3% fall and hold for 5 trading days.
```

The system should understand:

```text
Instrument: TCS
Entry Condition: 3% fall
Holding Period: 5 trading days
```

But it should not automatically assume:

```text
Timeframe: Daily
Exit Condition: Sell after 5 days
Stop Loss: 2%
Target: 5%
```

unless those details are actually provided by the user or explicitly clarified.

This helps make the generated experiment more transparent and reliable.

---

## Filters

Filters are treated as optional experiment variables.

If the user provides additional conditions such as:

```text
during high volatility
```

the AI extracts:

```text
Filters:
- High volatility
```

If no additional filter is mentioned, TradeLens displays:

```text
No filters specified
```

The system does not force the user to provide a filter or invent one.

---

## Technology Stack

### Backend

* Node.js
* Express.js
* CommonJS

### Frontend

* EJS
* HTML
* CSS
* Bootstrap

### Database

* MongoDB Atlas
* Mongoose

### AI

* Google Gemini API
* `@google/genai`

### Other

* dotenv
* Nodemon
* Git / GitHub

---

## Project Structure

```text
TradeLens/
│
├── controllers/
│   └── research.js
│
├── models/
│   └── experiment.js
│
├── router/
│   └── research.js
│
├── services/
│   └── aiService.js
│
├── views/
│   ├── index.ejs
│   ├── clarify.ejs
│   ├── experiment.ejs
│   └── error.ejs
│
├── public/
│   └── css/
│       └── style.css
│
├── .env
├── .gitignore
├── app.js
├── package.json
└── README.md
```

---

## Architecture

TradeLens follows a simple MVC-style backend architecture with a separate AI service layer.

```text
User
 │
 ▼
EJS Interface
 │
 ▼
Express Router
 │
 ▼
Controller
 │
 ├──────────────► AI Service ─────► Gemini API
 │
 ▼
Experiment Model
 │
 ▼
MongoDB Atlas
```

### Router

Handles application routes and sends requests to the appropriate controller.

### Controller

Controls the application flow:

* validates the question
* calls the AI service
* checks missing information
* renders the clarification page when required
* creates and saves the final experiment

### AI Service

Responsible for communicating with Gemini and converting the user's natural-language question into structured JSON.

Keeping AI logic separate from the controller makes the application easier to maintain and extend.

### Model

The Mongoose model defines the structure used to store trading experiments in MongoDB.

---

## Environment Variables

Sensitive configuration is stored in a local `.env` file.

Example:

```env
PORT=8080

ATLASDB_URL=your_mongodb_atlas_connection_string

GEMINI_API_KEY=your_gemini_api_key
```

### Environment Variables Explained

| Variable         | Purpose                               |
| ---------------- | ------------------------------------- |
| `PORT`           | Port on which the Express server runs |
| `ATLASDB_URL`    | MongoDB Atlas connection string       |
| `GEMINI_API_KEY` | API key used to access Google Gemini  |

### Security

The `.env` file is intentionally excluded from Git using `.gitignore`.

```gitignore
node_modules/
.env
.DS_Store
```

**Do not commit `.env` or expose API keys in the repository.**

Anyone running the project locally should create their own `.env` file and provide their own MongoDB Atlas connection string and Gemini API key.

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Princedeve/TradLanse.git
```

Then enter the project directory:

```bash
cd TradLanse
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create `.env`

Create a `.env` file in the project root:

```env
PORT=8080
ATLASDB_URL=your_mongodb_atlas_connection_string
GEMINI_API_KEY=your_gemini_api_key
```

Replace the placeholder values with your own credentials.

### 4. Start the Application

For development:

```bash
npm run dev
```

Or:

```bash
node app.js
```

The application will run at:

```text
http://localhost:8080
```

---

## Example

### User Input

```text
Does buying TCS after a 3% daily fall and holding for 5 trading days work better during high volatility?
```

### Structured Experiment

```text
Instrument
TCS

Timeframe
Daily

Entry Condition
3% daily fall

Holding Period
5 trading days

Filters
High volatility
```

If an exit condition is not provided, TradeLens asks the user to clarify it before producing the final experiment.

---

## Current Scope

TradeLens is intentionally focused on the research-definition stage rather than being a complete trading platform.

The current prototype focuses on:

* Natural-language question understanding
* AI-based parameter extraction
* Missing-information detection
* User clarification
* Structured experiment generation
* Experiment persistence in MongoDB
* Human-readable experiment display

It does not attempt to provide a full production-grade trading or backtesting platform.

---

## Future Improvements

Possible future improvements include:

* Connecting structured experiments to a backtesting engine
* Adding historical market-data APIs
* Running experiments automatically
* Showing statistical results and performance metrics
* Adding transaction costs and slippage assumptions
* Supporting multiple experiment comparisons
* Adding experiment history and saved research
* Improving AI validation and structured output reliability

---

## AI Usage

Google Gemini is used to interpret natural-language trading questions and convert them into structured experiment parameters.

The AI is instructed to:

* Extract information from the user's actual question
* Avoid hardcoded trading assumptions
* Separate exit conditions from holding periods
* Identify missing information
* Preserve the user's research intent
* Return structured JSON for application processing

The application then performs its own validation of the AI-generated structure before continuing with the experiment workflow.

---

## Disclaimer

TradeLens is a prototype built for trading research and experimentation.

It does not provide financial advice, investment recommendations, or guaranteed trading strategies.
