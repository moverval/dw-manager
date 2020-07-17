# DW Bot

A Discord Bot that was made for [Deine Werbung](https://discord.gg/Kmvf9wB)


## Installing

This Bot is based on NodeJS (NodeJS must be installed to run it). To use it, install the packages, configure it and build the files.

```cli
npm ci
touch .env
npm run build
```

In ``.env``, ``BOT_TOKEN``, ``BOT_PREFIX``, ``MAIN_GUILD`` and ``CONFIRMATION_CHANNEL`` must be defined Variables.

Example .env:

```.env
BOT_TOKEN="Y0UR.T0K3N"
BOT_PREFIX="++"
MAIN_GUILD="460424836246929409"
CONFIRMATION_CHANNEL="466225497593085972"
```

The Bot also needs a folder called ``data`` (in project folder) to save and load data.

```
mkdir data
```

After configuring, the bot can be started with

```cli
npm run start
```
