# Security Resources MCP Server

MCP server providing security resources, checklists, and guides.

## Resources

- **owasp-top-10**: Summary of the OWASP Top 10 web application security risks.
- **recon-checklist**: Checklist for effectively performing security reconnaissance.

## Installation

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
    "security-resources": {
      "command": "node",
      "args": ["/path/to/security-resources-mcp/build/index.js"]
    }
  }
}
```
