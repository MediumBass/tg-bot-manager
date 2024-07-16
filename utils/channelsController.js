const data = require("../db/database.json");
const postsData = require("../db/postsDatabase.json");
const fs = require("fs");
class ChannelsController {
     CreateNewChannel = (bot,chatId,channelName,commentsChannel,AdminsIdGlobal,setNewData,setNewPostData,ChannelsString,text) => {
        let EditedModerators=data
        let EditedPosts=postsData
        EditedModerators.channels.push(channelName)
        EditedModerators.adminsLocal.push(AdminsIdGlobal)
        EditedModerators.adminsManagers.push([])
        EditedModerators.days.push([[],[],[],[],[],[],[]])
        EditedPosts.awaitedPosts.push([])
        EditedPosts.deleteRequests.push([])
        EditedModerators.commentsChannel.push(commentsChannel)
        fs.writeFile('db/database.json', JSON.stringify(EditedModerators), err => {
            if (err) {
                console.error(err);
            } else {
                setNewData(EditedModerators)
            }
        })
        fs.writeFile('db/postsDatabase.json', JSON.stringify(EditedPosts), err => {
            if (err) {
                console.error(err);
            } else {
                setNewPostData(EditedPosts)
            }
        })
         bot.sendMessage(chatId, text);
            ChannelsString()
    }
     DeleteChannel = (bot,chatId,channelName,setNewData,setNewPostData,ChannelsString,text) => {
        let EditedModerators=data
        let EditedPosts=postsData
        EditedModerators.channels.splice(channelName,1)
        EditedModerators.adminsLocal.splice(channelName,1)
        EditedModerators.adminsManagers.splice(channelName,1)
        EditedModerators.days.splice(channelName,1)
        EditedPosts.awaitedPosts.splice(channelName,1)
        EditedPosts.deleteRequests.splice(channelName,1)
        EditedModerators.commentsChannel.splice(channelName,1)
        fs.writeFile('db/database.json', JSON.stringify(EditedModerators), err => {
            if (err) {
                console.error(err);
            } else {
                setNewData(EditedModerators)
                setNewPostData(EditedPosts)
            }
        })
        fs.writeFile('db/postsDatabase.json', JSON.stringify(EditedPosts), err => {
            if (err) {
                console.error(err);
            } else {
                setNewPostData(EditedPosts)
            }
        })
        bot.sendMessage(chatId, text);
        ChannelsString()
    }
    ChangeUserLanguage = (users,buttonData,chatId) =>{
        users[chatId] = buttonData
        fs.writeFile('db/users.json', JSON.stringify(users), err => {

        })
    }

}

module.exports = new ChannelsController()