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