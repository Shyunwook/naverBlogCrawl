'use strict'

const express = require('express');

const func = require('./common');
const app = express();
const fs = require('fs');

// app.get('/', async (req, res) => {
//     let blog_id_list = await func.getBlogIdList();
//     try{
        
//         // let contents = await func.getAndWriteContents("gtmuk", 
//         // [{"logNo":"221560328930","title":"%ED%95%99%EC%83%9D%EB%93%A4+%EC%95%9E%EC%97%90%EC%84%9C","date":"2018. 3. 18."}]);
//         for(let blog_id of blog_id_list){
//             console.log(blog_id);
//             let count = await func.getTotalCount(blog_id);
//             let list = await func.getLogNoList(blog_id, count);
//             let contents = await func.getAndWriteContents(blog_id, list);
//             // fs.appendFileSync('./complete.txt',`\n${blog_id} 완료!!!!!`);
//         }
//         res.send(list);
//     }catch(e){
//         //res.send(e);
//     }  
//     // res.send(200);
// })

var crawl = async function(){
    let blog_id_list = await func.getBlogIdList();
    try{
        
        // let contents = await func.getAndWriteContents("gtmuk", 
        // [{"logNo":"221537196348","title":"%ED%95%99%EC%83%9D%EB%93%A4+%EC%95%9E%EC%97%90%EC%84%9C","date":"2018. 3. 18."}]);
        for(let blog_id of blog_id_list){
            console.log(blog_id);
            let count = await func.getTotalCount(blog_id);
            console.log(count);
            let list = await func.getLogNoList(blog_id, count);
            console.log('컨텐츠 저장 시작');
            let contents = await func.getAndWriteContents(blog_id, list);
            fs.appendFileSync('./complete.txt',`\n${blog_id} 완료!!!!!`);
        }
    }catch(e){
        //res.send(e);
    }  
}

app.listen(8080, () => {
    console.log('app is listening.....');
})

crawl();