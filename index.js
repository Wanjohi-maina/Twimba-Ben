import { tweetsData as initialTweetsData } from './data.js'
import { v4 as uuidv4 } from 'https://jspm.dev/uuid';

let tweetsData
if (localStorage.getItem('tweetsData')){
     tweetsData = JSON.parse(localStorage.getItem('tweetsData'))
}
else {
    tweetsData = initialTweetsData
}

// OR:
// let tweetsData = JSON.parse(localStorage.getItem('tweetsData')) || initialTweetsData

const currentUser = {
    handle: '@Ben Willer ✅',
    profilePic: 'images/Profile-image.png'
}

document.addEventListener('click', function(e){
    if(e.target.dataset.like){
       handleLikeClick(e.target.dataset.like) 
    }
    else if(e.target.dataset.retweet){
        handleRetweetClick(e.target.dataset.retweet)
    }
    else if(e.target.dataset.reply){
        handleReplyClick(e.target.dataset.reply)
    }
    else if(e.target.id === 'tweet-btn'){
        handleTweetBtnClick()
    }
    else if(e.target.dataset.comment){
        handleCommentClick(e.target.dataset.comment)
    }
    else if (e.target.dataset.delete){
        handleDeleteClick(e.target.dataset.delete)
    }
    else if(e.target.dataset.deleteReply){
        handleDeleteReplyClick(e.target.dataset.deleteReply, e.target.dataset.replyIndex)
    }
})
 
function handleLikeClick(tweetId){ 
    const targetTweetObj = tweetsData.filter(function(tweet){
        return tweet.uuid === tweetId
    })[0]

    if (targetTweetObj.isLiked){
        targetTweetObj.likes--
    }
    else{
        targetTweetObj.likes++ 
    }
    targetTweetObj.isLiked = !targetTweetObj.isLiked
    saveOnLocalStorage()
    render()
}

function handleRetweetClick(tweetId){
    const targetTweetObj = tweetsData.filter(function(tweet){
        return tweet.uuid === tweetId
    })[0]
    
    if(targetTweetObj.isRetweeted){
        targetTweetObj.retweets--
    }
    else{
        targetTweetObj.retweets++
    }
    targetTweetObj.isRetweeted = !targetTweetObj.isRetweeted
    saveOnLocalStorage()
    render() 
}

function handleReplyClick(replyId){
    document.getElementById(`replies-${replyId}`).classList.toggle('hidden')
}

function handleTweetBtnClick(){
    const tweetInput = document.getElementById('tweet-input')

    if(tweetInput.value){
        tweetsData.unshift({
            handle: currentUser.handle,
            profilePic: currentUser.profilePic,
            likes: 0,
            retweets: 0,
            tweetText: tweetInput.value,
            replies: [],
            isLiked: false,
            isRetweeted: false,
            uuid: uuidv4()
        })
    saveOnLocalStorage()    
    render()
    tweetInput.value = ''
    }

}

function handleCommentClick (tweetId){
    const targetTweetObj = tweetsData.find(function (tweet){
           return tweet.uuid === tweetId
    })
    const commentInput = document.getElementById(`comment-input-${tweetId}`)
    targetTweetObj.replies.push({
            handle: currentUser.handle,
            profilePic: currentUser.profilePic,
            tweetText: commentInput.value
    })
    saveOnLocalStorage()
    render ()
    handleReplyClick(tweetId)
}

function handleDeleteClick(tweetId){
    tweetsData.forEach(function(tweet, index){
        if(tweet.uuid === tweetId && tweet.handle === currentUser.handle){
            if(confirm('Delete this tweet?')){
                tweetsData.splice(index, 1)
                saveOnLocalStorage()
                render()

            }
        }
    })

}

function handleDeleteReplyClick(tweetId, replyIndex){
    const targetTweetObj = tweetsData.find(function(tweet){
        return tweet.uuid === tweetId
    })

    targetTweetObj.replies.forEach(function(reply, index){
        if(index == replyIndex && reply.handle === currentUser.handle){
            if(confirm('Delete this reply?')){
                targetTweetObj.replies.splice(index, 1)
                saveOnLocalStorage()
                render()
                handleReplyClick(tweetId)
            }
        }
    })

}


function getFeedHtml(){
    let feedHtml = ``
    
    tweetsData.forEach(function(tweet){
        
        let likeIconClass = ''
        
        if (tweet.isLiked){
            likeIconClass = 'liked'
        }
        
        let retweetIconClass = ''
        
        if (tweet.isRetweeted){
            retweetIconClass = 'retweeted'
        }

        let deleteTweetHtml = ''
        if(tweet.handle === currentUser.handle){
            deleteTweetHtml = `<i class="fa-solid fa-trash" data-delete="${tweet.uuid}"></i>`
        }

        
        let repliesHtml = ''
        
        if(tweet.replies.length > 0){
            tweet.replies.forEach(function(reply, index){
                let deleteReplyHtml = ''
             if(reply.handle === currentUser.handle){
                deleteReplyHtml = `<i class="fa-solid fa-trash" data-delete-reply="${tweet.uuid}" data-reply-index="${index}"></i>`
             }

                repliesHtml+=`
              <div class="tweet-reply">
                <div class="tweet-inner">
                    <img src="${reply.profilePic}" class="profile-pic">
                    <div>
                        <p class="handle">${reply.handle}</p>
                        <p class="tweet-text">${reply.tweetText} </p>

                    </div>
                    ${deleteReplyHtml}
                </div>
              </div>
          `
            })
        }

        repliesHtml += `
          <div class="reply-wrapper">
             <textarea class="reply-input" placeholder="Post your reply.." id="comment-input-${tweet.uuid}"></textarea>
             <i class="fa-solid fa-paper-plane" data-comment="${tweet.uuid}"></i>
          </div>
        `
          
        feedHtml += `
<div class="tweet">
    <div class="tweet-inner">
        <img src="${tweet.profilePic}" class="profile-pic">
        <div>
            <p class="handle">${tweet.handle}</p>
            <p class="tweet-text">${tweet.tweetText}</p>
            <div class="tweet-details">
                <span class="tweet-detail">
                    <i class="fa-regular fa-comment-dots"
                    data-reply="${tweet.uuid}"
                    ></i>
                    ${tweet.replies.length}
                </span>
                <span class="tweet-detail">
                    <i class="fa-solid fa-heart ${likeIconClass}"
                    data-like="${tweet.uuid}"
                    ></i>
                    ${tweet.likes}
                </span>
                <span class="tweet-detail">
                    <i class="fa-solid fa-retweet ${retweetIconClass}"
                    data-retweet="${tweet.uuid}"
                    ></i>
                    ${tweet.retweets}
                </span>
                <span class="tweet-detail">
                    ${deleteTweetHtml}
                </span>
            </div>   
        </div>            
    </div>
    <div class="hidden" id="replies-${tweet.uuid}">
        ${repliesHtml}
    </div>   
</div>
`
   })
   return feedHtml 
}
function saveOnLocalStorage() {
    localStorage.setItem('tweetsData', JSON.stringify(tweetsData))
    
}
function render(){
    document.getElementById('feed').innerHTML = getFeedHtml()
}
render()


