#!/usr/bin/env node

import { AgentAvailabilityBot } from './agentAvailabilityBot'

const agentAvailabilityBot = new AgentAvailabilityBot();

async function main() {
  agentAvailabilityBot.init();
}

process.on('SIGINT', agentAvailabilityBot.deinit);
process.on('SIGTERM', agentAvailabilityBot.deinit);

(async () => {
  try {
    var text = await main();
    console.log(text);
  } catch (e) {
    console.log(e)
  }
})();
