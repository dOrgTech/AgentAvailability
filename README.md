# AgentAvailability

This Keybase bot is used to signal dOrg Agent availability. 

## Example usage

```
User: /avail get usera
Bot: usera has not set their availability
```

```
User: /avail get userb
Bot: Availability for user userb:
Default: 50%
Time Zone: EST (-05:00)
- [3/25/2020 - 3/27/2020] 0%
- [3/28/2020 - 4/28/2020] 50%
- [4/29/2020 - 5/01/2020] 25%
- [5/02/2020 - 5/10/2020] 75%
```

```
User: /avail get userb +01:00
Bot: Availability for user userb:
Default: 50%
Time Zone: CET (+01:00)
```
Uses specified time zone "CET" instead of userb's time zone of "EST"

```
User: /avail config set default 80%
Bot: Your default availability has been set to 80%
```

```
User: /avail add 0% 7/10/2020 7/30/2020
Bot: Please set your time-zone first
```

```
User: /avail config set time-zone CET
Bot: Your time-zone has been updated to CET (+01:00)
```

```
User: /avail add 0% 7/10/2020 7/30/2020
Bot: Added availability of 0% for 7/10/2020 7/30/2020 CET (+01:00)
```

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
                "KB_PAPERKEY": "keybase_paperkey"
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