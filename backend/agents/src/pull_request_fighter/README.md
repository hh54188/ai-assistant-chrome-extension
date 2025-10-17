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
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"get_authenticated_user","arguments":{}}}' | podman attach pull_request_fighter_github-mcp-server_1
```