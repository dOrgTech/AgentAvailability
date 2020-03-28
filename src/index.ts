#!/usr/bin/env node
import Bot from 'keybase-bot'
import { MsgSummary } from 'keybase-bot/lib/types/chat1'

// TO-DO: Implement storage and CRUD operations in functions
const bot = new Bot();
const commandPrefix: string = '/avail ';
const commandVerbs = {
  addVerb: 'add',
  getVerb: 'get',
  setVerb: 'set',
  rmVerb: 'rm',
};
const configKeys = {
  default: 'default',
  timezone: 'timezone'
};

// TO-DO: Implement validation
const isValidDate = (date: string): boolean => {
  return true;
}
const isValidTimezone = (date: string): boolean => {
  return true;
}
const isValidUsername = (date: string): boolean => {
  return true;
}
const isValidWorkLevel = (date: string): boolean => {
  return true;
}

const writeArgsErrorMessage = (args: string[]): string => {
  let errorMessage: string = `Invalid arguments: ${args.toString()}`;
  console.error(errorMessage);
  return errorMessage;
}

// TO-DO: Add validation that timezone has been set before adding
const addValue = (args: string[], username: string): string => {
  if (isValidWorkLevel(args[0]) &&
    isValidDate(args[1])) {
    if (isValidDate(args[2])) {
      return `Added availability of ${args[0]} for ${args[1]} ${args[2]} timezone`;
    }
    else if (!isValidDate(args[2])) {
      return writeArgsErrorMessage(args);
    }
    else {
      return `Added availability of ${args[0]} for ${args[1]} ${args[1]} timezone`;
    }
  }
  else {
    return writeArgsErrorMessage(args);
  }
}

// TO-DO: Add validation of username at args[0]
const getValues = (args: string[], username: string) => {
  if (!args[0]) {
    return `Availability for user ${username}:
      Default: 50%
      Time Zone: EST (-05:00)
      - [3/25/2020 - 3/27/2020] 0%
      - [3/28/2020 - 4/28/2020] 50%
      - [4/29/2020 - 5/01/2020] 25%
      - [5/02/2020 - 5/10/2020] 75%`;
  }
  else if (isValidUsername(args[0])) {
    return `Availability for user ${args[0]}:
      Default: 50%
      Time Zone: EST (-05:00)
      - [3/25/2020 - 3/27/2020] 0%
      - [3/28/2020 - 4/28/2020] 50%
      - [4/29/2020 - 5/01/2020] 25%
      - [5/02/2020 - 5/10/2020] 75%`;
  }
  else {
    return writeArgsErrorMessage(args);
  }
}

const setValue = (args: string[], username: string) => {
  if (args[0] === configKeys.default &&
    isValidWorkLevel(args[1])) {
    return `Your default availability has been set to ${args[1]}`;
  }
  else if (args[0] === configKeys.timezone &&
    isValidTimezone(args[1])) {
    return `Your time zone has been updated to ${args[1]}`;
  }
  else {
    return writeArgsErrorMessage(args);
  }
}

// TO-DO: Verify args[0] is a key of an availability
const rmValue = (args: string[], username: string) => {
  if (args.length === 0) {
    return `Which availability would you like to remove?
      Default: 50%
      Time Zone: EST (-05:00)
      1. [3/25/2020 - 3/27/2020] 0%
      2. [3/28/2020 - 4/28/2020] 50%
      3. [4/29/2020 - 5/01/2020] 25%
      4. [5/02/2020 - 5/10/2020] 75%
      Respond with /avail rm #`;
  }
  else if (args[0] && !isNaN(Number(args[0]))) {
    return 'Removed availability of 0% for 3/25/2020 3/27/2020 EST (-05:00)'
  }
  else {
    return writeArgsErrorMessage(args);
  }
}

const msgReply = (message: MsgSummary): string => {
  let args: string[] = message?.content?.text?.body.split(" ") || [];
  if (args[1] === commandVerbs.addVerb) {
    args.splice(0, 2);
    return addValue(args, message?.sender?.username || '');
  }
  else if (args[1] === commandVerbs.getVerb) {
    args.splice(0, 2);
    return getValues(args, message?.sender?.username || '');
  }
  else if (args[1] === commandVerbs.setVerb) {
    args.splice(0, 2);
    return setValue(args, message?.sender?.username || '');
  }
  else if (args[1] === commandVerbs.rmVerb) {
    args.splice(0, 2);
    return rmValue(args, message?.sender?.username || '');
  }
  else {
    let errorMessage: string = `Invalid command verb: ${args[2]}`;
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
      const onMessage = (message: MsgSummary) => {
        if (message?.content.type === 'text') {
          const prefix = message?.content?.text?.body.slice(0, commandPrefix.length);
          if (prefix === commandPrefix) {
            const reply = { body: msgReply(message) };
            bot.chat.send(message.conversationId, reply);
          }
        }
      }
      const onError = (e: any) => console.error(e);
      bot.chat.watchAllChannelsForNewMessages(onMessage, onError);
    })
    .catch((error: any) => {
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
