#!/usr/bin/env node
import Bot from 'keybase-bot'
import { MsgSummary } from 'keybase-bot/lib/types/chat1'
import moment, { Moment } from 'moment'
import momentTimezone from 'moment-timezone'

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
const momentTimezoneNames = momentTimezone.tz.names();
const nameSpaces = {
  availabilities: 'AgentAvailability.Availabilities',
  defaultWorkLevels: 'AgentAvailability.DefaultWorkLevels',
  timezones: 'AgentAvailability.TimeZones',
}
const paperkey = process.env.KB_PAPERKEY;
const teamName = process.env.KB_TEAMNAME;
const username = process.env.KB_USERNAME;
// Regex for a valid integer 0-100 followed by a %
const workLevelRegex = /^(?:100|[1-9]?[0-9])%{1}$/

type Availability = {
  startDate: string,
  endDate: string,
  workLevel: string
}

const getAvailabilitiesString = (availabilities: Availability[]): string => {
  let availabilitiesString = '';
  availabilities.forEach((item, index) => {
    availabilitiesString += `\r\n${index + 1}. [${item.startDate} - ${item.endDate}] ${item.workLevel}`;
  });
  return availabilitiesString;
}

const getAvailabilityString = (availability: Availability): string => {
  return `[${availability.startDate} - ${availability.endDate}] ${availability.workLevel}`;
}

const isValidDate = (date: string): boolean => {
  let validatedDate: Moment = moment(date, 'M/DD/YYYY', true);
  if (validatedDate.isValid()) {
    return true;
  }
  return false;
}

const isValidTimezone = (timezone: string): boolean => {
  if (momentTimezoneNames.indexOf(timezone) > -1) {
    return true;
  }
  return false;
}

const isValidUsername = (username: string): boolean => {
  return true;
}

const isValidWorkLevel = (worklevel: string): boolean => {
  if (workLevelRegex.test(worklevel)) {
    return true
  }
  return false;
}

const writeArgsErrorMessage = (args: string[]): string => {
  let errorMessage: string = `Invalid arguments: ${args.toString()}`;
  console.error(errorMessage);
  return errorMessage;
}

const timezoneNotSetErrormessage = (username: string): string => {
  let errorMessage: string = `Timezone has not been set for user ${username}`;
  console.error(errorMessage);
  return errorMessage;
}

// TO-DO: Add conversion of dates to user's timezone
// TO-DO: Add conversion of dates to UTC timezone
async function addValue(args: string[], username: string): Promise<string> {
  let newAvailability: Availability = {
    startDate: '',
    endDate: '',
    workLevel: ''
  }
  let timezone = (await bot.kvstore.get(teamName, nameSpaces.timezones, username)).entryValue
  if (timezone === '') {
    return timezoneNotSetErrormessage(username);
  }

  if (!isValidWorkLevel(args[0]) &&
    !isValidDate(args[1])) {
    return writeArgsErrorMessage(args);
  }
  if (args[2] &&
    !isValidDate(args[2])) {
    return writeArgsErrorMessage(args);
  }

  newAvailability.workLevel = args[0];
  newAvailability.startDate = args[1];
  if (!args[2]) {
    newAvailability.endDate = args[1];
  }
  else {
    newAvailability.endDate = args[2];
  }

  let availabilitiesString = (await bot.kvstore.get(teamName, nameSpaces.availabilities, username)).entryValue;
  let availabilities: object[] = [];
  if (availabilitiesString !== '') {
    availabilities = JSON.parse(availabilitiesString);
  }
  availabilities.push(newAvailability);
  await bot.kvstore.put(teamName, nameSpaces.availabilities, username, JSON.stringify(availabilities));
  return `Added availability of ${getAvailabilityString(newAvailability)} ${timezone}`;
}

// TO-DO: Add conversion of dates to user's timezone
// TO-DO: Add conversion of dates to a specified timezone
async function getValues(args: string[], username: string): Promise<string> {
  if (args[0]) {
    if (isValidUsername(args[0])) {
      username = args[0]
    }
    else {
      return writeArgsErrorMessage(args);
    }
  }

  let availabilitiesString = (await bot.kvstore.get(teamName, nameSpaces.availabilities, username)).entryValue;
  let defaultWorkLevel = (await bot.kvstore.get(teamName, nameSpaces.defaultWorkLevels, username)).entryValue;
  let timezone = (await bot.kvstore.get(teamName, nameSpaces.timezones, username)).entryValue;
  if (timezone === '') {
    return timezoneNotSetErrormessage(username);
  }
  if (availabilitiesString === '') {
    return `${username} has not set their availability`
  }

  let availabilities: Availability[] = JSON.parse(availabilitiesString);

  if (availabilities.length === 0) {
    return `${username} has not set their availability`
  }
  return `Availability for user ${username}:
      Default: ${defaultWorkLevel}
      Time Zone: ${timezone} ${getAvailabilitiesString(availabilities)}`;

}

async function setValue(args: string[], username: string): Promise<string> {
  if (args[0] === configKeys.default &&
    isValidWorkLevel(args[1])) {
    await bot.kvstore.put(teamName, nameSpaces.defaultWorkLevels, username, args[1]);
    return `Your default availability has been set to ${args[1]}`;
  }
  else if (args[0] === configKeys.timezone &&
    isValidTimezone(args[1])) {
    await bot.kvstore.put(teamName, nameSpaces.timezones, username, args[1]);
    return `Your time zone has been updated to ${args[1]}`;
  }
  else {
    return writeArgsErrorMessage(args);
  }
}

// TO-DO: Add conversion of dates to user's timezone
async function rmValue(args: string[], username: string): Promise<string> {
  let timezone = (await bot.kvstore.get(teamName, nameSpaces.timezones, username)).entryValue;
  if (timezone === '') {
    return timezoneNotSetErrormessage(username);
  }

  if (args.length === 0) {
    let availabilitiesString = (await bot.kvstore.get(teamName, nameSpaces.availabilities, username)).entryValue;
    let availabilities: Availability[] = [];
    if (availabilitiesString !== '') {
      availabilities = JSON.parse(availabilitiesString);
    }
    else {
      return `${username} has not set their availability`
    }
    if (availabilities.length === 0) {
      return `${username} has not set their availability`
    }

    let defaultWorkLevel = (await bot.kvstore.get(teamName, nameSpaces.defaultWorkLevels, username)).entryValue;
    return `Which availability would you like to remove?
      Default: ${defaultWorkLevel}
      Time Zone: ${timezone} ${getAvailabilitiesString(availabilities)}
      Respond with /avail rm #`;
  }
  else if (args[0] && !isNaN(Number(args[0]))) {
    let availabilitiesString = (await bot.kvstore.get(teamName, nameSpaces.availabilities, username)).entryValue;
    let availabilities: object[] = [];
    if (availabilitiesString !== '') {
      availabilities = JSON.parse(availabilitiesString);
    }

    if (availabilities[Number(args[0]) - 1]) {
      availabilities.splice(Number(args[0]) - 1, 1);
    }
    else {
      return writeArgsErrorMessage(args);
    }

    await bot.kvstore.put(teamName, nameSpaces.availabilities, username, JSON.stringify(availabilities));
    return `Removed availability of 0% for 3/25/2020 3/27/2020 ${timezone}`;
  }
  else {
    return writeArgsErrorMessage(args);
  }
}

async function msgReply(message: MsgSummary): Promise<string> {
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

async function main() {
  bot
    .init(username || '', paperkey || '')
    .then(() => {
      console.log('Starting up', bot.myInfo()?.username, bot.myInfo()?.devicename);
      console.log(`Watching for new messages to ${bot.myInfo()?.username} starting with ${commandPrefix}`);
      async function onMessage(message: MsgSummary): Promise<void> {
        if (message?.content.type === 'text') {
          const prefix = message?.content?.text?.body.slice(0, commandPrefix.length);
          if (prefix === commandPrefix) {
            const reply = { body: await msgReply(message) };
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

(async () => {
  try {
    var text = await main();
    console.log(text);
  } catch (e) {
    console.log(e)
  }
})();
