#!/usr/bin/env node
import Bot from 'keybase-bot'

const bot = new Bot()
const commandPrefix:string = '/avail '

const msgReply = (s: any) => {
  return "Hello, there";
}

function main() {
  const username = process.env.KB_USERNAME
  const paperkey = process.env.KB_PAPERKEY
  bot
    .init(username || '', paperkey || '')
    .then(() => {
      console.log('Starting up', bot.myInfo()?.username, bot.myInfo()?.devicename)
      console.log(`Watching for new messages to ${bot.myInfo()?.username} starting with ${commandPrefix}`)
      const onMessage = (message:any) => {
        if (message.content.type === 'text') {
          const prefix = message.content.text.body.slice(0, commandPrefix.length)
          if (prefix === commandPrefix) {
            const reply = {body: msgReply(message.content.text.body.slice(6))}
            bot.chat.send(message.conversationId, reply)
          }
        }
      }
      const onError = (e:any) => console.error(e)
      bot.chat.watchAllChannelsForNewMessages(onMessage, onError)
    })
    .catch((error:any) => {
      console.error(error)
      shutDown()
    })
}

function shutDown() {
  bot.deinit().then(() => process.exit())
}

process.on('SIGINT', shutDown)
process.on('SIGTERM', shutDown)

main()
