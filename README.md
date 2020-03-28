# AgentAvailability

This Keybase bot is used to signal dOrg Agent availability. 

## Running locally

You will need to run npm install in the `src` folder to get started:

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