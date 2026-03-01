# WAFW00F MCP Server

MCP server for WAFW00F (Web Application Firewall Fingerprinting Tool).

## Features

- **detect-waf**: Identify and fingerprint Web Application Firewall (WAF) products.

## Installation

### Prerequisites

- WAFW00F must be installed on your system.
  ```bash
  pip install wafw00f
  ```

### Build

```bash
npm install
npm run build
```

## Usage

Add the server to your MCP client configuration (e.g., Claude Desktop):

```json
{
  "mcpServers": {
    "wafw00f": {
      "command": "node",
      "args": ["/path/to/wafw00f-mcp/build/index.js", "wafw00f"]
    }
  }
}
```
