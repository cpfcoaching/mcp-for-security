import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import axios from 'axios';
import removeHeadersData from "./owasp_headers_remove.json";
import addHeadersData from "./owasp_headers_add.json";

// Create server instance
const server = new McpServer({
    name: "http-headers-security",
    version: "1.0.1",
});

interface HeaderRecommendation {
    header: string;
    reason: string;
}

async function fetchHttpHeaders(target: string): Promise<Record<string, string>> {
    try {
        const response = await axios.get(target, {
            timeout: 30000,
            validateStatus: () => true, // Accept all status codes
            headers: {
                'User-Agent': 'Mozilla/5.0 (MCP Security Scanner; https://github.com/cyproxio/mcp-for-security)'
            }
        });

        // Convert header values to string if they are arrays
        const headers: Record<string, string> = {};
        for (const [key, value] of Object.entries(response.headers)) {
            headers[key.toLowerCase()] = Array.isArray(value) ? value.join(', ') : (value || '');
        }
        return headers;
    } catch (error: any) {
        throw new Error(`Failed to fetch headers from ${target}: ${error.message}`);
    }
}

server.tool(
    "analyze-http-header",
    "Perform a security analysis of HTTP response headers against OWASP best practices. Identifies dangerous headers to remove and critical security headers to add.",
    {
        target: z.string().url().describe("Target URL to analyze (e.g., https://example.com)"),
    },
    async ({ target }) => {
        try {
            const currentHeaders = await fetchHttpHeaders(target);

            // Analyze headers to remove
            const headersToRemove = removeHeadersData.headers
                .filter(h => currentHeaders[h.toLowerCase()] !== undefined)
                .map(h => ({
                    header: h,
                    value: currentHeaders[h.toLowerCase()]
                }));

            // Analyze headers to add
            const headersToAdd = addHeadersData.headers
                .filter(h => currentHeaders[h.name.toLowerCase()] === undefined)
                .map(h => ({
                    header: h.name,
                    recommendedValue: h.value
                }));

            const result = {
                target,
                summary: {
                    totalCurrentHeaders: Object.keys(currentHeaders).length,
                    issuesFound: headersToRemove.length + headersToAdd.length,
                    criticalMissing: headersToAdd.length
                },
                recommendations: {
                    remove: headersToRemove.length > 0 ? headersToRemove : "No dangerous headers detected.",
                    add: headersToAdd.length > 0 ? headersToAdd : "All recommended security headers are present."
                },
                rawHeaders: currentHeaders
            };

            return {
                content: [{
                    type: "text",
                    text: JSON.stringify(result, null, 2)
                }]
            };
        } catch (error: any) {
            return {
                isError: true,
                content: [{
                    type: "text",
                    text: `Error analyzing headers: ${error.message}`
                }]
            };
        }
    }
);

// Start the server
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("http-headers-security MCP Server running on stdio");
}

main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});