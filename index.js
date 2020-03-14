const RssFeedEmitter = require('rss-feed-emitter')
const config = require('./config.json')
const TelegramBot = require('node-telegram-bot-api')
const Queue = require('promise-queue')
const fs = require('fs');

const feeder = new RssFeedEmitter()
const messageQueue = new Queue(1)
const bot = new TelegramBot(config.telegram.token, { polling: true })

for (let list of config.webList) {
    feeder.add({
        url: list,
        refresh: 20000
    })
}

bot.onText(/\/addrss (.+)/, (msg, match) => {
    const url = match[1]
    const urlRegex = /(https?:\/\/)/
    const userID = msg.from.id

    if (config.admin.includes(userID) || !urlRegex.test(url)) {
        bot.sendMessage(msg.from.id, 'Permission denied or URL entered incorrectly!')
        return
    }

    feeder.add({
        url: url,
        refresh: 20000
    })

    saveUrl(url)

    if (config.webList.includes(url)) {
        bot.sendMessage(msg.from.id, 'URL existed!')
        return
    }

    bot.sendMessage(msg.from.id, `${url}\nAdded successfully!`)
})

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

const saveUrl = (url) => {
    fs.readFile('./config.json', 'utf8', (err, data) => {
        if (err) throw err

        objData = JSON.parse(data)

        if (objData.webList.includes(url)) {
            return
        } else {
            objData.webList.push(url)
            jsonData = JSON.stringify(objData, null, 4)
    
            fs.writeFile('./config.json', jsonData, (err) => { throw err })
        }
    })
}
