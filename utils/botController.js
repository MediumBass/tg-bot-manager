
class TG {
    Promote = (bot,channelName, moder) =>{
        bot.promoteChatMember(channelName, moder, {
            can_change_info: false,
            can_post_messages: true,
            can_edit_messages: true,
            can_delete_messages: true,
            can_invite_users: false,
            can_restrict_members: false,
            can_pin_messages: false,
            can_promote_members: false,
        }).then(() => {
            console.log('User ' + moder.indexName + ' promoted successfully')
        }).catch((error) => {
            console.error('Error promoting user:', error)
        });
    }
    Demote = (bot,channelName, moder) =>{
        bot.promoteChatMember(channelName, moder.moderId, {
            can_change_info: false,
            can_post_messages: false,
            can_edit_messages: false,
            can_delete_messages: false,
            can_invite_users: false,
            can_restrict_members: false,
            can_pin_messages: false,
            can_promote_members: false,
        }).then(() => {
            console.log('User ' + moder.indexName + ' demoted successfully')
        }).catch((error) => {
            console.error('Error promoting user:', error)
        });
    }
    CopyMSG = (bot,destination, from, postObject, inlineKeyboard,CloseComments,HangAutoDelete,Channels,text) =>{
        bot.copyMessage(destination, from, postObject.postId, {reply_markup: inlineKeyboard})
            .then((copiedMessage) => {
                let copiedMessageId = copiedMessage.message_id
                if (postObject.autoDeleteHours) {
                    let now = new Date();
                    HangAutoDelete(postObject.autoDeleteHours, copiedMessageId, Channels.indexOf(postObject.channelId), now.getTime())
                }

                if (postObject.commentsAreClosed) {
                    CloseComments.push(copiedMessageId)

                }
            })
            .catch((error) => {
                console.error('Error copying message:', error);
                bot.sendMessage(from, text);
            });
    }
    ForwardMSG = (bot,destination, from, postObject, inlineKeyboard,CloseComments,HangAutoDelete,Channels,text) =>{
        bot.forwardMessage(destination, from, postObject.postId, {reply_markup: inlineKeyboard})
            .then((copiedMessage) => {
                let copiedMessageId = copiedMessage.message_id
                if (postObject.autoDeleteHours) {
                    let now = new Date();
                    HangAutoDelete(postObject.autoDeleteHours, copiedMessageId, Channels.indexOf(postObject.channelId), now.getTime())
                }
                console.log(postObject)
                if (postObject.commentsAreClosed) {
                    CloseComments.push(copiedMessageId)
                    console.log(postObject.forwardFrom)
                }
            })
            .catch((error) => {
                console.error('Error copying message:', error);
                bot.sendMessage(from, text);
            });
    }
    DeleteMessage = (bot,chatId,postId) =>{
        bot.deleteMessage(chatId,postId)
    }


}
module.exports = new TG()