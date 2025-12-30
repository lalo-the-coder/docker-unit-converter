# Docker Compose Resource Calculator

A CLI tool to calculate and convert Docker Compose resource configurations (CPU and memory) into the proper format for deployment specifications.

## Features

- **Preset Configurations**: Quick access to common resource allocations for React and Laravel + Swoole environments (QA and Production)
- **Custom Values**: Manually specify CPU and memory resources for reserved and limit configurations
- **Docker Compose Compatible Output**: Converts inputs to the proper format:
  - CPU: Converted to units of 10^-9 CPUs (e.g., 2 CPUs = 2000000000)
  - Memory: Converted to bytes (e.g., 1GB = 1073741824 bytes)
- **Validation**: Ensures resource limits are higher than reservations
- **Interactive CLI**: Built with `@inquirer/prompts` for a smooth user experience

## Prerequisites

- Node.js (v14 or higher)
- pnpm (v10.25.0 or compatible)

## Installation

```bash
# Clone the repository
git clone https://github.com/lalo-the-coder/docker-unit-converter.git
cd docker-unit-converter

# Install dependencies
pnpm install
```

## Usage

Run the interactive CLI tool:

```bash
pnpm docker-unit-converter
# or
./index.js
```

### Available Presets

1. **React QA**
   - Reserved: 128MB, 0.1 CPU
   - Limit: 256MB, 0.25 CPU

2. **React Prod**
   - Reserved: 256MB, 0.25 CPU
   - Limit: 512MB, 0.5 CPU

3. **Laravel + Swoole QA**
   - Reserved: 512MB, 0.5 CPU
   - Limit: 1GB, 1 CPU

4. **Laravel + Swoole Prod**
   - Reserved: 1GB, 1 CPU
   - Limit: 2GB, 2 CPU

### Example Output

```
Output: (Docker Compose Compatible):

Limit:
  memory: 536870912 # 536870912 bytes
  cpus: 500000000 # 0.5 CPUs in units of 10^-9

Reserved:
  memory: 268435456 # 268435456 bytes
  cpus: 250000000 # 0.25 CPUs in units of 10^-9
```

## Development

```bash
# Install dependencies
pnpm install

# Run the tool
pnpm docker-unit-converter

# Format code
pnpm prettier --write .
```

## How It Works

The tool converts human-readable resource specifications into Docker Compose compatible values:

- **CPU Conversion**: Multiplies CPU count by 1,000,000,000 (10^-9 units)
- **Memory Conversion**: Converts MB/GB to bytes using binary units (1024-based)
  - 1 MB = 1,048,576 bytes (1024²)
  - 1 GB = 1,073,741,824 bytes (1024³)

## License

MIT
