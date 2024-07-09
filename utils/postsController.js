
const fs = require("fs");
const {CopyMSG,ForwardMSG, DeleteMessage} = require("./botController")
class PostsController{
     CreateNewAwaitedPost = (chatId,channelId,PostQue) => {
        let EditedPosts=postsData
        console.log(PostQue[chatId].yearPost,PostQue[chatId].monthPost,PostQue[chatId].dayPost,PostQue[chatId].hoursPost,PostQue[chatId].minutesPost)
        let requestedDate=new Date(PostQue[chatId].yearPost,PostQue[chatId].monthPost,PostQue[chatId].dayPost,PostQue[chatId].hoursPost,PostQue[chatId].minutesPost,0)
        PostQue[chatId].finalDate=requestedDate.getTime()
        EditedPosts.awaitedPosts[channelId].push(PostQue[chatId])
        fs.writeFile('postsDatabase.json', JSON.stringify(EditedPosts), err => {
            if (err) {
                console.error(err);
            } else {
                postsData=EditedPosts
            }
        })
    }
    CopyPost = (bot, from, destination, postObject,CloseComments) => {
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

            CopyMSG(bot,destination, from, postObject,  inlineKeyboard, CloseComments)
        }else{
            ForwardMSG(bot,destination, from, postObject,  inlineKeyboard)
        }
    }
    DeleteFromAwaitedPosts = (channelId,postId,func,postsData) => {
        let EditedPosts=postsData
        EditedPosts.awaitedPosts[channelId].splice(postId,1)
        fs.writeFile('postsDatabase.json', JSON.stringify(EditedPosts), err => {
            if (err) {
                console.error(err);
            } else {
                func(EditedPosts)
            }
        })
    }
    HangAutoDelete = (time,postId,channelId,wasPostedOn) => {
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
    DeleteFromAutoDelete = (bot,deleteObject,index,func, Channels,postsData) => {
        let EditedPosts=postsData
        DeleteMessage(Channels[deleteObject.channelId],deleteObject.postId)
        EditedPosts.deleteRequests[deleteObject.channelId].splice(index,1)
        fs.writeFile('postsDatabase.json', JSON.stringify(EditedPosts), err => {
            if (err) {
                console.error(err);
            } else {
                func(EditedPosts)
            }
        })
    }
}
module.exports = new PostsController()