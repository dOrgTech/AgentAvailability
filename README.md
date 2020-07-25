# AgentAvailability

A Keybase bot used to signal dOrg Agent availability.

## Usage
### Get Availability
```
User: /avail get
```
```
Bot: Availability for user usera:
Default: 50%
Time Zone: America/New_York
- [3/25/2020 - 3/27/2020] 0%
- [3/28/2020 - 4/28/2020] 50%
- [4/29/2020 - 5/01/2020] 25%
- [5/02/2020 - 5/10/2020] 75%
```

```
User: /avail get usera
Bot: usera has not set their availability
```

```
User: /avail get userb
Bot: Availability for user userb:
Default: 50%
Time Zone: America/New_York
- [3/25/2020 - 3/27/2020] 0%
- [3/28/2020 - 4/28/2020] 50%
- [4/29/2020 - 5/01/2020] 25%
- [5/02/2020 - 5/10/2020] 75%
```

```
User: /avail set default 80%
Bot: Your default availability has been set to 80%
```

```
User: /avail add 0% 7/10/2020 7/30/2020
Bot: Please set your time zone first
```

```
User: /avail set timezone America/New_York
Bot: Your time zone has been updated to America/New_York
```

**NOTE:** Timezones must a valid Moment timezone name. 
See examples in the zones properties [here](https://github.com/moment/moment-timezone/blob/develop/data/meta/latest.json).
Noon in the user's local is used as the assumed time of the provided availability date to make timezone conversions more consistent.

```
User: /avail add 0% 7/10/2020 7/30/2020
Bot: Added availability of 0% for 7/10/2020 7/30/2020 America/Los_Angeles
```

```
User: /avail rm
Bot: Which availability would you like to remove?
Default: 50%
Time Zone: America/New_York
1. [3/25/2020 - 3/27/2020] 0%
2. [3/28/2020 - 4/28/2020] 50%
3. [4/29/2020 - 5/01/2020] 25%
4. [5/02/2020 - 5/10/2020] 75%
Respond with /avail rm #
User: /avail rm 1
Bot: Removed availability of 0% for 3/25/2020 3/27/2020 America/New_York
```

## Running Locally

1. Create a .env file in the root of the src/ folder, using .env.example as a base and replacing the values of 
KEYBASE_AGENTAVAILABILITYBOT_USERNAME, KEYBASE_AGENTAVAILABILITYBOT_PAPERKEY, KEYBASE_AGENTAVAILABILITYBOT_TEAMNAME as appropriate. 
2. Use the proper version of Node & NPM
```bash
nvm use
```
3. Install dependencies
```bash
yarn install
```
4. Compile TypeScript into JavaScript
```bash
cd src
npx tsc --project ../tsconfig.json
```
5. Run compiled JavaScript on Node
```bash
node output/src/index.js
```

## Running Locally via Docker

1. Create a .env file in the root of the src/ folder, using .env.example as a base and replacing the values of 
KEYBASE_AGENTAVAILABILITYBOT_USERNAME, KEYBASE_AGENTAVAILABILITYBOT_PAPERKEY, KEYBASE_AGENTAVAILABILITYBOT_TEAMNAME as appropriate. 
2. Run the following commands in the root of the repository:
```bash
docker build -t "keybase-docker-local" .
sudo docker run --env-file src/.env --rm keybase-docker-local
```

## Debugging With VSCode

Add this file to your `.vscode` folder at the root of the Git repository to debug within Visual Studio Code:

`launch.json` ([documentation](https://go.microsoft.com/fwlink/?linkid=830387))  

```json
{
    "configurations": [
        {
            "name": "Launch Program",
            "program": "${workspaceFolder}/src/output/src/index.js",
            "request": "launch",
            "smartStep": true,
            "sourceMaps": true,
            "type": "node"
        }
    ],
    "version": "3.0.1"
}
```

More information on Node.js debugging within VSCode can be found [here](https://code.visualstudio.com/docs/nodejs/nodejs-debugging).

## Tasks to do
* Add build process
* Add debugging
* Add testing
* Add better examples
* Change /avail get to get all users' availability
* Add /avail me for getting your own user's availability
* Add permissions to limit it to to dOrg team
* Setup test users to test multiple users functionality
* Add conversion to a specified time zone, example:
```
User: /avail get userb America/Los_Angeles
Bot: Availability for user userb:
Default: 50%
Time Zone: America/Los_Angeles
- [3/25/2020 - 3/27/2020] 0%
- [3/28/2020 - 4/28/2020] 50%
- [4/29/2020 - 5/01/2020] 25%
- [5/02/2020 - 5/10/2020] 75%
```
Uses specified time zone "America/Los_Angeles" instead of userb's time zone of "America/New_York"
* Add a help verb to display docs for different commands, example: 
```
User: /avail help
Bot: Usage: /avail [verb] [parameter1] [parameter2] [parameter3]
Verbs:
get
set
rm
add
```
```
User: /avail help add
Bot: Usage: /avail add [workLevel%] [MM/DD/YYYY] [MM/DD/YYYY]
Examples: /avail add 0% 7/10/2020 7/30/2020
/avail add 50% 7/10/2020
```
* Deploy
* Make proposal to dOrg DAO for bounty completion
* (Optional) Add CI/CD
* (Optional) Figure out a simple way to validate keybase usernames:
May need to add the [Go client](https://github.com/keybase/client) to project or implement own [user endpoint call.](https://keybase.io/docs/api/1.0/call/user/lookup)
