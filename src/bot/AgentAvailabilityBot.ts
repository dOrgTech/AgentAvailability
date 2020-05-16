import moment, { Moment } from 'moment'

import Availability from './Availability'
import Bot from 'keybase-bot'
import { MsgSummary } from 'keybase-bot/lib/types/chat1'
import momentTimezone from 'moment-timezone'

export class AgentAvailabilityBot extends Bot {
    assumedTime: string | undefined = process.env.KEYBASE_AGENTAVAILABILITYBOT_ASSUMEDTIME;
    commandPrefix: string | undefined = process.env.KEYBASE_AGENTAVAILABILITYBOT_COMMANDPREFIX;
    commandVerbs: { [id: string]: string | undefined; } = {
        add: process.env.KEYBASE_AGENTAVAILABILITYBOT_COMMANDVERB_ADD,
        get: process.env.KEYBASE_AGENTAVAILABILITYBOT_COMMANDVERB_GET,
        set: process.env.KEYBASE_AGENTAVAILABILITYBOT_COMMANDVERB_SET,
        rm: process.env.KEYBASE_AGENTAVAILABILITYBOT_COMMANDVERB_RM,
    }
    configKeys: { [id: string]: string | undefined; } = {
        default: process.env.KEYBASE_AGENTAVAILABILITYBOT_CONFIGKEY_DEFAULT,
        timezone: process.env.KEYBASE_AGENTAVAILABILITYBOT_CONFIGKEY_TIMEZONE,
    };
    dateFormat: string | undefined = process.env.KEYBASE_AGENTAVAILABILITYBOT_DATEFORMAT;
    inputDateFormat: string | undefined = process.env.KEYBASE_AGENTAVAILABILITYBOT_INPUTDATEFORMAT;
    momentTimezoneNames: string[] = momentTimezone.tz.names();
    nameSpaces: { [id: string]: string | undefined; } = {
        availabilities: process.env.KEYBASE_AGENTAVAILABILITYBOT_NAMESPACE_AVAILABILITIES,
        defaultWorkLevels: process.env.KEYBASE_AGENTAVAILABILITYBOT_NAMESPACE_DEFAULT,
        timezones: process.env.KEYBASE_AGENTAVAILABILITYBOT_NAMESPACE_TIMEZONES,
    }
    paperkey: string | undefined = process.env.KEYBASE_AGENTAVAILABILITYBOT_PAPERKEY;
    teamName: string | undefined = process.env.KEYBASE_AGENTAVAILABILITYBOT_TEAMNAME;
    username: string | undefined = process.env.KEYBASE_AGENTAVAILABILITYBOT_USERNAME;
    // Regex for a valid integer 0-100 followed by a %
    workLevelRegex: RegExp = /^(?:100|[1-9]?[0-9])%{1}$/

    constructor(workLevelRegex?: RegExp) {
        super();
        if (workLevelRegex) {
            this.workLevelRegex = workLevelRegex;
        }
    }

    async initBot(): Promise<void> {
        try {
            await this.init(this.username || '', this.paperkey || '');
            this._startUp();
        }
        catch (error) {
            console.error(error);
            await this.deinit();
        }
    }

    async deinitBot(): Promise<void> {
        console.log('Shutting down...');
        await this.deinit();
        return process.exit();
    }

    _startUp() {
        console.log('Starting up...', this.myInfo.call(this)?.username, this.myInfo.call(this)?.devicename);
        console.log(`Watching for new messages to ${this.myInfo.call(this)?.username} starting with ${this.commandPrefix}`);
        const onError = (e: any) => console.error(e);
        const onMessage = async (message: MsgSummary) => {
            if (message?.content.type === 'text') {
                const prefix = message?.content?.text?.body.slice(0, this.commandPrefix?.length);
                if (prefix === this.commandPrefix) {
                    const reply = { body: await this._msgReply(message) };
                    this.chat.send(message.conversationId, reply);
                }
            }
        }
        this.chat.watchAllChannelsForNewMessages(onMessage, onError);
    }

    _getAvailabilitiesString(availabilities: Availability[], timezone: string): string {
        let availabilitiesString = '';
        availabilities.forEach((item, index) => {
            let availability: Availability = {
                startDate: item.startDate,
                endDate: item.endDate,
                workLevel: item.workLevel
            }
            availabilitiesString += `\r\n${index + 1}. ${this._getAvailabilityString(availability, timezone)}`;
        });
        return availabilitiesString;
    }

    _getAvailabilityString(availability: Availability, timezone: string): string {
        let startDate = momentTimezone(availability.startDate).tz(timezone).format(this.dateFormat);
        let endDate = momentTimezone(availability.endDate).tz(timezone).format(this.dateFormat);
        return `[${startDate} - ${endDate}] ${availability.workLevel}`;
    }

    _isValidDate(date: string): boolean {
        let validatedDate: Moment = moment(date, this.dateFormat, true);
        if (validatedDate.isValid()) {
            return true;
        }
        return false;
    }

    _isValidTimezone(timezone: string): boolean {
        if (this.momentTimezoneNames.indexOf(timezone) > -1) {
            return true;
        }
        return false;
    }

    _isValidUsername(username: string): boolean {
        return true;
    }

    _isValidWorkLevel(worklevel: string): boolean {
        if (this.workLevelRegex.test(worklevel)) {
            return true
        }
        return false;
    }

    _writeArgsErrorMessage(args: string[]): string {
        let errorMessage: string = `Invalid arguments: ${args.toString()}`;
        console.error(errorMessage);
        return errorMessage;
    }

    _timezoneNotSetErrormessage(username: string): string {
        let errorMessage: string = `Timezone has not been set for user ${username}`;
        console.error(errorMessage);
        return errorMessage;
    }

    async _addValue(args: string[], username: string): Promise<string> {
        let newAvailability: Availability = {
            startDate: '',
            endDate: '',
            workLevel: ''
        }
        let timezone = (await this.kvstore.get(this.teamName, this.nameSpaces.timezones || '', username)).entryValue
        if (timezone === '') {
            return this._timezoneNotSetErrormessage(username);
        }

        if (!this._isValidWorkLevel(args[0]) &&
            !this._isValidDate(args[1])) {
            return this._writeArgsErrorMessage(args);
        }
        if (args[2] &&
            !this._isValidDate(args[2])) {
            return this._writeArgsErrorMessage(args);
        }

        newAvailability.workLevel = args[0];
        newAvailability.startDate = args[1];
        if (!args[2]) {
            newAvailability.endDate = args[1];
        }
        else {
            newAvailability.endDate = args[2];
        }

        let availabilitiesString = (await this.kvstore.get(this.teamName, this.nameSpaces.availabilities || '', username)).entryValue;
        let availabilities: object[] = [];
        if (availabilitiesString !== '') {
            availabilities = JSON.parse(availabilitiesString);
        }
        let startDate = momentTimezone(newAvailability.startDate + " " + this.assumedTime, this.inputDateFormat, timezone);
        if (!startDate.isValid()) {
            return `Invalid date: ${newAvailability.startDate}`;
        }
        let endDate = momentTimezone(newAvailability.endDate + " " + this.assumedTime, this.inputDateFormat, timezone);
        if (!endDate.isValid()) {
            return `Invalid date: ${newAvailability.endDate}`;
        }
        newAvailability.startDate = startDate.format();
        newAvailability.endDate = endDate.format();
        availabilities.push(newAvailability);
        await this.kvstore.put(this.teamName, this.nameSpaces.availabilities || '', username, JSON.stringify(availabilities));
        return `Added availability of ${this._getAvailabilityString(newAvailability, timezone)} ${timezone}`;
    }

    async _getValues(args: string[], username: string): Promise<string> {
        if (args[0]) {
            if (this._isValidUsername(args[0])) {
                username = args[0]
            }
            else {
                return this._writeArgsErrorMessage(args);
            }
        }

        let availabilitiesString = (await this.kvstore.get(this.teamName, this.nameSpaces.availabilities || '', username)).entryValue;
        let defaultWorkLevel = (await this.kvstore.get(this.teamName, this.nameSpaces.defaultWorkLevels || '', username)).entryValue;
        let timezone = (await this.kvstore.get(this.teamName, this.nameSpaces.timezones || '', username)).entryValue;
        if (timezone === '') {
            return this._timezoneNotSetErrormessage(username);
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
Time Zone: ${timezone} ${this._getAvailabilitiesString(availabilities, timezone)}`;
    }

    async _setValue(args: string[], username: string): Promise<string> {
        if (args[0] === this.configKeys.default &&
            this._isValidWorkLevel(args[1])) {
            await this.kvstore.put(this.teamName, this.nameSpaces.defaultWorkLevels || '', username, args[1]);
            return `Your default availability has been set to ${args[1]}`;
        }
        else if (args[0] === this.configKeys.timezone &&
            this._isValidTimezone(args[1])) {
            await this.kvstore.put(this.teamName, this.nameSpaces.timezones || '', username, args[1]);
            return `Your time zone has been updated to ${args[1]}`;
        }
        else {
            return this._writeArgsErrorMessage(args);
        }
    }

    async _rmValue(args: string[], username: string): Promise<string> {
        let timezone = (await this.kvstore.get(this.teamName, this.nameSpaces.timezones || '', username)).entryValue;
        if (timezone === '') {
            return this._timezoneNotSetErrormessage(username);
        }

        if (args.length === 0) {
            let availabilitiesString = (await this.kvstore.get(this.teamName, this.nameSpaces.availabilities || '', username)).entryValue;
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

            let defaultWorkLevel = (await this.kvstore.get(this.teamName, this.nameSpaces.defaultWorkLevels || '', username)).entryValue;
            return `Which availability would you like to remove?
Default: ${defaultWorkLevel}
Time Zone: ${timezone} ${this._getAvailabilitiesString(availabilities, timezone)}
Respond with /avail rm #`;
        }
        else if (args[0] && !isNaN(Number(args[0]))) {
            let availabilitiesString = (await this.kvstore.get(this.teamName, this.nameSpaces.availabilities || '', username)).entryValue;
            let availabilities: Availability[] = [];
            if (availabilitiesString !== '') {
                availabilities = JSON.parse(availabilitiesString);
            }

            let availabilityToRemove = availabilities[Number(args[0]) - 1];
            if (availabilityToRemove) {
                availabilities.splice(Number(args[0]) - 1, 1);
            }
            else {
                return this._writeArgsErrorMessage(args);
            }

            await this.kvstore.put(this.teamName, this.nameSpaces.availabilities || '', username, JSON.stringify(availabilities));
            if (availabilityToRemove) {
                return `Removed availability ${this._getAvailabilityString(availabilityToRemove, timezone)}`;
            }
        }
        return this._writeArgsErrorMessage(args);
    }

    async _msgReply(message: MsgSummary): Promise<string> {
        let args: string[] = message?.content?.text?.body.split(" ") || [];
        if (args[1] === this.commandVerbs.add) {
            args.splice(0, 2);
            return this._addValue(args, message?.sender?.username || '');
        }
        else if (args[1] === this.commandVerbs.get) {
            args.splice(0, 2);
            return this._getValues(args, message?.sender?.username || '');
        }
        else if (args[1] === this.commandVerbs.set) {
            args.splice(0, 2);
            return this._setValue(args, message?.sender?.username || '');
        }
        else if (args[1] === this.commandVerbs.rm) {
            args.splice(0, 2);
            return this._rmValue(args, message?.sender?.username || '');
        }
        else {
            let errorMessage: string = `Invalid command verb: ${args[2]}`;
            console.error(errorMessage);
            return errorMessage;
        }
    }
}
