'use strict'

const axios = require('axios');
const cheerio = require('cheerio');

const blogURL = `https://blog.naver.com`;
const postListURL = `${blogURL}/PostTitleListAsync.nhn?blogId=`;
const postViewURL = `${blogURL}/PostView.nhn?blogId=`;

exports.getTotalCount = (blog_id) => {
    return new Promise(async (resolve, reject) => {
        let info = await axios.get(postListURL+blog_id);
        let formatted_info = JSON.parse(info.data.replace(/'/gi,`"`));
        let total_count = formatted_info.totalCount;

        resolve(total_count);
    })
}

exports.getLogNoList = (blog_id, count) => {
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
            let no_list = [];
            for(let val of value){
                for(let no of val){
                    no_list.push(no.logNo);
                }
            }

            resolve(no_list);
        });
    })
}

exports.getContents = (blog_id, list) => {
    return new Promise(async (resolve, reject) => {
        let blog_id = 'rung913';
        let promise = [];

        for(let no of list){
            let url = `${postViewURL}${blog_id}&logNo=${no}`
            promise.push(parse(url));
        }

        let contents = Promise.all(promise)
        
        resolve(contents);
    })
}

function parse(url){
    return new Promise(async (resolve, reject) => {
        let content = await axios.get(url);
        let $ = cheerio.load(content.data);

        let div = $('.se-main-container').find('.se-text');
        let text_arr = [];
        div.each((i) => {
            text_arr.push($(div[i]).text().trim());
        })
        resolve(text_arr);
    })
}