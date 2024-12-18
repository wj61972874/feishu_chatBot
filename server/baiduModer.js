 
const axios = require('axios');
const AK = "PbN0DATzeJ41yR6gjkeAgcBH"
const SK = "UHcAr2yCbKIJnj492XXUZIKNMdEubSRA"

 function getAccessToken() {
    let options = {
        'method': 'POST',
        'url': 'https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=' + AK + '&client_secret=' + SK,
    }
    return new Promise((resolve, reject) => {
      axios(options)
          .then(res => {
              resolve(res.data.access_token)
          })
          .catch(error => {
              reject(error)
          })
    })
}

module.exports={
    getAccessToken
}