# Divshot CLI [![NPM version](http://img.shields.io/npm/v/divshot-cli.svg?style=flat-square)](http://npmjs.org/package/divshot-cli)

CLI for Divshot

#### [Commands](#commands-1)

* [account](#account) - display basic account details
* [account:redeem](#accountredeem) - redeem a voucher and credit it to your account
* [apps](#apps) - list your apps
* [auth:token](#authtoken) - print out your access token
* [cert](#cert) - upload an SSL certificate
* [changelog](#changelog) - view the cli changelog
* [config](#config) - list, set, or remove keys and values from your app
* [config:add](#configadd) - add a value to the config file
* [config:remove](#configremove) - remove a value from the config file
* [create](#create) - create a new app
* [destroy](#destroy) - delete an app
* [domains](#domains) - list your domains
* [domains:add](#domainsadd) - add a custom domain to your app
* [domains:remove](#domainsremove) - remove a custom domain from your app
* [emails](#emails) - list emails associated with your app
* [emails:add](#emailsadd) - add an email to your app
* [emails:remove](#emailsremove) - remove an email from your app
* [emails:resend](#emailsresend) - resend the confirmation email
* [env](#env) - list environment variables for your app
* [env:add](#envadd) - add an environment variable to your app
* [env:config](#envconfig) - configure your app's environment
* [env:pull](#envpull) - copy environment data to your local environment
* [files](#files) - list the current files associated with the given environment
* [help](#help) - get help with common commands
* [hooks](#hooks) - list webhooks
* [hooks:add](#hooksadd) - add a webhook
* [hooks:remove](#hooksremove) - remove a webhook
* [hooks:pause](#hookspause) - pause a webhook
* [hooks:resume](#hooksresume) - resume a webhook
* [init](#init) - step by step guide to initiate an app in the current directory
* [login](#login) - login to Divshot
* [logout](#logout) - logout from Divshot
* [open](#open) - open the current app in your default browser
* [performance](#performance) - show if current app has performance status
* [performance:on](#performanceon) - give the current app performance status
* [performance:off](#performanceoff) - remove performance status from the current app
* [promote](#promote) - promote one environment to another
* [protect](#protect) - add http basic auth to any environment
* [pull](#pull) - download the current files for a given environment into a directory
* [push](#push) - deploy your app to the specified environment
* [rename](#rename) - change the name of an app
* [rollback](#rollback) - rollback an environment to a previous release
* [server](#server) - start server for local dev
* [stats](#stats) - show stats info for your app
* [status](#status) - show release info for each environment
* [unprotect](#unprotect) - remove basic auth from an environment on your app

#### Command Options

* `-h, --help` - show the help menu
* `-v, --version` - show current version of Divshot CLI
* `-t, --token [token]` - manually pass access token
* `-a, --app [app name]` - manually supply an app name
* `-c, --config [config]` - use a different config file
* `--timeout [timeout]` - set the command timeout in milliseconds

#### Environments

* ` development ` - this is the default environment during app deployment
* ` staging `
* ` production `

Each environment is immediately available and deployed at the following URL scheme: **http://[environment].[app name].divshot.io**. You may reference [Divshot Builds and Environments](http://docs.divshot.io/guides/builds) for a more detailed explanation.

## Install

```
npm install divshot-cli -g
```

## Commands

### account

```
divshot account
```

Display your basic account details.

### account:redeem

```
divshot account:redeem [voucher code]
```

Redeem a voucher and credit it to your account.

### apps

```
divshot apps
```

List your Divshot apps.

### auth:token

```
divshot auth:token
```

Print out your access token. This token is used to authenticate you with the Divshot API.

### config

```
divshot config
```

List the keys and values from your Divshot app config file. See [Divshot configuration reference](http://docs.divshot.io/guides/configuration) for more details on these values.

### cert

```
divshot cert [path/to/certificate.crt] [path/to/key.key]
```

Upload your application's SSL certificate.

### changelog

```
divshot changelog
```

View the Divshot CLI changelog

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
divshot destroy [app name]
```

Delete a Divshot app. This is permanent and immediate. It removes not only your files, but it disables the subdomain associated with the application.

### domains

```
divshot domains
```

See a list of all custom domains associated with your app. For more in-depth usage, see [Divshot Custom Domains](http://docs.divshot.io/guides/domains).

### domains:add

```
divshot domains:add [domain]
```

Add a custom domain to your app. You may see a list of your domains with [` divshot domains `](#domains). For more in-depth usage, see [Divshot Custom Domains](http://docs.divshot.io/guides/domains).

### domains:remove

```
divshot domains:remove [domain]
```

Remove a custom domain from your app. You may see a list of your domains with [` divshot domains `](#domains). For more in-depth usage, see [Divshot Custom Domains](http://docs.divshot.io/guides/domains).

### emails

```
divshot emails
```

Show any emails associated with this app. Also shows which emails have been approved and which emails are pending authorization by the email owner.

### emails:add

```
divshot emails:add [email]
```

Add an email to the current app. Once added, the email will receive an email that the email owner must use to authorize the email address.

### emails:remove

```
divshot emails:remove [email]
```

Remove an email from the current app.

### emails:resend

```
divshot emails:resend [email]
```

Resend the the authorization email for the given email address.

### env

```
divshot env [environment]
```

List the key/value pairs of environment variables associated with the given environment on the current app. See [Environment Variables](http://docs.divshot.com/guides/environment-variables) for more details.

### env:add

```
divshot env:add [environment] KEY=value KEY2=value ...
```

Add environment variables to the current app. See [Environment Variables](http://docs.divshot.com/guides/environment-variables) for more details.

### env:config

```
divshot env:config [environment] setting=value ...
```

Configure values in your application's environment. Possible and helpful values include:

* `force_ssl` - Force ssl on all requests to your app. Takes values `true` or `false`. 
* `force_domain` - Force all requests to your app's production ready domains to redirect to the given domain. Takes the domain as the value

### env:pull

```
divshot env:pull [environment]
```

Copy environment data to your local environment. Creates a `.env.json` file that is available to your app with `__env.js` or `__env.json`. See [Environment Variables](http://docs.divshot.com/guides/environment-variables) for more details.

### files

```
divshot files [environment]
```

List the files currently associated with the given environment. These are the files that were deployed to Divshot using [divshot push](#push)

### help

```
divshot help
```

Get help with common Divshot commands. Lists all the available commands.

If you need help with a specific command, you may specify that command after the word *help*.

```
divshot help [command]
```

#### hooks

```
divshot hooks
```

Get a list of webhooks for the current app. For more documentation on using Divshot webhooks, see the [Webhook Documentation](http://docs.divshot.com/guides/webhooks).

#### hooks:add

```
divshot hooks:add [url]
```

Add a webhook to the current app. For more documentation on using Divshot webhooks, see the [Webhook Documentation](http://docs.divshot.com/guides/webhooks).

#### hooks:remove

```
divshot hooks:remove [optional url]
```

Remove a webhook from the current app. If no url is provided, you will be prompted with a list of your webhooks to select for removal. For more documentation on using Divshot webhooks, see the [Webhook Documentation](http://docs.divshot.com/guides/webhooks).

#### hooks:pause

```
divshot hooks:pause [optional url]
```

Pause a webhook without deleting it for the current app. If no url is provided, you will be prompted with a list of your webhooks to select to pause. For more documentation on using Divshot webhooks, see the [Webhook Documentation](http://docs.divshot.com/guides/webhooks).

#### hooks:resume

```
divshot hooks:resume [optional url]
```

Resume a webhook for the current app. If no url is provided, you will be prompted with a list of your webhooks to select to resume. For more documentation on using Divshot webhooks, see the [Webhook Documentation](http://docs.divshot.com/guides/webhooks).

### init

```
divshot init
```

Step by step guide to initiate an app in the current directory. The steps you are taken through are as follows:

1. ` name ` - app name
2. ` root ` - the root directory of the app relative to the current directory
3. ` error page ` - the relative path or absolute url of an error/not found page to display in your app
4. ` create app ` - do you want to create a new app on Divshot upon completing these steps? (As opposed to only creating the app locally)

Once you initiated your app, the *root* directory will now contain a ` divshot.json ` file with your settings. You may reference [Divshot configuration reference](http://docs.divshot.io/guides/configuration) for a more detailed description of this file.

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

Open app in your default browser.

Example:

* ` divshot open ` - Opens the production, CDN environment of your app
* ` divshot open development ` - Opens up the development environment of your app

### performance

```
divshot performance
```

Show if current app has performance status. For more details on apps and performance status see [High Performance Mode Documenation](http://docs.divshot.io/guides/high-performance)


### performance:on

```
divshot performance:on
```

Give the current app performance status. For more details on apps and performance status see [High Performance Mode Documenation](http://docs.divshot.io/guides/high-performance)

### performance:off

```
divshot performance:off
```

Remove performance status from the current app. For more details on apps and performance status see [High Performance Mode Documenation](http://docs.divshot.io/guides/high-performance)


### promote

```
divshot promote [from env] [to env]
```

Promote one environment to another. A typical use case for this command would be to deploy your staging app to production without having to redeploy all the files. See [environments](#environments) for a list of available environments.

Example promotions

* ` divshot promote development staging ` - development -> staging
* ` divshot promote staging production ` - staging -> production

### protect

```
divshot protect [environment] [username:password]
```

Protect your development and staging environments with [http authentication](http://en.wikipedia.org/wiki/Basic_access_authentication).

### pull

```
divshot pull [environment] [optional directory]
```

Download all the files currently associated with the given environment. If no directory is provided, it defaults to the current directory. These files are the files deployed to Divshot using [divshot push](#push)

### push

```
divshot push [environment]
```

Deploy your app to the specified environment. If no environment is given, we assume that you mean *production*. The entire push process takes as long as the number of files in your project. Once deployed, your app is immediately available. See [environments](#environments) for a list of available environments.

### rename

```
divshot rename [new app name]
```

Rename your app. This changes the subdomain on Divshot and updates your configuration file. It is permanent once complete.

### rollback

```
divshot rollback [environment]
```

Rollback the given environment to a previous release. This is useful when buggy code has been deployed. Divshot automatically detects and rolls back to your previous release. See [environments](#environments) for a list of available environments.

### server

```
divshot server
```

Start a server for local development. This local server mimics the capabilities of static sites running on [Divshot](http://divshot.io). Refer to the [Divshot documentation](http://docs.divshot.io/guides/configuration) for configuration instructions.

Server command options:

* ` -p, --port [port]` - specify the port for the server to run. Defaults to *3474*
* ` -h, --host [hostname]` - specify a custom hostname for your app to run at. Defaults to *localhost*

### stats

```
divshot stats
```

Show stats infor for your app

### status

```
divshot status [environment]
```

Show release info for each environment. If no environment is specified, the latest release info will be listed for each environment. If an environment is specified, it will list the last few releases for that environment. See [environments](#environments) for a list of available environments.

### unprotect

```
divshot unprotect [environment]
```

Unprotect your development and staging environments and remove the authentication.



