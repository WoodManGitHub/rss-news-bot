const RssFeedEmitter = require('rss-feed-emitter')
const feeder = new RssFeedEmitter()
const config = require('./config.json')
const TelegramBot = require('node-telegram-bot-api')

const bot = new TelegramBot(config.telegram.token, { polling: true })

for (let list of config.webList) {
    feeder.add({
        url: list,
        refresh: 2000
    })
}

feeder.on('new-item', (item) => {
    const text = `${item.meta.title}\n${item.title}\nLINK:\n${item['rss:link']['#']}`
    bot.sendMessage(config.telegram.chatID, text)
})
