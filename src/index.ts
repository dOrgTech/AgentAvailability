import AgentAvailabilityBot from './bot/AgentAvailabilityBot'
import dotenv from 'dotenv'

dotenv.config();

async function main() {
  const agentAvailabilityBot = new AgentAvailabilityBot();
  await agentAvailabilityBot.initBot();
  process.on('SIGINT',
    agentAvailabilityBot.deinitBot.bind(agentAvailabilityBot)
  );
  process.on('SIGTERM',
    agentAvailabilityBot.deinitBot.bind(agentAvailabilityBot)
  );
}

if (require.main === module) {
  main()
    .then(() => console.log('done'))
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
}

export {
  AgentAvailabilityBot
}
