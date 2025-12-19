# MemMachine Setup Guide

This project uses MemMachine for persistent memory across chat conversations.

## Installation

### Option 1: Quick Start (Recommended)

1. Download and extract MemMachine:
```bash
# Download the latest release
TARBALL_URL=$(curl -s https://api.github.com/repos/MemMachine/MemMachine/releases/latest \
  | grep '"tarball_url"' \
  | head -n 1 \
  | sed -E 's/.*"tarball_url": "(.*)",/\1/')

curl -L "$TARBALL_URL" -o MemMachine-latest.tar.gz

# Extract the archive
tar -xzf MemMachine-latest.tar.gz

# Move into the directory
cd MemMachine-MemMachine-*/

# Start MemMachine
./memmachine-compose.sh
```

2. The script will guide you through setup, including configuring your OpenAI API key.

3. Verify installation:
```bash
curl http://localhost:8080/health
```

### Option 2: Using Docker

```bash
docker pull memmachine/memmachine:latest
docker run -p 8080:8080 memmachine/memmachine:latest
```

## Configuration

The application is configured to connect to MemMachine at `http://localhost:8080` by default.

You can customize this in `backend/.env`:
```
MEMMACHINE_URL=http://localhost:8080
MEMMACHINE_API_KEY=  # Optional, leave empty for local development
```

## How It Works

MemMachine provides persistent memory for the chat agent:

1. **Episodic Memory**: Stores conversation history and context
2. **Profile Memory**: Stores long-term user preferences and facts

The agent automatically:
- Stores important information from conversations
- Retrieves relevant memories when answering questions
- Builds a personalized understanding of each user over time

## Management Commands

```bash
# Stop MemMachine
./memmachine-compose.sh stop

# Restart MemMachine
./memmachine-compose.sh restart

# View logs
./memmachine-compose.sh logs
```

## Documentation

- [MemMachine Docs](https://docs.memmachine.ai)
- [Quick Start Guide](https://docs.memmachine.ai/getting_started/quickstart)
- [API Reference](https://docs.memmachine.ai/api_reference)

## Troubleshooting

If MemMachine is not running, the application will still work but without persistent memory features.

Check if MemMachine is running:
```bash
curl http://localhost:8080/health
```

If you see connection errors in the logs, make sure MemMachine is started before running the application.
