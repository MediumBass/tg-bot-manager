const { Promote, Demote } = require('./botController');
const { CopyPost, DeleteFromAwaitedPosts, DeleteFromAutoDelete } = require('./postsController');

class Timer {
  CheckDateAndTime(bot, data, postsData, WorkingModerators, DLTReq, AwaitReq, PostQue, CloseComments, setNewData, setNewPostsData, { Channels }) {
    const now = new Date();
    const currentDay = now.getDay();
    const currentHour = now.getHours();
    const currentTime = now.getTime();
    const ModeratorsAll = data.days;
    for (let j = 0; j < ModeratorsAll.length; j++) { // колво каналов
      // posting loop
      for (let i = 0; i < AwaitReq[j].length; i++) { // 7 дней
        if (AwaitReq[j][i] !== undefined) {
          if (AwaitReq[j][i].finalDate <= currentTime) {
            CopyPost(AwaitReq[j][i].moderId, AwaitReq[j][i].channelId, AwaitReq[j][i], CloseComments, PostQue, Channels);
            DeleteFromAwaitedPosts(j, i, setNewPostsData, postsData);
          }
        }
      }
      // auto-delete loop
      if (DLTReq[j]) {
        for (let i = 0; i < DLTReq[j].length; i++) {
          if (DLTReq[j][i].mustBeDeletedAt <= currentTime) {
            DeleteFromAutoDelete(DLTReq[j][i], i, setNewPostsData, Channels, postsData);
          }
        }
      }
      // moder promotions loop
      const Moderators = ModeratorsAll[j];
      const channelName = data.channels[j];
      for (let i = 0; i < Moderators[currentDay].length; i++) {
        // console.log(WorkingModerators)
        if (currentHour >= Moderators[currentDay][i].startHour && currentHour < Moderators[currentDay][i].endHour) {
          // console.log("moder with id "+Moderators[currentDay][i].id+" is working now")
          if (WorkingModerators.indexOf(Moderators[currentDay][i].indexName) === -1) {
            WorkingModerators.push(Moderators[currentDay][i].indexName);
            Promote(bot, channelName, Moderators[currentDay][i].moderId);
          }
        } else {
          //  console.log("moder with id "+Moderators[currentDay][i].id+" isn`t working now")
          if (WorkingModerators.indexOf(Moderators[currentDay][i].indexName) !== -1) {
            WorkingModerators.splice(WorkingModerators.indexOf(Moderators[currentDay][i].indexName), 1);
            Demote(bot, channelName, Moderators[currentDay][i].moderId);
          }
        }
      }
    }
  }
}

module.exports = new Timer();
