#!/usr/bin/env node

import AgentAvailabilityBot from './bot/AgentAvailabilityBot'

const agentAvailabilityBot = new AgentAvailabilityBot();

async function main() {
  await agentAvailabilityBot.initBot();
}

process.on('SIGINT', agentAvailabilityBot.deinitBot.bind(agentAvailabilityBot));
process.on('SIGTERM', agentAvailabilityBot.deinitBot.bind(agentAvailabilityBot));

(async () => {
  try {
    var text = await main();
    console.log(text);
  } catch (e) {
    console.log(e)
  }
})();
