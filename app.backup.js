'use strict'

const express = require('express');

const func = require('./common');
const app = express();

app.get('/', async (req, res) => {
    let blog_id_list = await func.getBlogIdList();
    // let blog_id = 'gtmuk';
    try{
        // let num = [];
        // for(let id of blog_id_list){
        //     let count = await func.getTotalCount(id);
        //     num.push({count, name : id});
        // }
        for(let blog_id of blog_id_list){
            let count = await func.getTotalCount(blog_id);
            let list = await func.getLogNoList(blog_id, count);
            let contents = await func.getAndWriteContents(blog_id, list);
        }
        // let count = await func.getTotalCount(blog_id);
        // let list = await func.getLogNoList(blog_id, count);
        // let contents = await func.getContents(blog_id, list);
        res.sendStatus(200);
    }catch(e){
        res.send(e);
    }
})

app.listen(3000, () => {
    console.log('app is listening.....');
})