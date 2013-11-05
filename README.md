Divshot CLI
===========

CLI for Divshot

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


## Install

```
npm install divshot-cli -g
```

## Commands

### apps

List your apps

```
divshot apps
```

### auth:token

print out your access token

```
divshot auth:token
```

### config

list, set, or remove keys and values from your app

```
divshot config
```

### config:add

add a value to the config file

```
divshot config:add [key] [value]
```

### config:remove

remove a value from the config file

```
divshot config:remove [key]
```

### create

create a new app

```
divshot create [app name]
```

### destroy

delete a divshot.io app

```
dishot destroy [app name]
```

### domains

list your domains

```
divshot domains
```

### domains:add

add a custom domain to your app

```
divshot domains:add [domain]
```

### domains:remove

remove a custom domain from your app

```
divshot domains:remove [domain]
```

### help

get help with common Divshot.io commands

```
divshot help
```

### init

step by step guide to initiate an app in the current directory

```
divhshot init
```

### login

login to Divshot.io

```
divshot login
```

### logout

logout from Divshot.io

```
divshot logout
```

### promote

promote one environment to another

```
divshot promote [from env] [to env]
```

### push

deploy your app to the specified environment

```
divshot push [environment]
```

### rename

change the name of an app

```
divshot rename [new app name]
```

### rollback

rollback an environment to a previous release

```
divshot rollback [environment]
```

### server

start server for local dev

```
divshot server
```

### status

show release info for each environment

```
divshot status [environment]
```

## Options


