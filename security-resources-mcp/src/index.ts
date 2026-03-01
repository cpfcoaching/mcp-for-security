import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new McpServer({
    name: "security-resources",
    version: "1.0.0",
});

// Resource: OWASP Top 10 Summary
server.resource(
    "owasp-top-10",
    "mcp://security/owasp-top-10",
    { description: "Summary of the OWASP Top 10 web application security risks" },
    async (uri) => ({
        contents: [{
            uri: uri.href,
            text: `OWASP Top 10 (2021) Summary:

1. A01:2021-Broken Access Control: Navigation to unauthorized pages, metadata manipulation, or bypass access control checks.
2. A02:2021-Cryptographic Failures: Exposure of sensitive data due to weak encryption or improper key management.
3. A03:2021-Injection: SQL, NoSQL, OS, and LDAP injection occur when untrusted data is sent to an interpreter as part of a command or query.
4. A04:2021-Insecure Design: Focuses on risks related to design and architectural flaws.
5. A05:2021-Security Misconfiguration: Insecure default configurations, open cloud storage, misconfigured HTTP headers, and verbose error messages.
6. A06:2021-Vulnerable and Outdated Components: Using components that are unsupported or have known vulnerabilities.
7. A07:2021-Identification and Authentication Failures: Poor session management, credential stuffing, or lack of multi-factor authentication.
8. A08:2021-Software and Data Integrity Failures: Code and infrastructure that does not protect against integrity violations (e.g., insecure CI/CD pipelines).
9. A09:2021-Security Logging and Monitoring Failures: Insufficient logging and monitoring can allow attacks to go undetected.
10. A10:2021-Server-Side Request Forgery (SSRF): Occurs whenever a web application is fetching a remote resource without validating the user-supplied URL.`
        }]
    })
);

// Resource: Security Recon Checklist
server.resource(
    "recon-checklist",
    "mcp://security/recon-checklist",
    { description: "Checklist for effectively performing security reconnaissance" },
    async (uri) => ({
        contents: [{
            uri: uri.href,
            text: `Reconnaissance Checklist:

1. Passive Recon:
   - [ ] WHOIS information lookup.
   - [ ] DNS enumeration (Passive).
   - [ ] Search engine discovery (Google Dorking).
   - [ ] Social media / LinkedIn profiling.
   - [ ] Wayback Machine (historical URL analysis).
   - [ ] Certificate transparency logs (crt.sh).

2. Active Recon:
   - [ ] DNS Brute-forcing / Zone Transfers.
   - [ ] Subdomain enumeration (Amass, Assetfinder).
   - [ ] Port scanning (Nmap, Masscan).
   - [ ] Service fingerprinting.
   - [ ] WAF detection (WAFW00F).
   - [ ] Web application crawling (Katana).
   - [ ] Directory/File fuzzing (FFUF).

3. Analysis:
   - [ ] HTTP Headers security check.
   - [ ] SSL/TLS configuration audit.
   - [ ] Technology stack identification (Wappalyzer).`
        }]
    })
);

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Security Resources MCP Server running on stdio");
}

main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});
