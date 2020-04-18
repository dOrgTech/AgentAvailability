import Bot from 'keybase-bot'
import moment, { Moment } from 'moment'
import momentTimezone from 'moment-timezone'
import { MsgSummary } from 'keybase-bot/lib/types/chat1'

type Availability = {
    startDate: string,
    endDate: string,
    workLevel: string
}

export class AgentAvailabilityBot {
    private assumedTime: string = '12:00';
    private bot: Bot = new Bot();
    private commandPrefix: string = '/avail ';
    private commandVerbs: any = {
        addVerb: 'add',
        getVerb: 'get',
        setVerb: 'set',
        rmVerb: 'rm',
    }
    private configKeys: any = {
        default: 'default',
        timezone: 'timezone'
    };
    private dateFormat: string = 'M/D/YYYY';
    private inputDateFormat: string = 'M/D/YYYY HH:mm';
    private momentTimezoneNames: string[] = momentTimezone.tz.names();
    private nameSpaces: any = {
        availabilities: 'AgentAvailability.Availabilities',
        defaultWorkLevels: 'AgentAvailability.DefaultWorkLevels',
        timezones: 'AgentAvailability.TimeZones',
    }
    private paperkey: string | undefined = process.env.KB_PAPERKEY;
    private teamName: string | undefined = process.env.KB_TEAMNAME;
    private username: string | undefined = process.env.KB_USERNAME;
    // Regex for a valid integer 0-100 followed by a %
    private workLevelRegex: RegExp = /^(?:100|[1-9]?[0-9])%{1}$/

    constructor() {
        
      }

    public init() {      
        this.bot
            .init(this.username || '', this.paperkey || '')
            .then(this.startUp)
            .catch((error: any) => {
                console.error(error);
            })
            .then(this.deinit);
    }

    public deinit() {
        this.bot.deinit().then(() => process.exit());
    }

    private startUp() {
        console.log('Starting up', this.bot.myInfo()?.username, this.bot.myInfo()?.devicename);
        console.log(`Watching for new messages to ${this.bot.myInfo()?.username} starting with ${this.commandPrefix}`);
        const onError = (e: any) => console.error(e);
        this.bot.chat.watchAllChannelsForNewMessages(this.onMessage, onError);
    }
    private async onMessage(message: MsgSummary): Promise<void> {
        if (message?.content.type === 'text') {
            const prefix = message?.content?.text?.body.slice(0, this.commandPrefix.length);
            if (prefix === this.commandPrefix) {
                const reply = { body: await this.msgReply(message) };
                this.bot.chat.send(message.conversationId, reply);
            }
        }
    }

    private getAvailabilitiesString(availabilities: Availability[], timezone: string): string {
        let availabilitiesString = '';
        availabilities.forEach((item, index) => {
            let availability: Availability = {
                startDate: item.startDate,
                endDate: item.endDate,
                workLevel: item.workLevel
            }
            availabilitiesString += `\r\n${index + 1}. ${this.getAvailabilityString(availability, timezone)}`;
        });
        return availabilitiesString;
    }

    private getAvailabilityString(availability: Availability, timezone: string): string {
        let startDate = momentTimezone(availability.startDate).tz(timezone).format(this.dateFormat);
        let endDate = momentTimezone(availability.endDate).tz(timezone).format(this.dateFormat);
        return `[${startDate} - ${endDate}] ${availability.workLevel}`;
    }

    private isValidDate(date: string): boolean {
        let validatedDate: Moment = moment(date, this.dateFormat, true);
        if (validatedDate.isValid()) {
            return true;
        }
        return false;
    }

    private isValidTimezone(timezone: string): boolean {
        if (this.momentTimezoneNames.indexOf(timezone) > -1) {
            return true;
        }
        return false;
    }

    private isValidUsername(username: string): boolean {
        return true;
    }

    private isValidWorkLevel(worklevel: string): boolean {
        if (this.workLevelRegex.test(worklevel)) {
            return true
        }
        return false;
    }

    private writeArgsErrorMessage(args: string[]): string {
        let errorMessage: string = `Invalid arguments: ${args.toString()}`;
        console.error(errorMessage);
        return errorMessage;
    }

    private timezoneNotSetErrormessage(username: string): string {
        let errorMessage: string = `Timezone has not been set for user ${username}`;
        console.error(errorMessage);
        return errorMessage;
    }

    private async addValue(args: string[], username: string): Promise<string> {
        let newAvailability: Availability = {
            startDate: '',
            endDate: '',
            workLevel: ''
        }
        let timezone = (await this.bot.kvstore.get(this.teamName, this.nameSpaces.timezones, username)).entryValue
        if (timezone === '') {
            return this.timezoneNotSetErrormessage(username);
        }

        if (!this.isValidWorkLevel(args[0]) &&
            !this.isValidDate(args[1])) {
            return this.writeArgsErrorMessage(args);
        }
        if (args[2] &&
            !this.isValidDate(args[2])) {
            return this.writeArgsErrorMessage(args);
        }

        newAvailability.workLevel = args[0];
        newAvailability.startDate = args[1];
        if (!args[2]) {
            newAvailability.endDate = args[1];
        }
        else {
            newAvailability.endDate = args[2];
        }

        let availabilitiesString = (await this.bot.kvstore.get(this.teamName, this.nameSpaces.availabilities, username)).entryValue;
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
        await this.bot.kvstore.put(this.teamName, this.nameSpaces.availabilities, username, JSON.stringify(availabilities));
        return `Added availability of ${this.getAvailabilityString(newAvailability, timezone)} ${timezone}`;
    }

    private async getValues(args: string[], username: string): Promise<string> {
        if (args[0]) {
            if (this.isValidUsername(args[0])) {
                username = args[0]
            }
            else {
                return this.writeArgsErrorMessage(args);
            }
        }

        let availabilitiesString = (await this.bot.kvstore.get(this.teamName, this.nameSpaces.availabilities, username)).entryValue;
        let defaultWorkLevel = (await this.bot.kvstore.get(this.teamName, this.nameSpaces.defaultWorkLevels, username)).entryValue;
        let timezone = (await this.bot.kvstore.get(this.teamName, this.nameSpaces.timezones, username)).entryValue;
        if (timezone === '') {
            return this.timezoneNotSetErrormessage(username);
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
Time Zone: ${timezone} ${this.getAvailabilitiesString(availabilities, timezone)}`;
    }

    private async setValue(args: string[], username: string): Promise<string> {
        if (args[0] === this.configKeys.default &&
            this.isValidWorkLevel(args[1])) {
            await this.bot.kvstore.put(this.teamName, this.nameSpaces.defaultWorkLevels, username, args[1]);
            return `Your default availability has been set to ${args[1]}`;
        }
        else if (args[0] === this.configKeys.timezone &&
            this.isValidTimezone(args[1])) {
            await this.bot.kvstore.put(this.teamName, this.nameSpaces.timezones, username, args[1]);
            return `Your time zone has been updated to ${args[1]}`;
        }
        else {
            return this.writeArgsErrorMessage(args);
        }
    }

    private async rmValue(args: string[], username: string): Promise<string> {
        let timezone = (await this.bot.kvstore.get(this.teamName, this.nameSpaces.timezones, username)).entryValue;
        if (timezone === '') {
            return this.timezoneNotSetErrormessage(username);
        }

        if (args.length === 0) {
            let availabilitiesString = (await this.bot.kvstore.get(this.teamName, this.nameSpaces.availabilities, username)).entryValue;
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

            let defaultWorkLevel = (await this.bot.kvstore.get(this.teamName, this.nameSpaces.defaultWorkLevels, username)).entryValue;
            return `Which availability would you like to remove?
Default: ${defaultWorkLevel}
Time Zone: ${timezone} ${this.getAvailabilitiesString(availabilities, timezone)}
Respond with /avail rm #`;
        }
        else if (args[0] && !isNaN(Number(args[0]))) {
            let availabilitiesString = (await this.bot.kvstore.get(this.teamName, this.nameSpaces.availabilities, username)).entryValue;
            let availabilities: Availability[] = [];
            if (availabilitiesString !== '') {
                availabilities = JSON.parse(availabilitiesString);
            }

            let availabilityToRemove = availabilities[Number(args[0]) - 1];
            if (availabilityToRemove) {
                availabilities.splice(Number(args[0]) - 1, 1);
            }
            else {
                return this.writeArgsErrorMessage(args);
            }

            await this.bot.kvstore.put(this.teamName, this.nameSpaces.availabilities, username, JSON.stringify(availabilities));
            if (availabilityToRemove) {
                return `Removed availability ${this.getAvailabilityString(availabilityToRemove, timezone)}`;
            }
        }
        return this.writeArgsErrorMessage(args);
    }

    private async msgReply(message: MsgSummary): Promise<string> {
        let args: string[] = message?.content?.text?.body.split(" ") || [];
        if (args[1] === this.commandVerbs.addVerb) {
            args.splice(0, 2);
            return this.addValue(args, message?.sender?.username || '');
        }
        else if (args[1] === this.commandVerbs.getVerb) {
            args.splice(0, 2);
            return this.getValues(args, message?.sender?.username || '');
        }
        else if (args[1] === this.commandVerbs.setVerb) {
            args.splice(0, 2);
            return this.setValue(args, message?.sender?.username || '');
        }
        else if (args[1] === this.commandVerbs.rmVerb) {
            args.splice(0, 2);
            return this.rmValue(args, message?.sender?.username || '');
        }
        else {
            let errorMessage: string = `Invalid command verb: ${args[2]}`;
            console.error(errorMessage);
            return errorMessage;
        }
    }
}
