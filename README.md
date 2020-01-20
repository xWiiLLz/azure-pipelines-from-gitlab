azure-pipelines
===============

Triggering azure pipelines from gitlab

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/azure-pipelines.svg)](https://npmjs.org/package/azure-pipelines)
[![Downloads/week](https://img.shields.io/npm/dw/azure-pipelines.svg)](https://npmjs.org/package/azure-pipelines)
[![License](https://img.shields.io/npm/l/azure-pipelines.svg)](https://github.com/xWiiLLz/azure-pipelines/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g azure-pipelines-from-gitlab
$ azure-pipelines COMMAND
running command...
$ azure-pipelines (-v|--version|version)
azure-pipelines-from-gitlab/0.0.0 linux-x64 node-v12.13.0
$ azure-pipelines --help [COMMAND]
USAGE
  $ azure-pipelines COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`azure-pipelines help [COMMAND]`](#azure-pipelines-help-command)
* [`azure-pipelines run ORGANIZATION PROJECT SOURCEBRANCH PERSONALACCESSTOKEN [DEFINITIONS]`](#azure-pipelines-run-organization-project-sourcebranch-personalaccesstoken-definitions)

## `azure-pipelines help [COMMAND]`

display help for azure-pipelines

```
USAGE
  $ azure-pipelines help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.2.3/src/commands/help.ts)_

## `azure-pipelines run ORGANIZATION PROJECT SOURCEBRANCH PERSONALACCESSTOKEN [DEFINITIONS]`

trigger one or more azure pipelines and wait for them to finish

```
USAGE
  $ azure-pipelines run ORGANIZATION PROJECT SOURCEBRANCH PERSONALACCESSTOKEN [DEFINITIONS]

OPTIONS
  -d, --definitions=definitions  build definition IDs to run as an array of integer. All available pipelines will be ran
                                 if nothing is provided

  -h, --help                     show CLI help

EXAMPLE
  $ azure-pipelines run myOrganization myProject master personalAccessToken
  Queuing build with definition id "2"...
  Queuing build with definition id "3"...
  Queuing build with definition id "4"...
  Queued build "Desktop CI (WPF)" (build id = 27). Waiting for it to finish... (polling)
  Queued build "Android-CI" (build id = 28). Waiting for it to finish... (polling)
  Queued build "Server CI (.NET Core)" (build id = 26). Waiting for it to finish... (polling)
  Got refreshed build status for Desktop CI (WPF). CurrentStatus: inProgress
  Got refreshed build status for Desktop CI (WPF). CurrentStatus: completed
  Build finished with result "succeeded"
  Got refreshed build status for Server CI (.NET Core). CurrentStatus: inProgress
  Got refreshed build status for Server CI (.NET Core). CurrentStatus: completed
  Build finished with result "failed"
  Got refreshed build status for Android-CI. CurrentStatus: inProgress
  Got refreshed build status for Android-CI. CurrentStatus: completed
  Build finished with result "failed"
```

_See code: [src/commands/run.ts](https://github.com/xWiiLLz/azure-pipelines-from-gitlab/blob/v0.0.0/src/commands/run.ts)_
<!-- commandsstop -->
