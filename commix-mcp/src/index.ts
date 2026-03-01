import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { spawn } from 'child_process';

const args = process.argv.slice(2);
if (args.length !== 2) {
    console.error("Usage: commix-mcp [python path] [commix.py path]");
    process.exit(1);
}

const server = new McpServer({
    name: "commix",
    version: "1.0.0",
});

server.tool(
    "do-commix",
    "Run Commix to detect and exploit command injection vulnerabilities. Commix (short for [comm]and [i]njection [e]xploiter) is an open source penetration testing tool, written by Anastasios Stasinopoulos, that automates the detection and exploitation of command injection vulnerabilities in certain software.",
    {
        url: z.string().url().describe("Target URL to detect command injection (e.g., http://192.168.1.1/vuln.php?id=1)"),
        commix_args: z.array(z.string()).optional().describe("Additional commix arguments (e.g., ['--batch', '--crawl=1'])")
    },
    async ({ url, commix_args = [] }) => {
        const pythonPath = args[0];
        const commixPath = args[1];

        // Ensure --batch is included for non-interactive use in MCP
        const finalArgs = [commixPath, "-u", url, "--batch", ...commix_args];

        let output = '';

        const commix = spawn(pythonPath, finalArgs);

        commix.stdout.on('data', (data) => {
            output += data.toString();
        });

        commix.stderr.on('data', (data) => {
            output += data.toString();
        });

        return new Promise((resolve, reject) => {
            commix.on('close', (code) => {
                output = removeAnsiCodes(output);

                resolve({
                    content: [{
                        type: "text",
                        text: output + `\n\nCommix process finished with exit code ${code}`
                    }]
                });
            });

            commix.on('error', (error) => {
                reject(new Error(`Failed to start commix: ${error.message}`));
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
    console.error("Commix MCP Server running on stdio");
}

main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});