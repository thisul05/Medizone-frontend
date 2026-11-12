# Gemini forecasting

The panel always uses Google Gemini. Select an area, forecast type and horizon, then click Generate forecast. Preferred method, analysis mode, JSON editing and local demo output have been removed from the interface.

## Configuration

Create an ignored .env.local file at the project root:

```dotenv
GEMINI_API_KEY=your_private_api_key
GEMINI_MODEL=gemini-3.1-flash-lite
GEMINI_FALLBACK_MODELS=gemini-3.8-flash,gemini-2.5-flash-lite
```

Restart the development server after changing configuration. The key stays server-side and must never use a NEXT_PUBLIC_ prefix.

## Data and requests

POST /reports/api/forecast receives only area, type, horizon, branch and historical-window selections. The server chooses the corresponding small fictional dataset in src/data/forecasting.ts: inventory, revenue, staffing or disease-demand/refills. No uploaded data, database or fitted statistical model is required. Branch and historical-window selections provide context; they do not filter these fixed records. Method selection is automatic. Gemini is instructed to explain missing evidence and avoid fabricated predictions.

Requests have a shared 90-second deadline and individual 30-second deadlines. Transient 429/500/502/503/504 responses use exponential backoff and respect Retry-After. Up to four attempts are allowed. A timeout or 404 skips another attempt on the same model and moves to a configured alternative. Invalid requests and authentication failures stop immediately. If Gemini remains unavailable, the panel displays an error rather than substituting local output.

The underlying datasets are fictional and the analysis is illustrative. No weather, public-health or clinic data is fetched. Sales anomalies cannot confirm outbreaks. Add authentication and shared rate limiting before public deployment.

API reference: https://ai.google.dev/api/generate-content
