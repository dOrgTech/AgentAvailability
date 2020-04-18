# AgentAvailability

This Keybase bot is used to signal dOrg Agent availability.
Timezones must a valid Moment timezone name. 
See examples in the zones properties [here](https://github.com/moment/moment-timezone/blob/develop/data/meta/latest.json).
Noon in the user's local is used as the assumed time of the provided availability date to make timezone conversions more consistent.

## Example usage

```
User: /avail get
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

## Development tasks to do
* Add better validation fail messages
* Add logging & better error handling
* Refactor
* Deploy
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
* (Optional) Add a help verb to display docs for different commands, example: 
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
* (Optional) Add CI/CD
* (Optional) Figure out a simple way to validate keybase usernames:
May need to add the [Go client](https://github.com/keybase/client) to project or implement own [user endpoint call.](https://keybase.io/docs/api/1.0/call/user/lookup)

## Running locally

You will need to run yarn install in the `src` folder to get started:

```bash
yarn install
```

## Debugging locally

Set up these two files in a `.vscode` folder at the root of the Git repository to debug within Visual Studio Code:

`launch.json` - replace example values in env's nested properties as appropriate

```json
{
    // Use IntelliSense to learn about possible attributes.
    // Hover to view descriptions of existing attributes.
    // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
    "configurations": [
        {
            "env": {
                "KB_USERNAME": "keybase_username",
                "KB_PAPERKEY": "keybase_paperkey",
                "KB_TEAMNAME": "keybase_teamname"
            },
            "name": "Launch Program",
            "outFiles": [
                "${workspaceFolder}/src/output/*.js"
            ],
            "outputCapture": "std",
            "program": "${workspaceFolder}//src//output//index.js",
            "request": "launch",
            "smartStep": true,
            "sourceMaps": true,
            "type": "node"
        }
    ],
    "version": "3.0.1"
}
```

`tasks.json`

```json
{
    // See https://go.microsoft.com/fwlink/?LinkId=733558
    // for the documentation about the tasks.json format
    "version": "3.0.1",
    "tasks": [
        {
            "type": "typescript",
            "tsconfig": "src\\tsconfig.json",
            "option": "watch",
            "problemMatcher": [
                "$tsc-watch"
            ],
            "group": {
                "kind": "build",
                "isDefault": true
            }
        }
    ]
}
```

Then run the build step by pressing `Ctrl+Shift+B`, and any updates will trigger a TypeScript build. Debug by pressing `F5`.