#!/bin/bash

# Exit on error
set -e

# Build the project
npm install >/dev/null
npm run build >/dev/null

# Set directory variables
SERVICE_PATH=$(pwd)
INDEX_PATH="$SERVICE_PATH/build/index.js"
WAFW00F_PATH=$(which wafw00f || echo "/usr/local/bin/wafw00f")
COMMAND_NAME=$(basename "$SERVICE_PATH")
CONFIG_FILE="$SERVICE_PATH/../mcp-config.json"

# Create config file if it doesn't exist
[ -f "$CONFIG_FILE" ] || echo "{}" > "$CONFIG_FILE"

# Update mcp-config.json with jq
jq --arg cmd "$COMMAND_NAME" \
   --arg node_path "$INDEX_PATH" \
   --arg bin_path "$WAFW00F_PATH" \
   '.mcpServers[$cmd] = { "command": "node", "args": [$node_path, $bin_path] }' \
   "$CONFIG_FILE" > "$CONFIG_FILE.tmp" && mv "$CONFIG_FILE.tmp" "$CONFIG_FILE"

echo "[+] Successfully configured $COMMAND_NAME in mcp-config.json"
