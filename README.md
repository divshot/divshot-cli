# Divshot CLI

CLI for Divshot

#### [Commands](#commands-1)

* [account](#account) - display basic account details
* [account:redeem](#accountredeem) - reedem a voucher and credit it to your account
* [apps](#apps) - list your apps
* [auth:token](#authtoken) - print out your access token
* [config](#config) - list, set, or remove keys and values from your app
* [config:add](#configadd) - add a value to the config file
* [config:remove](#configremove) - remove a value from the config file
* [create](#create) - create a new app
* [destroy](#destroy) - delete an app
* [domains](#domains) - list your domains
* [domains:add](#domainsadd) - add a custom domain to your app
* [domains:remove](#domainsremove) - remove a custom domain from your app
* [help](#help) - get help with common commands
* [init](#init) - step by step guide to initiate an app in the current directory
* [login](#login) - login to Divshot
* [logout](#logout) - logout from Divshot
* [open](#open) - open the current app in your default browser
* [promote](#promote) - promote one environment to another
* [protect](#protect) - add http basic auth to any environment
* [push](#push) - deploy your app to the specified environment
* [rename](#rename) - change the name of an app
* [rollback](#rollback) - rollback an environment to a previous release
* [server](#server) - start server for local dev
* [status](#status) - show release info for each environment

#### Command Options

* `-h, --help` - show the help menu
* `-v, --version` - show current version of Divshot Cli
* `-t, --token [token] ` - manually pass access token
* `-a, --app [app name] ` - manually supply an app name

####Environments

* ` development ` - this is the default environment during app deployment
* ` staging `
* ` production `

Each environment is immediately available and deployent at the following url scheme: **http://[environment].[app name].divshot.io**. You may reference [Divshot Builds and Environments](http://docs.divshot.io/guides/builds) for a more detailed explanation.

## Install

```
npm install divshot-cli -g
```

## Commands

### account

```
divshot account
```

Display your basic accountd details

### account:redeem

```
divshot account:redeem [voucher code]
```

Reedem a voucher and credit it to your account

### apps

```
divshot apps
```

List your Divshot apps.

### auth:token

```
divshot auth:token
```

Print out your access token. This token is used to authenticate you with the Divshot api.

### config

```
divshot config
```

List the keys and values from your Divshot app config file. See [Divshot configuration reference](http://docs.divshot.io/guides/configuration) for more details on these values.

### config:add

```
divshot config:add [key] [value]
```

Add a value to your Divshot app config file. See [Divshot configuration reference](http://docs.divshot.io/guides/configuration) for more details on these values.

### config:remove

```
divshot config:remove [key]
```

Remove a value from your Divshot app config file. See [Divshot configuration reference](http://docs.divshot.io/guides/configuration) for more details on these values.

### create

```
divshot create [app name]
```

Create a new Divshot app. If no app name is provided, it attempts to read from your Divshot configuration file. It that does not exist, it will prompt you for an app name. You can easily create a new Divshot app locally and remotely by using [` divshot init `](#init).

### destroy


```
dishot destroy [app name]
```

Delete a Divshot app. This is permanent and immediate. It removes not only your files, but it disables the subdomain associated with the application.

### domains

```
divshot domains
```

See a list of all custom domains associated with your app. For more in depth usage, see [Divshot Custom Domains](http://docs.divshot.io/guides/domains)

### domains:add

```
divshot domains:add [domain]
```

Add a custom domain to your app. You may see a list of your domains with [` divshot domains `](#domains). For more in depth usage, see [Divshot Custom Domains](http://docs.divshot.io/guides/domains)

### domains:remove

```
divshot domains:remove [domain]
```

Remove a custom domain from your app. You may see a list of your domains with [` divshot domains `](#domains). For more in depth usage, see [Divshot Custom Domains](http://docs.divshot.io/guides/domains)

### help

```
divshot help
```

Get help with common Divshot commands. Lists all the available commands.

If you need help with a specific command, you may specify that command after the word *help*.

```
divshot help [command]
```

### init

```
divhshot init
```

Step by step guide to initiate an app in the current directory. The steps you are taken through are as follows:

1. ` name ` - app name
2. ` root ` - the root directory of the app relative to the current directory
3. ` error page ` - the relative path or absolute url of an error/not foud page to display in in your app.
4. ` create app ` - do you want to create  new app on Divshot upon completing these steps? (As opposed to only creating the app locally)

Once your initiated your app, the *root* directory will now contain a ` divshot.json ` file with your settings. You may reference [Divshot configuration reference](http://docs.divshot.io/guides/configuration) for a more detailed description of this file.

### login

```
divshot login
```

Login to your Divshot account.

### logout

```
divshot logout
```

Logout of your account.

### open

```
divshot open [optional environment]
```

Open your app in your default browser

Example:

* ` divshot open ` - Opens the production, cdn environment of your app
* ` divshot open development ` - Opens up the development environment of your app

### promote

```
divshot promote [from env] [to env]
```

Promote one environment to another. A typical use case for this command would be to deploy your staging app to production without having to reploy all the files. See [environments](#environments) for a list of available environments.

Example promotions

* ` divshot promote development staging ` - development -> staging
* ` divshot promote staging production ` - staging -> production

### protect

```
divshot protect [environment] [username:password]
```

Protect your development and staging and environments with [http authentication](http://en.wikipedia.org/wiki/Basic_access_authentication).

### push

```
divshot push [environment]
```

Deploy your app to the specified environment. If no environment is given, we assume that you mean *production*. The entire push process takes as long as the number of files in your project. Once deployed, your app is immediately available. See [environments](#environments) for a list of available environments.

### rename

```
divshot rename [new app name]
```

Rename your app. This changes the subomdain on Divshot and updates your configuration file. It is permanent once complete.

### rollback

```
divshot rollback [environment]
```

Rollback the given environment to a previous release. This is useful when buggy code has been deployed. Divshot automatically detects what your previously release was and rollsback to that release. See [environments](#environments) for a list of available environments.

### server

```
divshot server
```

Start a server for local development. This local server mimics the capabilities of static sites running on [Divshot](http://divshot.io). Refer to the [Divshot documentation](http://docs.divshot.io/guides/configuration) for configuration instructions.

Server command options:

* ` -p, --port [port]` - specify the port for the server to run. Defaults to *3474*
* ` -h, --host [hostname]` - specify a custom hostname for your app to run at. Defaults to *localhost*

### status

```
divshot status [environment]
```

Show release info for each environment. If you no environment is specified, the latest release info will be listed for each enviornment. If an environment is specifed, it will list the last few releases for that environment. See [environments](#environments) for a list of available environments.

