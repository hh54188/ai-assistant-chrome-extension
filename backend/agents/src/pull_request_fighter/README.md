```bash
podman run -i --rm \
  -e GITHUB_PERSONAL_ACCESS_TOKEN=<your-token>
  ghcr.io/github/github-mcp-server
```
or
```bash
export GITHUB_PERSONAL_ACCESS_TOKEN=<your-token>
docker-compose up
```

```bash
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"list_pull_requests","arguments":{ "owner": "hh54188", "repo": "ai-assistant-chrome-extension" }}}' | podman attach pull_request_fighter_github-mcp-server_1

echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"list_commits","arguments":{ "owner": "hh54188", "repo": "ai-assistant-chrome-extension" }}}' | podman attach pull_request_fighter_github-mcp-server_1
```