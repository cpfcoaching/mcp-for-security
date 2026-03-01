import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { spawn } from 'child_process';

const args = process.argv.slice(2);
if (args.length === 0) {
    console.error("Usage: wafw00f-mcp <wafw00f binary>");
    process.exit(1);
}

const server = new McpServer({
    name: "wafw00f",
    version: "1.0.0",
});

server.tool(
    "detect-waf",
    "Identify and fingerprint Web Application Firewall (WAF) products protecting a website. WAFW00F sends various HTTP requests and analyzes responses to detect presence and type of WAF.",
    {
        target: z.string().url().describe("Target URL to check for WAF (e.g., https://example.com)"),
        wafw00f_args: z.array(z.string()).optional().describe("Additional wafw00f arguments (e.g., ['-a', '-v'])")
    },
    async ({ target, wafw00f_args = [] }) => {
        const wafw00fPath = args[0];
        const finalArgs = [target, ...wafw00f_args];

        let output = '';

        const process = spawn(wafw00fPath, finalArgs);

        process.stdout.on('data', (data) => {
            output += data.toString();
        });

        process.stderr.on('data', (data) => {
            output += data.toString();
        });

        return new Promise((resolve, reject) => {
            process.on('close', (code) => {
                output = removeAnsiCodes(output);

                resolve({
                    content: [{
                        type: "text",
                        text: output + `\n\nWAFW00F process finished with exit code ${code}`
                    }]
                });
            });

            process.on('error', (error) => {
                reject(new Error(`Failed to start wafw00f: ${error.message}`));
            });
        });
    },
);

function removeAnsiCodes(input: string): string {
    return input.replace(/\x1B\[[0-9;]*[mGK]/g, '');
}

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("WAFW00F MCP Server running on stdio");
}

main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
