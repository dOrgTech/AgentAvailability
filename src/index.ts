#!/usr/bin/env node
import Bot from 'keybase-bot'
import { MsgSummary } from 'keybase-bot/lib/types/chat1'

const bot = new Bot()
const commandPrefix:string = '/avail '
const commandVerbs = {
  addVerb: 'add',
  getVerb: 'get',
  setVerb: 'set',
  rmVerb: 'rm',
}

const addValue = (args:string[]) => {
  return 'Added availability of 0% for 7/10/2020 7/30/2020 CET (+01:00)';
}

const getValues = (args:string[]) => {
  return `Availability for user ...:
  Default: 50%
  Time Zone: EST (-05:00)
  - [3/25/2020 - 3/27/2020] 0%
  - [3/28/2020 - 4/28/2020] 50%
  - [4/29/2020 - 5/01/2020] 25%
  - [5/02/2020 - 5/10/2020] 75%`;
}

const setValue = (args:string[]) => {
  return 'setValue';
}

const rmValue = (args:string[]) => {
  return 'rmValue';
}

const msgReply = (message: MsgSummary) => {
  let args:string[] = message?.content?.text?.body.split(" ") || [];
  if (args[1] === commandVerbs.addVerb) {
    return addValue(args.splice(0, 2));
  }
  else if (args[1] === commandVerbs.getVerb) {
    return getValues(args.splice(0, 2));
  }
  else if(args[1] === commandVerbs.setVerb) {
    return setValue(args.splice(0, 2));
  }
  else if(args[1] === commandVerbs.rmVerb) {
    return rmValue(args.splice(0, 2));
  }
  else {
    let errorMessage:string = `Invalid command verb: ${args[2]}`;
    console.error(errorMessage); 
    return errorMessage;
  }
}

function main() {
  const username = process.env.KB_USERNAME;
  const paperkey = process.env.KB_PAPERKEY;
  bot
    .init(username || '', paperkey || '')
    .then(() => {
      console.log('Starting up', bot.myInfo()?.username, bot.myInfo()?.devicename);
      console.log(`Watching for new messages to ${bot.myInfo()?.username} starting with ${commandPrefix}`);
      const onMessage = (message:MsgSummary) => {
        if (message?.content.type === 'text') {
          const prefix = message?.content?.text?.body.slice(0, commandPrefix.length);
          if (prefix === commandPrefix) {
            const reply = {body: msgReply(message)};
            bot.chat.send(message.conversationId, reply);
          }
        }
      }
      const onError = (e:any) => console.error(e);
      bot.chat.watchAllChannelsForNewMessages(onMessage, onError);
    })
    .catch((error:any) => {
      console.error(error);
      shutDown();
    })
}

function shutDown() {
  bot.deinit().then(() => process.exit());
}

process.on('SIGINT', shutDown);
process.on('SIGTERM', shutDown);

main();
