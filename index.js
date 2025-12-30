#!/usr/bin/env node

import { input, select } from "@inquirer/prompts";

const MEMORY_UNITS = {
  MB: 1024 ** 2,
  GB: 1024 ** 3,
};

const PRESETS = {
  "react-qa": {
    name: "React QA (128MB R / 256MB L, 0.1 CPU R / 0.25 CPU L)",
    reserved: { cpu: 0.1, memoryBytes: 128 * MEMORY_UNITS.MB },
    limit: { cpu: 0.25, memoryBytes: 256 * MEMORY_UNITS.MB },
  },
  "react-prod": {
    name: "React Prod (256MB R / 512MB L, 0.25 CPU R / 0.5 CPU L)",
    reserved: { cpu: 0.25, memoryBytes: 256 * MEMORY_UNITS.MB },
    limit: { cpu: 0.5, memoryBytes: 512 * MEMORY_UNITS.MB },
  },
  "laravel-qa": {
    name: "Laravel + Swoole QA (512MB R / 1GB L, 0.5 CPU R / 1 CPU L)",
    reserved: { cpu: 0.5, memoryBytes: 512 * MEMORY_UNITS.MB },
    limit: { cpu: 1, memoryBytes: 1 * MEMORY_UNITS.GB },
  },
  "laravel-prod": {
    name: "Laravel + Swoole Prod (1GB R / 2GB L, 1 CPU R / 2 CPU L)",
    reserved: { cpu: 1, memoryBytes: 1 * MEMORY_UNITS.GB },
    limit: { cpu: 2, memoryBytes: 2 * MEMORY_UNITS.GB },
  },
};

function toNanoCpu(cpus) {
  return Math.round(cpus * 1_000_000_000);
}

function toBytes(value, unit) {
  return value * MEMORY_UNITS[unit];
}

function validateCpu(value) {
  const num = Number(value);
  if (Number.isNaN(num) || num <= 0) {
    return "CPU must be a positive number (e.g. 0.5, 1, 2.5)";
  }
  return true;
}

function validateMemory(value) {
  const num = Number(value.trim());

  if (!Number.isFinite(num)) {
    return "You must provide a valid numeric value";
  }

  if (num <= 0) {
    return "Memory must be greater than 0";
  }

  return true;
}

async function askResource(title) {
  const cpu = await input({
    message: `${title} CPU (e.g. 0.5, 1, 2.5): `,
    validate: validateCpu,
  });

  const memory = await input({
    message: `${title} RAM value: `,
    validate: validateMemory,
  });

  const unit = await select({
    message: `${title} RAM unit: `,
    choices: [
      { name: "MB", value: "MB" },
      { name: "GB", value: "GB" },
    ],
  });

  return {
    cpu: Number(cpu),
    memoryBytes: toBytes(memory, unit),
  };
}

(async function main() {
  console.log("\nDocker Compose Resource Calculator\n");

  const mode = await select({
    message: "Choose configuration mode:",
    choices: [
      { name: "Use a preset", value: "preset" },
      { name: "Custom values", value: "custom" },
    ],
  });

  let reserved, limit;

  if (mode === "preset") {
    const presetKey = await select({
      message: "Select a preset:",
      choices: Object.entries(PRESETS).map(([key, preset]) => ({
        name: preset.name,
        value: key,
      })),
    });

    const preset = PRESETS[presetKey];
    reserved = preset.reserved;
    limit = preset.limit;

    console.log("\n✓ Preset applied");
  } else {
    reserved = await askResource("Reserved");
    limit = await askResource("Limit");
  }

  if (limit.cpu < reserved.cpu) {
    console.warn("\n⚠️  Warning: CPU limit is lower than reservation");
  }

  if (limit.memoryBytes < reserved.memoryBytes) {
    console.warn("\n⚠️  Warning: Memory limit is lower than reservation");
  }

  console.log("\nOutput: (Docker Compose Compatible):\n");

  console.log("\nLimit:");
  console.log(`  memory: ${limit.memoryBytes} # ${limit.memoryBytes} bytes`);
  console.log(
    `  cpus: ${toNanoCpu(limit.cpu)} # ${limit.cpu} CPUs in units of 10^-9\n`
  );

  console.log("Reserved:");
  console.log(
    `  memory: ${reserved.memoryBytes} # ${reserved.memoryBytes} bytes`
  );
  console.log(
    `  cpus: ${toNanoCpu(reserved.cpu)} # ${reserved.cpu} CPUs in units of 10^-9`
  );
})();
