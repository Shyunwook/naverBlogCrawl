'use strict'

const axios = require('axios');

const postListURL = `https://blog.naver.com/PostTitleListAsync.nhn?blogId=`;

exports.getTotalCount = (blog_id) => {
    return new Promise(async (resolve, reject) => {
        let info = await axios.get(postListURL+blog_id);
        let formatted_info = JSON.parse(info.data.replace(/'/gi,`"`));
        let total_count = formatted_info.totalCount;

        resolve(total_count);
    })
}

exports.getContents = (blog_id, count) => {
    return new Promise(async (resolve, reject) => {
        let page = Math.ceil(count/10);
        let promise = [];
        for(let i = 1; i <= page; i++){
            let url = `${postListURL}${blog_id}&currentPage=${i}&countPerPage=10`;
            promise.push(axios.get(url).then((val) =>{
                return JSON.parse(val.data.replace(/'/gi,`"`)).postList;
            }));
        }
        Promise.all(promise).then(function(value){
            console.log(value)
            resolve(value);
        });
    })
}