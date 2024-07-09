const {Promote,Demote} = require("./botController")
const {CopyPost,DeleteFromAwaitedPosts,DeleteFromAutoDelete} = require("./postsController")
class Timer {

     CheckDateAndTime= (bot,data, postsData,WorkingModerators,DLTReq,AwaitReq,PostQue,CloseComments, setNewData,setNewPostsData,Channels) => {
        let now = new Date();
         let currentDay=now.getDay()
         let currentHour=now.getHours()
         let currentTime=now.getTime()
         let ModeratorsAll= data.days
          console.log("цикл начался")
          console.log( AwaitReq)
        for(let j=0;j<ModeratorsAll.length;j++) { //колво каналов
            //цикл постинга

            for(let i=0;i<AwaitReq[j].length;i++) {//7 дней
                if (AwaitReq[j][i] !== undefined) {
                    if (AwaitReq[j][i].finalDate <= currentTime) {
                        CopyPost(AwaitReq[j][i].moderId, AwaitReq[j][i].channelId, AwaitReq[j][i],CloseComments,PostQue)
                        DeleteFromAwaitedPosts(j, i,setNewPostsData,postsData)
                    }
                }
            }
            //цикл автоудаления
            if(DLTReq[j]){
                for(let i=0;i<DLTReq[j].length;i++){
                    if(DLTReq[j][i].mustBeDeletedAt<=currentTime){
                        DeleteFromAutoDelete(DLTReq[j][i],i,setNewPostsData,Channels,postsData)
                    }
                }
            }
            //цикл раздачи админок
            let Moderators=ModeratorsAll[j]
            let channelName = data.channels[j]
            for (let i = 0; i < Moderators[currentDay].length; i++) {
                // console.log(WorkingModerators)
                if (currentHour >= Moderators[currentDay][i].startHour && currentHour < Moderators[currentDay][i].endHour) {
                    // console.log("moder with id "+Moderators[currentDay][i].id+" is working now")
                    if (WorkingModerators.indexOf(Moderators[currentDay][i].indexName) === -1) {
                        WorkingModerators.push(Moderators[currentDay][i].indexName)
                        Promote(bot,channelName, Moderators[currentDay][i].moderId)
                    }
                } else {
                    //  console.log("moder with id "+Moderators[currentDay][i].id+" isn`t working now")
                    if (WorkingModerators.indexOf(Moderators[currentDay][i].indexName) !== -1) {
                        WorkingModerators.splice(WorkingModerators.indexOf(Moderators[currentDay][i].indexName), 1)
                        Demote(bot,channelName, Moderators[currentDay][i].moderId)
                    }
                }
            }
        }

    }

}

module.exports = new Timer()