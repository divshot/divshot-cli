Divshot CLI
===========

CLI for Divshot

#### [Commands]()

* [apps](https://github.com/divshot/divshot-cli/blob/master/README.md#apps) - list your apps
* [auth:token](https://github.com/divshot/divshot-cli/blob/master/README.md#authtoken) - print out your access token
* [config](https://github.com/divshot/divshot-cli/blob/master/README.md#config) - list, set, or remove keys and values from your app
* [config:add](https://github.com/divshot/divshot-cli/blob/master/README.md#configadd) - add a value to the config file
* [config:remove](https://github.com/divshot/divshot-cli/blob/master/README.md#configremove) - remove a value from the config file
* [create](https://github.com/divshot/divshot-cli/blob/master/README.md#create) - create a new app
* [destroy](https://github.com/divshot/divshot-cli/blob/master/README.md#destroy) - delete a divshot.io app
* [domains](https://github.com/divshot/divshot-cli/blob/master/README.md#domains) - list your domains
* [domains:add](https://github.com/divshot/divshot-cli/blob/master/README.md#domainsadd) - add a custom domain to your app
* [domains:remove](https://github.com/divshot/divshot-cli/blob/master/README.md#domainsremove) - remove a custom domain from your app
* [help](https://github.com/divshot/divshot-cli/blob/master/README.md#help) - get help with common Divshot.io commands
* [init](https://github.com/divshot/divshot-cli/blob/master/README.md#init) - step by step guide to initiate an app in the current directory
* [login](https://github.com/divshot/divshot-cli/blob/master/README.md#login) - login to Divshot.io
* [logout](https://github.com/divshot/divshot-cli/blob/master/README.md#logout) - logout from Divshot.io
* [promote](https://github.com/divshot/divshot-cli/blob/master/README.md#promote) - promote one environment to another
* [push](https://github.com/divshot/divshot-cli/blob/master/README.md#push) - deploy your app to the specified environment
* [rename](https://github.com/divshot/divshot-cli/blob/master/README.md#rename) - change the name of an app
* [rollback](https://github.com/divshot/divshot-cli/blob/master/README.md#rollback) - rollback an environment to a previous release
* [server](https://github.com/divshot/divshot-cli/blob/master/README.md#server) - start server for local dev
* [status](https://github.com/divshot/divshot-cli/blob/master/README.md#status) - show release info for each environment
* [-v]() - show current version of Divshot Cli
 
#### Command Options

* ` --token [token] ` - manually pass access token
* ` --app [app name] ` - manually supply the Divshot.io app name
* ` --no-color ` - strip all use of color in output

####Environments

* ` development `
* ` staging `
* ` production ` - this is the default environment during app deployment

Each environment is immediately available and deployent at the following url scheme: **http://[environment].[app name].divshot.io**.


## Install

```
npm install divshot-cli -g
```

## Commands

### apps

```
divshot apps
```

List your apps.

### auth:token

```
divshot auth:token
```

Print out your access token.

### config

```
divshot config
```

List, set, or remove keys and values from your app.

### config:add

```
divshot config:add [key] [value]
```

Add a value to the config file.

### config:remove

```
divshot config:remove [key]
```

Remove a value from the config file.

### create

```
divshot create [app name]
```

Create a new app.

### destroy


```
dishot destroy [app name]
```

Delete a divshot.io app.

### domains

```
divshot domains
```

List your domains.

### domains:add

```
divshot domains:add [domain]
```

Add a custom domain to your app.

### domains:remove

```
divshot domains:remove [domain]
```

Remove a custom domain from your app.

### help

```
divshot help
```

Get help with common Divshot.io commands.

### init

```
divhshot init
```

Step by step guide to initiate an app in the current directory.

### login

```
divshot login
```

Login to Divshot.io.

### logout

```
divshot logout
```

Logout from Divshot.io.

### promote

```
divshot promote [from env] [to env]
```

Promote one environment to another.

### push

```
divshot push [environment]
```

Deploy your app to the specified environment. If no environment is given, we assume that you mean *production*. The entire push process takes as long as the number of files in your project. Once deployed, your app is immediately available. See [environments]() for a list of available environments.

### rename

```
divshot rename [new app name]
```

Rename your app. This changes the subomdain on Divshot.io and updates your configuration file. It is permanent once complete.

### rollback

```
divshot rollback [environment]
```

Rollback the given environment to a previous release. This is useful when buggy code has been deployed. Divshot.io automatically detects what your previously release was and rollsback to that release. See [environments]() for a list of available environments.

### server

```
divshot server
```

Start a server for local development. This local server mimics the capabilities of static sites running on [Divshot.io](http://divshot.io). Refer to the [Divshot.io documentation](http://docs.divshot.io/guides/configuration) for configuration instructions.

Server command options:

* ` -p, --port [port]` - specify the port for the server to run. Defaults to *3474*
* ` -h, --host [hostname]` - specify a custom hostname for your app to run at. Defaults to *localhost*

### status

```
divshot status [environment]
```

Show release info for each environment. If you no environment is specified, the latest release info will be listed for each enviornment. If an environment is specifed, it will list the last few releases for that environment. See [environments]() for a list of available environments.

