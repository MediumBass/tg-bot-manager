let postsData = require("../db/postsDatabase.json");
const fs = require("fs");
const {CopyMSG,ForwardMSG, DeleteMessage} = require("./botController")

const HangAutoDelete = (time,postId,channelId,wasPostedOn) => {
    let EditedPosts=postsData
    let deleteRequest={
        time:time,
        postId:postId,
        channelId:channelId,
        wasPostedOn:wasPostedOn,
        mustBeDeletedAt:wasPostedOn+(3600000*time)
    }
    console.log(EditedPosts)
    EditedPosts.deleteRequests[channelId].push(deleteRequest)
    fs.writeFile('postsDatabase.json', JSON.stringify(EditedPosts), err => {
        if (err) {
            console.error(err);
        } else {
            postsData=EditedPosts
        }
    })
}
class PostsController{

     CreateNewAwaitedPost = (chatId,channelId,PostQue) => {
        let EditedPosts=postsData
        console.log(PostQue[chatId].yearPost,PostQue[chatId].monthPost,PostQue[chatId].dayPost,PostQue[chatId].hoursPost,PostQue[chatId].minutesPost)
        let requestedDate=new Date(PostQue[chatId].yearPost,PostQue[chatId].monthPost,PostQue[chatId].dayPost,PostQue[chatId].hoursPost,PostQue[chatId].minutesPost,0)
        PostQue[chatId].finalDate=requestedDate.getTime()
        EditedPosts.awaitedPosts[channelId].push(PostQue[chatId])
        fs.writeFile('db/postsDatabase.json', JSON.stringify(EditedPosts), err => {
            if (err) {
                console.error(err);
            } else {
                postsData=EditedPosts
            }
        })
    }
    CopyPost = (bot, from, destination, postObject,CloseComments,Channels,text) => {
        console.log("start")
        let inlineKeyboard={
            inline_keyboard: [

            ]
        }
        for(let i=0;i<postObject.buttonName.length;i++) {
            if (postObject.buttonName[i]) {
                inlineKeyboard.inline_keyboard.push([{text: postObject.buttonName[i], url: postObject.buttonUrl[i]}])
            }
        }
        if(postObject.type!=="repost") {

            CopyMSG(bot,destination, from, postObject,  inlineKeyboard, CloseComments,HangAutoDelete,Channels,text)
        }else{
            ForwardMSG(bot,destination, from, postObject,  inlineKeyboard,HangAutoDelete,Channels,text)
        }
    }
    DeleteFromAwaitedPosts = (channelId,postId,func,postsData) => {
        let EditedPosts=postsData
        EditedPosts.awaitedPosts[channelId].splice(postId,1)
        fs.writeFile('db/postsDatabase.json', JSON.stringify(EditedPosts), err => {
            if (err) {
                console.error(err);
            } else {
                func(EditedPosts)
            }
        })
    }

    DeleteFromAutoDelete = (bot,deleteObject,index,func, Channels,postsData) => {
        let EditedPosts=postsData
        DeleteMessage(Channels[deleteObject.channelId],deleteObject.postId)
        EditedPosts.deleteRequests[deleteObject.channelId].splice(index,1)
        fs.writeFile('db/postsDatabase.json', JSON.stringify(EditedPosts), err => {
            if (err) {
                console.error(err);
            } else {
                func(EditedPosts)
            }
        })
    }
    CheckIfYouCanPost = (month, day, hours, minutes, chatId, channelIndex,ModeratorsAll,Channels,AdminsLocal,AdminsIdGlobal) =>{
        let nowS = new Date()
        let requestedDate=new Date(nowS.getFullYear(),month,day,hours,minutes,0)
        let bool=false
        let cellWithRequestedDay=ModeratorsAll[Channels.indexOf(channelIndex)][requestedDate.getDay()]
        if(AdminsLocal[Channels.indexOf(channelIndex)].indexOf(chatId)!==-1||AdminsIdGlobal.indexOf(chatId)!==-1){bool=true}
        for(let i=0;i<cellWithRequestedDay.length;i++){
            if(cellWithRequestedDay[i].moderId==chatId){
                if(hours>=cellWithRequestedDay[i].startHour&&hours<cellWithRequestedDay[i].endHour){
                    bool=true
                }
            }
        }
        return bool
    }
}
module.exports = new PostsController()