const data = require("../db/database.json");
const fs = require("fs");
const postsData = require("../db/postsDatabase.json");

class ModersController {
     CreateNewModerator = (bot,chatId,ModerQue,setNewData,text) => {
        let Moderator = Object.assign({}, ModerQue[ModerQue.findIndex(el => el.adminId === chatId)])
        let EditedModerators=data
        EditedModerators.days[Moderator.channelId][Moderator.workingDay].push(Moderator)
        fs.writeFile('db/database.json', JSON.stringify(EditedModerators), err => {
            if (err) {
                console.error(err);
            } else {
                setNewData(EditedModerators)
            }
        })
        ModerQue.splice(ModerQue[ModerQue.findIndex(el => el.adminId === chatId)], 1)
         bot.sendMessage(chatId, text);

    }
     CreateNewManager = (bot,chatId, ManagerQue,setNewData,text) => {
        let thisManager = Object.assign({}, ManagerQue[ManagerQue.findIndex(el => el.adminId === chatId)])
        let EditedManagers=data

        EditedManagers.adminsManagers[thisManager.channelId].push(parseInt(thisManager.managerId,10))
        fs.writeFile('db/database.json', JSON.stringify(EditedManagers), err => {
            if (err) {
                console.error(err);
            } else {
                setNewData(EditedManagers)
            }
        })
        ManagerQue.splice(ManagerQue.findIndex(el => el.adminId === chatId), 1)
         bot.sendMessage(chatId, text);
    }
     CreateNewLocalAdmin = (chatId,userId,newLocalAdminId,setNewData) => {
        let EditedModerators=data
        EditedModerators.adminsLocal[newLocalAdminId].push(parseInt(userId,10))
        fs.writeFile('db/database.json', JSON.stringify(EditedModerators), err => {
            if (err) {
                console.error(err);
            } else {
                setNewData(EditedModerators)
            }
        })
        newLocalAdminId=null
    }

     EditDatabaseDeleteModeratorByID = (bot,chat,ModerQue,setNewData, text1, text2) => {
        let Moderator = Object.assign({}, ModerQue[ModerQue.findIndex(el => el.adminId === chat)])
        let EditedModerators=data
        for(let i =0;i<7;i++){

            let index = EditedModerators.days[Moderator.channelId][i].findIndex(obj => obj.moderId === Moderator.moderId);
            if(index!==-1){
                EditedModerators.days[Moderator.channelId][i].splice(index,1)
            }
        }
        fs.writeFile('db/database.json', JSON.stringify(EditedModerators), err => {
            if (err) {
                console.error(err);
            } else {
                setNewData(EditedModerators)
            }
        })
       bot.sendMessage(chat, text1+ Moderator.moderId+ text2)
    }
     DatabaseDeleteAllPostsFrom = (bot,deletedModerId, chat,setNewPostsData,text1,text2) => {
        let EditedPosts=postsData
        for(let i=0;i<postsData.awaitedPosts.length;i++) {
            for (let j = 0; j < postsData.awaitedPosts[i].length; j++) {
                if (postsData.awaitedPosts[i][j].moderId==deletedModerId) {
                    postsData.awaitedPosts[i].splice(j,1)
                }
            }
        }
        fs.writeFile('db/postsDatabase.json', JSON.stringify(EditedPosts), err => {
            if (err) {
                console.error(err);
            } else {
                setNewPostsData(EditedPosts)
            }
        })
       bot.sendMessage(chat, text1+ deletedModerId+ text2)
    }
     EditDatabaseDeleteModeratorByDay = (bot,chat,ModerQue,setNewData,text1,text2) => {
        let Moderator = Object.assign({}, ModerQue[ModerQue.findIndex(el => el.adminId === chat)])
        let EditedModerators=data
        let index = EditedModerators.days[Moderator.channelId][Moderator.workingDay].findIndex(obj => obj.moderId === Moderator.moderId);
        if(index!==-1){
            EditedModerators.days[Moderator.channelId][Moderator.workingDay].splice(index,1)
        }
        fs.writeFile('db/database.json', JSON.stringify(EditedModerators), err => {
            if (err) {
                console.error(err);
            } else {
                setNewData(EditedModerators)
            }
        })
         bot.sendMessage(chat, text1+Moderator.moderId+ text2+Moderator.workingDay)
    }
     DeleteManagerById = (bot,chatId,ManagerQue,setNewData,text) => {
        let thisManager = Object.assign({}, ManagerQue[ManagerQue.findIndex(el => el.adminId === chatId)])
        let EditedManagers=data

        EditedManagers.adminsManagers[thisManager.channelId].splice(EditedManagers.adminsManagers.indexOf(thisManager.managerId),1)
        fs.writeFile('db/database.json', JSON.stringify(EditedManagers), err => {
            if (err) {
                console.error(err);
            } else {
                setNewData(EditedManagers)
            }
        })
        ManagerQue.splice(ManagerQue.findIndex(el => el.adminId === chatId), 1)
       bot.sendMessage(chatId, text);
    }
     DeleteNewLocalAdmin = (chatId,userId,newLocalAdminId,setNewData) => {
        let EditedModerators=data
        EditedModerators.adminsLocal[newLocalAdminId].splice(EditedModerators.adminsLocal.indexOf(parseInt(userId,10)),1)
        fs.writeFile('db/database.json', JSON.stringify(EditedModerators), err => {
            if (err) {
                console.error(err);
            } else {
               setNewData(EditedModerators)
            }
        })
        newLocalAdminId=null
    }
    NewModerator(adminId) {
        this.adminId = adminId;
    }
}

module.exports = new ModersController()