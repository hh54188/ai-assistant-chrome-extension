# OpenAI Cost MCP Tool

This MCP tool provides functionality to fetch and analyze OpenAI API costs for different time periods.

## Features

- Fetch OpenAI costs for week, month, or year periods
- Calculate total costs from API usage data
- Error handling and validation
- MCP-compatible tool interface

## Usage

The tool can be called with the following parameters:

- `period`: Time period to fetch costs for (default: "month")
  - Valid values: "week", "month", "year"

## Response Format

The tool returns a structured response with:

- `success`: Boolean indicating if the operation was successful
- `period`: The time period requested
- `totalCost`: Total cost in USD
- `currency`: Currency (always USD)
- `message`: Human-readable summary
- `error`: Error message (if success is false)

## Example Response

```json
{
  "success": true,
  "period": "month",
  "totalCost": 15.67,
  "currency": "USD",
  "message": "Total OpenAI costs for month: $15.67"
}
```

## Dependencies

- `dayjs`: For date manipulation and Unix timestamp conversion
- OpenAI API access with valid API key

## Security Note

The API key is currently hardcoded in the module. In production, this should be moved to environment variables or a secure configuration system.
