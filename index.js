const RssFeedEmitter = require('rss-feed-emitter')
const config = require('./config.json')
const TelegramBot = require('node-telegram-bot-api')
const Queue = require('promise-queue')

const feeder = new RssFeedEmitter()
const messageQueue = new Queue(1)
const bot = new TelegramBot(config.telegram.token, { polling: true })

for (let list of config.webList) {
    feeder.add({
        url: list,
        refresh: 20000
    })
}

feeder.on('new-item', (item) => {
    const text = `${item.meta.title}\n${item.title}\n${item['rss:link']['#']}`

    queueSendMessage(config.telegram.chatID, text)
})

const queueSendMessage = (chatID, text) => {
    return messageQueue.add(async () => {
        const callback = bot.sendMessage(chatID, text)
        await sleep(10000)
        return callback
    })
}

const sleep = (time) => {
    return new Promise(resolve => setTimeout(resolve, time));
}
