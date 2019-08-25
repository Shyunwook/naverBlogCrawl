'use strict'

const express = require('express');
const app = express();
const func = require('./common');

app.get('/', async (req, res) => {
    let blog_id = "rung913";
    let count = await func.getTotalCount(blog_id);
    let list = await func.getLogNoList(blog_id, count);
    let contents = await func.getContents(blog_id, list);
    res.send(contents);
})



app.listen(3000, () => {
    console.log('app is listening.....');
})