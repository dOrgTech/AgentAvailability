#!/usr/bin/env node
const Bot = require('keybase-bot')
const mathjs = require('mathjs')

//
// This bot replies to any message from any user,
// starting with `/math` (in any channel)
// by actually trying to do the math. For example
// send it :
//
//          /math sqrt(pi/2) * 3!`
//

const bot = new Bot()

// TO-DO: Implement initial availability design
//
// /avail get userName utcOffset
// Gets all availabilities in for a given user in the requested utcOffset
// userName: the Keybase username of the user whose availability is requested
// utcOffset: the UTC offset to apply to the dates requested
// Example: /avail get dorg +08:00
// Availbilities for user dorg:
// 1. 50 default
// 2. 0 3/25/2020-3/27/2020
// 3. 25 4/29/2021-5/1/2021
// 4. 75 5/2/2021-5/10/2021
//
// /avail set workLevel
// Sets the default availability for the user sending the message,
// overriding the previous default value// worklevel: number 0-100, e.g. 50
// Example: /avail add 75
// Added default availability of 50 for dorg
//
// /avail add workLevel utcOffset dateSignalBegin dateSignalEnd
// Adds the availability for the user sending the message
// worklevel: number 0-100, e.g. 50
// utcOffset: the UTC offset for the input dates
// dateSignalBegin: start date of provided availability, e.g. 1/1/2020
// dateSignalEnd: optional, end date of provided availability, e.g. 3/1/2020,
// Example: /avail add 50 +08:00 3/25/2020 3/27/2020
// Added availability 50 +08:00 3/25/2020-3/27/2020 for dorg
//
// /avail rm utcOffset
// Removes an availability for the user sending the message
// via an interative dialogue
// utcOffset: the UTC offset to apply to the dates requested
// Example: /avail rm
// dorg, Which availibity would you like to remove?
// 1. 50 default
// 2. 0 3/25/2020-3/27/2020
// 3. 25 4/29/2021-5/1/2021
// 4. 75 5/2/2021-5/10/2021
//

const msgReply = s => {
  let a1, a2, ans, b1, b2, eqn
  try {
    ans = '= ' + mathjs['eval'](s).toString()
  } catch (e) {
    a1 = Math.floor(Math.random() * 10)
    b1 = Math.floor(Math.random() * 10)
    a2 = Math.floor(Math.random() * 10)
    b2 = Math.floor(Math.random() * 10)
    eqn = '(' + a1 + ' + ' + b1 + 'i) * (' + a2 + ' + ' + b2 + 'i)'
    ans = "Sorry, I can't do that math. Did you know " + eqn + ' = ' + mathjs['eval'](eqn).toString() + '? True.'
  }
  return ans
}

function main() {
  const username = process.env.KB_USERNAME
  const paperkey = process.env.KB_PAPERKEY
  bot
    .init(username, paperkey)
    .then(() => {
      console.log('I am me!', bot.myInfo().username, bot.myInfo().devicename)
      console.log('Beginning watch for new messages.')
      console.log(`Tell anyone to send a message to ${bot.myInfo().username} starting with '/math '`)
      const onMessage = message => {
        if (message.content.type === 'text') {
          const prefix = message.content.text.body.slice(0, 6)
          if (prefix === '/math ') {
            const reply = {body: msgReply(message.content.text.body.slice(6))}
            bot.chat.send(message.conversationId, reply)
          }
        }
      }
      const onError = e => console.error(e)
      bot.chat.watchAllChannelsForNewMessages(onMessage, onError)
    })
    .catch(error => {
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
