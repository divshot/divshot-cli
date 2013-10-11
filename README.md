Divshot CLI
===========

CLI for Divshot

## Install

```
npm install divshot -g
```

## Usage

#### Login

```javascript
divshot login // Prompts for email and password
```

#### Logout

```
divshot logout
```

#### List Apps

```
divshot apps
```

#### Create App

```
divshot create [APP_NAME]
```

If no app name is provided, it attempts to read the Divshot.io config file. If there is no name provided, you will be prompted to enter an app name.

#### Release an App

```
divshot release [ENVIRONMENT]
```

If no environment is provided, it will assume you mean ` production `.

##### Environments

* production
* staging
* development

## Test

```
grunt test
```
