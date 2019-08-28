'use strict'

const axios = require('axios');
const cheerio = require('cheerio');
const xlsx = require('xlsx');
const fs = require('fs');

const blogURL = `https://blog.naver.com`;
const postListURL = `${blogURL}/PostTitleListAsync.nhn?blogId=`;
const postViewURL = `${blogURL}/PostView.nhn?blogId=`;

var Referers = [
    "https://gist.github.com/kerimdzhanov/7529623",
    "http://mint.innolab.us/index.html",
    "http://ohgyun.com/292",
    "http://www.gsshop.com/index.gs",
    "http://11st.com",
    "http://daum.net",
    "http://naver.com",
    "http://gbot.innolab.us",
    "http://www.instagram.com",
    "http://shopping.naver.com/detail/lite.nhn?nv_mid=10716782738&cat_id=50002019&frm=NVSHATC&query=%EB%B9%84%EB%B9%84%EA%B3%A0%EA%B9%80%EC%B9%98",
    "http://console.aws.amazon.com",
    "http://google.com",
    "https://search.naver.com/search.naver?sm=tab_drt&ie=utf8&where=nexearch&query=%EC%84%9C%EC%9A%B8%ED%8A%B9%EB%B3%84%EC%8B%9C%20%EC%98%81%EB%93%B1%ED%8F%AC%EA%B5%AC%20%EB%AC%B8%EB%9E%98%EB%8F%99%EB%82%A0%EC%94%A8",
    "https://search.naver.com/search.naver?where=nexearch&sm=tab_htk.nws&ie=utf8&query=S%26P+%EB%82%98%EC%8A%A4%EB%8B%A5+%EC%82%AC%EC%83%81+%EC%B5%9C%EA%B3%A0+%EB%A7%88%EA%B0%90",
    "http://www.yonhapnews.co.kr/bulletin/2017/10/28/0200000000AKR20171028008400009.HTML?input=1195m"
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_htk.ent&ie=utf8&query=%EC%A0%95%EA%B8%80%EC%9D%98+%EB%B2%95%EC%B9%99+%EB%B3%B4%EB%AF%B8'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_htk.ent&ie=utf8&query=%EB%B0%B1%EC%A2%85%EC%9B%90%EC%9D%98+%ED%91%B8%EB%93%9C%ED%8A%B8%EB%9F%AD+%EB%B0%B1%EC%A2%85%EC%9B%90'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_htk.ent&ie=utf8&query=%EA%B3%A0%EB%B0%B1%EB%B6%80%EB%B6%80+%EC%9E%A5%EB%82%98%EB%9D%BC'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_htk.ent&ie=utf8&query=%ED%8C%AC%ED%85%80%EC%8B%B1%EC%96%B42+%EA%B0%95%ED%98%95%ED%98%B8'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_htk.ent&ie=utf8&query=%EC%84%B1%EC%8B%9C%EA%B2%BD+%EB%82%98%EC%9D%98+%EB%B0%A4+%EB%82%98%EC%9D%98+%EB%84%88'
    , 'https://help.naver.com/support/alias/search/word/word_3.naver'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_bck&ie=utf8&ug_cid=tee&query=%EC%9C%A0%ED%8A%9C%EB%B8%8C'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_bck&ie=utf8&ug_cid=tee&query=%EB%B0%A9%ED%83%84%EC%86%8C%EB%85%84%EB%8B%A8'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_bck&ie=utf8&ug_cid=tee&query=%EC%9D%B4%EB%8B%88%EC%8A%A4%ED%94%84%EB%A6%AC+%EC%9B%8C%EB%84%88%EC%9B%90+%EB%A6%BD%EB%B0%A4'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_bck&ie=utf8&ug_cid=tee&query=%EC%9B%90%EB%82%98%EC%9E%87%ED%91%B8%EB%93%9C%ED%8A%B8%EB%A6%BD+%EC%98%A4%EC%82%AC%EC%B9%B4'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_bck&ie=utf8&ug_cid=tee&query=%EA%B3%BC%ED%95%99%EC%98%81%EC%9E%AC+%EC%82%B0%EC%B6%9C%EB%AC%BC+%EC%A3%BC%EC%A0%9C'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_bck&ie=utf8&ug_cid=tee&query=%ED%86%A0%EB%A7%88%ED%86%A0%EC%B6%95%EC%A0%9C'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_bck&ie=utf8&ug_cid=tee&query=%EB%AC%B4%EC%A7%80%ED%8D%BC%EC%85%80%EB%B8%94%EB%9E%99'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_bck&ie=utf8&ug_cid=tee&query=%EC%B9%B4%ED%86%A1+%EC%B0%A8%EB%8B%A8+%ED%94%84%EC%82%AC'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_bck&ie=utf8&ug_cid=tee&query=%ED%82%A4%EC%A6%88%EC%A7%B1+%EA%B2%8C%EC%9E%84'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_bck&ie=utf8&ug_cid=tee&query=%EB%8D%98%ED%8C%8C+%ED%95%A0%EB%A1%9C%EC%9C%88+%EC%9D%B4%EB%B2%A4%ED%8A%B8'
    , 'https://help.naver.com/support/alias/search/word/word_4.naver'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_htk.nws&ie=utf8&query=S%26P+%EB%82%98%EC%8A%A4%EB%8B%A5+%EC%82%AC%EC%83%81+%EC%B5%9C%EA%B3%A0+%EB%A7%88%EA%B0%90#'
    , 'https://help.naver.com/support/alias/search/word/word_5.naver'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_lvf&ie=utf8&query=%EA%B3%B5%EC%9D%B8%EC%A4%91%EA%B0%9C%EC%82%AC+%EA%B0%80%EB%8B%B5%EC%95%88'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_lvf&ie=utf8&query=%EA%B3%B5%EC%9D%B8%EC%A4%91%EA%B0%9C%EC%82%AC+%EC%8B%9C%ED%97%98'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_lvf&ie=utf8&query=%EC%B9%B4%ED%83%88%EB%A3%A8%EB%83%90'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_lvf&ie=utf8&query=%ED%95%9C%EA%B5%AD%EC%82%AC%EB%8A%A5%EB%A0%A5%EA%B2%80%EC%A0%95%EC%8B%9C%ED%97%98'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_lvf&ie=utf8&query=%ED%95%9C%EA%B5%AD%EC%82%AC%EB%8A%A5%EB%A0%A5%EA%B2%80%EC%A0%95%EC%8B%9C%ED%97%98+%EA%B0%80%EB%8B%B5%EC%95%88'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_lvf&ie=utf8&query=2017+%EB%B6%80%EC%82%B0+%EB%B6%88%EA%BD%83%EC%B6%95%EC%A0%9C'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_lvf&ie=utf8&query=%EB%B3%B4%EA%B7%B8%EB%A7%98'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_lvf&ie=utf8&query=%EC%9B%94%EB%93%9C%EC%8B%9C%EB%A6%AC%EC%A6%88'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_lvf&ie=utf8&query=%EC%86%8C%EC%82%AC%EC%9D%B4%EC%96%B4%ED%8B%B0+%EA%B2%8C%EC%9E%84+2'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_lvf&ie=utf8&query=nba'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_lvf&ie=utf8&query=%ED%8C%AC%ED%85%80%EC%8B%B1%EC%96%B42'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_lvf&ie=utf8&query=%EC%95%8C%EC%93%B8%EC%8B%A0%EC%9E%A12'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_lvf&ie=utf8&query=%EB%A9%94%EA%B0%80%EB%B0%95%EC%8A%A4'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_lvf&ie=utf8&query=%EA%B3%A0%EB%B0%B1%EB%B6%80%EB%B6%80'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_lvf&ie=utf8&query=%EC%84%9C%EB%93%A0%EC%96%B4%ED%83%9D'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_lvf&ie=utf8&query=%EB%A9%94%EC%9D%B4%ED%94%8C%EC%8A%A4%ED%86%A0%EB%A6%AC'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_lvf&ie=utf8&query=%EA%B7%B8%EA%B2%83%EC%9D%B4+%EC%95%8C%EA%B3%A0%EC%8B%B6%EB%8B%A4'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_lvf&ie=utf8&query=%EC%9D%B4%EC%98%81%ED%95%99'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_lvf&ie=utf8&query=%ED%94%BC%ED%8C%8C%EC%98%A8%EB%9D%BC%EC%9D%B83'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_lvf&ie=utf8&query=%EC%95%84%EB%8A%94%ED%98%95%EB%8B%98'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_lvf&ie=utf8&query=%EA%B3%B5%EC%9D%B8%EC%A4%91%EA%B0%9C%EC%82%AC+%EA%B0%80%EB%8B%B5%EC%95%88'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_htk.nws&ie=utf8&query=S%26P+%EB%82%98%EC%8A%A4%EB%8B%A5+%EC%82%AC%EC%83%81+%EC%B5%9C%EA%B3%A0+%EB%A7%88%EA%B0%90#'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_lvf&ie=utf8&query=%EA%B3%B5%EC%9D%B8%EC%A4%91%EA%B0%9C%EC%82%AC+%EA%B0%80%EB%8B%B5%EC%95%88'
    , 'http://datalab.naver.com/keyword/realtimeDetail.naver?where=search&query=%EA%B3%B5%EC%9D%B8%EC%A4%91%EA%B0%9C%EC%82%AC+%EA%B0%80%EB%8B%B5%EC%95%88&datetime=2017-10-28T12%3A23%3A00'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_lvf&ie=utf8&query=%EA%B3%B5%EC%9D%B8%EC%A4%91%EA%B0%9C%EC%82%AC+%EC%8B%9C%ED%97%98'
    , 'http://datalab.naver.com/keyword/realtimeDetail.naver?where=search&query=%EA%B3%B5%EC%9D%B8%EC%A4%91%EA%B0%9C%EC%82%AC+%EC%8B%9C%ED%97%98&datetime=2017-10-28T12%3A23%3A00'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_lvf&ie=utf8&query=%EC%B9%B4%ED%83%88%EB%A3%A8%EB%83%90'
    , 'http://datalab.naver.com/keyword/realtimeDetail.naver?where=search&query=%EC%B9%B4%ED%83%88%EB%A3%A8%EB%83%90&datetime=2017-10-28T12%3A23%3A00'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_lvf&ie=utf8&query=%ED%95%9C%EA%B5%AD%EC%82%AC%EB%8A%A5%EB%A0%A5%EA%B2%80%EC%A0%95%EC%8B%9C%ED%97%98'
    , 'http://datalab.naver.com/keyword/realtimeDetail.naver?where=search&query=%ED%95%9C%EA%B5%AD%EC%82%AC%EB%8A%A5%EB%A0%A5%EA%B2%80%EC%A0%95%EC%8B%9C%ED%97%98&datetime=2017-10-28T12%3A23%3A00'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_lvf&ie=utf8&query=%ED%95%9C%EA%B5%AD%EC%82%AC%EB%8A%A5%EB%A0%A5%EA%B2%80%EC%A0%95%EC%8B%9C%ED%97%98+%EA%B0%80%EB%8B%B5%EC%95%88'
    , 'http://datalab.naver.com/keyword/realtimeDetail.naver?where=search&query=%ED%95%9C%EA%B5%AD%EC%82%AC%EB%8A%A5%EB%A0%A5%EA%B2%80%EC%A0%95%EC%8B%9C%ED%97%98+%EA%B0%80%EB%8B%B5%EC%95%88&datetime=2017-10-28T12%3A23%3A00'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_lvf&ie=utf8&query=2017+%EB%B6%80%EC%82%B0+%EB%B6%88%EA%BD%83%EC%B6%95%EC%A0%9C'
    , 'http://datalab.naver.com/keyword/realtimeDetail.naver?where=search&query=2017+%EB%B6%80%EC%82%B0+%EB%B6%88%EA%BD%83%EC%B6%95%EC%A0%9C&datetime=2017-10-28T12%3A23%3A00'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_lvf&ie=utf8&query=%EB%B3%B4%EA%B7%B8%EB%A7%98'
    , 'http://datalab.naver.com/keyword/realtimeDetail.naver?where=search&query=%EB%B3%B4%EA%B7%B8%EB%A7%98&datetime=2017-10-28T12%3A23%3A00'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_lvf&ie=utf8&query=%EC%9B%94%EB%93%9C%EC%8B%9C%EB%A6%AC%EC%A6%88'
    , 'http://datalab.naver.com/keyword/realtimeDetail.naver?where=search&query=%EC%9B%94%EB%93%9C%EC%8B%9C%EB%A6%AC%EC%A6%88&datetime=2017-10-28T12%3A23%3A00'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_lvf&ie=utf8&query=%EC%86%8C%EC%82%AC%EC%9D%B4%EC%96%B4%ED%8B%B0+%EA%B2%8C%EC%9E%84+2'
    , 'http://datalab.naver.com/keyword/realtimeDetail.naver?where=search&query=%EC%86%8C%EC%82%AC%EC%9D%B4%EC%96%B4%ED%8B%B0+%EA%B2%8C%EC%9E%84+2&datetime=2017-10-28T12%3A23%3A00'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_lvf&ie=utf8&query=nba'
    , 'http://datalab.naver.com/keyword/realtimeDetail.naver?where=search&query=nba&datetime=2017-10-28T12%3A23%3A00'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_lvf&ie=utf8&query=%ED%8C%AC%ED%85%80%EC%8B%B1%EC%96%B42'
    , 'http://datalab.naver.com/keyword/realtimeDetail.naver?where=search&query=%ED%8C%AC%ED%85%80%EC%8B%B1%EC%96%B42&datetime=2017-10-28T12%3A23%3A00'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_lvf&ie=utf8&query=%EC%95%8C%EC%93%B8%EC%8B%A0%EC%9E%A12'
    , 'http://datalab.naver.com/keyword/realtimeDetail.naver?where=search&query=%EC%95%8C%EC%93%B8%EC%8B%A0%EC%9E%A12&datetime=2017-10-28T12%3A23%3A00'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_lvf&ie=utf8&query=%EB%A9%94%EA%B0%80%EB%B0%95%EC%8A%A4'
    , 'http://datalab.naver.com/keyword/realtimeDetail.naver?where=search&query=%EB%A9%94%EA%B0%80%EB%B0%95%EC%8A%A4&datetime=2017-10-28T12%3A23%3A00'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_lvf&ie=utf8&query=%EA%B3%A0%EB%B0%B1%EB%B6%80%EB%B6%80'
    , 'http://datalab.naver.com/keyword/realtimeDetail.naver?where=search&query=%EA%B3%A0%EB%B0%B1%EB%B6%80%EB%B6%80&datetime=2017-10-28T12%3A23%3A00'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_lvf&ie=utf8&query=%EC%84%9C%EB%93%A0%EC%96%B4%ED%83%9D'
    , 'http://datalab.naver.com/keyword/realtimeDetail.naver?where=search&query=%EC%84%9C%EB%93%A0%EC%96%B4%ED%83%9D&datetime=2017-10-28T12%3A23%3A00'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_lvf&ie=utf8&query=%EB%A9%94%EC%9D%B4%ED%94%8C%EC%8A%A4%ED%86%A0%EB%A6%AC'
    , 'http://datalab.naver.com/keyword/realtimeDetail.naver?where=search&query=%EB%A9%94%EC%9D%B4%ED%94%8C%EC%8A%A4%ED%86%A0%EB%A6%AC&datetime=2017-10-28T12%3A23%3A00'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_lvf&ie=utf8&query=%EA%B7%B8%EA%B2%83%EC%9D%B4+%EC%95%8C%EA%B3%A0%EC%8B%B6%EB%8B%A4'
    , 'http://datalab.naver.com/keyword/realtimeDetail.naver?where=search&query=%EA%B7%B8%EA%B2%83%EC%9D%B4+%EC%95%8C%EA%B3%A0%EC%8B%B6%EB%8B%A4&datetime=2017-10-28T12%3A23%3A00'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_lvf&ie=utf8&query=%EC%9D%B4%EC%98%81%ED%95%99'
    , 'http://datalab.naver.com/keyword/realtimeDetail.naver?where=search&query=%EC%9D%B4%EC%98%81%ED%95%99&datetime=2017-10-28T12%3A23%3A00'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_lvf&ie=utf8&query=%ED%94%BC%ED%8C%8C%EC%98%A8%EB%9D%BC%EC%9D%B83'
    , 'http://datalab.naver.com/keyword/realtimeDetail.naver?where=search&query=%ED%94%BC%ED%8C%8C%EC%98%A8%EB%9D%BC%EC%9D%B83&datetime=2017-10-28T12%3A23%3A00'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_lvf&ie=utf8&query=%EC%95%84%EB%8A%94%ED%98%95%EB%8B%98'
    , 'http://datalab.naver.com/keyword/realtimeDetail.naver?where=search&query=%EC%95%84%EB%8A%94%ED%98%95%EB%8B%98&datetime=2017-10-28T12%3A23%3A00'
    , 'https://help.naver.com/support/alias/search/word/word_5.naver'
    , 'http://datalab.naver.com/keyword/realtimeList.naver?where=search'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_htk.nws&ie=utf8&query=S%26P+%EB%82%98%EC%8A%A4%EB%8B%A5+%EC%82%AC%EC%83%81+%EC%B5%9C%EA%B3%A0+%EB%A7%88%EA%B0%90#'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_htf.nws&ie=utf8&query=%EA%B3%B5%EC%9D%B8%EC%A4%91%EA%B0%9C%EC%82%AC+%EC%8B%9C%ED%97%98'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_htf.nws&ie=utf8&query=%EC%B9%B4%ED%83%88%EB%A3%A8%EB%83%90+%EB%8F%85%EB%A6%BD%EA%B5%AD%EA%B0%80+%EC%84%A0%ED%8F%AC'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_htf.nws&ie=utf8&query=%EC%98%A4%EB%8A%98%EC%9D%98+%EC%9A%B4%EC%84%B8'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_htf.nws&ie=utf8&query=S%26P+%EB%82%98%EC%8A%A4%EB%8B%A5+%EC%82%AC%EC%83%81+%EC%B5%9C%EA%B3%A0+%EB%A7%88%EA%B0%90'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_htf.nws&ie=utf8&query=%EC%A0%84%EA%B5%AD+%EB%8C%80%EC%B2%B4%EB%A1%9C+%EB%A7%91%EC%9D%8C'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_htf.nws&ie=utf8&query=5%EB%AA%85+%EA%B5%AC%EC%A1%B0+3%EB%AA%85+%EC%8B%A4%EC%A2%85'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_htf.nws&ie=utf8&query=%EB%AF%B8%EC%84%B8%EB%A8%BC%EC%A7%80+%EB%86%8D%EB%8F%84'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_htf.nws&ie=utf8&query=%ED%95%9C%EB%AF%B8+%EA%B5%AD%EB%B0%A9%EC%9E%A5%EA%B4%80'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_htf.nws&ie=utf8&query=%EC%9D%B4%EC%98%81%ED%95%99+%EB%94%B8%EB%8F%84+%EC%B2%98%EB%B2%8C%ED%95%B4%EB%8B%AC%EB%9D%BC'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_htf.nws&ie=utf8&query=%EB%B0%B0%EB%8B%AC%EC%9D%98%EB%AF%BC%EC%A1%B1+%EA%B9%80%EB%B4%89%EC%A7%84+%EB%8C%80%ED%91%9C'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_htf.ent&ie=utf8&query=%EB%8D%94+%EC%84%9C%EC%9A%B8%EC%96%B4%EC%9B%8C%EC%A6%88'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_htf.ent&ie=utf8&query=%EB%B3%B4%EA%B7%B8%EB%A7%98+%EB%B0%95%ED%95%9C%EB%B3%84'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_htf.ent&ie=utf8&query=%EC%95%8C%EC%93%B8%EC%8B%A0%EC%9E%A12+%EC%9C%A0%EC%8B%9C%EB%AF%BC'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_htf.ent&ie=utf8&query=%EB%8D%94+%ED%8C%A8%ED%82%A4%EC%A7%80+%EC%B5%9C%EC%9A%B0%EC%8B%9D'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_htf.ent&ie=utf8&query=%EC%86%8C%EC%82%AC%EC%9D%B4%EC%96%B4%ED%8B%B0+%EA%B2%8C%EC%9E%842+%EC%9C%A0%EC%8A%B9%EC%98%A5'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_htf.ent&ie=utf8&query=%EC%A0%95%EA%B8%80%EC%9D%98+%EB%B2%95%EC%B9%99+%EB%B3%B4%EB%AF%B8'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_htf.ent&ie=utf8&query=%EB%B0%B1%EC%A2%85%EC%9B%90%EC%9D%98+%ED%91%B8%EB%93%9C%ED%8A%B8%EB%9F%AD+%EB%B0%B1%EC%A2%85%EC%9B%90'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_htf.ent&ie=utf8&query=%EA%B3%A0%EB%B0%B1%EB%B6%80%EB%B6%80+%EC%9E%A5%EB%82%98%EB%9D%BC'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_htf.ent&ie=utf8&query=%ED%8C%AC%ED%85%80%EC%8B%B1%EC%96%B42+%EA%B0%95%ED%98%95%ED%98%B8'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_htf.ent&ie=utf8&query=%EC%84%B1%EC%8B%9C%EA%B2%BD+%EB%82%98%EC%9D%98+%EB%B0%A4+%EB%82%98%EC%9D%98+%EB%84%88'
    , 'https://help.naver.com/support/alias/search/word/word_3.naver'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_bcf&ie=utf8&ug_cid=tee&query=%EC%9C%A0%ED%8A%9C%EB%B8%8C'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_bcf&ie=utf8&ug_cid=tee&query=%EB%B0%A9%ED%83%84%EC%86%8C%EB%85%84%EB%8B%A8'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_bcf&ie=utf8&ug_cid=tee&query=%EC%9D%B4%EB%8B%88%EC%8A%A4%ED%94%84%EB%A6%AC+%EC%9B%8C%EB%84%88%EC%9B%90+%EB%A6%BD%EB%B0%A4'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_bcf&ie=utf8&ug_cid=tee&query=%EC%9B%90%EB%82%98%EC%9E%87%ED%91%B8%EB%93%9C%ED%8A%B8%EB%A6%BD+%EC%98%A4%EC%82%AC%EC%B9%B4'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_bcf&ie=utf8&ug_cid=tee&query=%EA%B3%BC%ED%95%99%EC%98%81%EC%9E%AC+%EC%82%B0%EC%B6%9C%EB%AC%BC+%EC%A3%BC%EC%A0%9C'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_bcf&ie=utf8&ug_cid=tee&query=%ED%86%A0%EB%A7%88%ED%86%A0%EC%B6%95%EC%A0%9C'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_bcf&ie=utf8&ug_cid=tee&query=%EB%AC%B4%EC%A7%80%ED%8D%BC%EC%85%80%EB%B8%94%EB%9E%99'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_bcf&ie=utf8&ug_cid=tee&query=%EC%B9%B4%ED%86%A1+%EC%B0%A8%EB%8B%A8+%ED%94%84%EC%82%AC'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_bcf&ie=utf8&ug_cid=tee&query=%ED%82%A4%EC%A6%88%EC%A7%B1+%EA%B2%8C%EC%9E%84'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_bcf&ie=utf8&ug_cid=tee&query=%EB%8D%98%ED%8C%8C+%ED%95%A0%EB%A1%9C%EC%9C%88+%EC%9D%B4%EB%B2%A4%ED%8A%B8'
    , 'https://help.naver.com/support/alias/search/word/word_4.naver'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_htk.nws&ie=utf8&query=S%26P+%EB%82%98%EC%8A%A4%EB%8B%A5+%EC%82%AC%EC%83%81+%EC%B5%9C%EA%B3%A0+%EB%A7%88%EA%B0%90#'
    , 'https://help.naver.com/support/alias/search/word/word_17.naver'
    , 'https://help.naver.com/support/alias/search/word/word_18.naver'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_htf.nws&ie=utf8&query=%EC%A0%84%EA%B5%AD+%EB%8C%80%EC%B2%B4%EB%A1%9C+%EB%A7%91%EC%9D%8C'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_htf.nws&ie=utf8&query=5%EB%AA%85+%EA%B5%AC%EC%A1%B0+3%EB%AA%85+%EC%8B%A4%EC%A2%85'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_htf.nws&ie=utf8&query=%EB%AF%B8%EC%84%B8%EB%A8%BC%EC%A7%80+%EB%86%8D%EB%8F%84'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_htf.nws&ie=utf8&query=%ED%95%9C%EB%AF%B8+%EA%B5%AD%EB%B0%A9%EC%9E%A5%EA%B4%80'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_htf.nws&ie=utf8&query=%EC%9D%B4%EC%98%81%ED%95%99+%EB%94%B8%EB%8F%84+%EC%B2%98%EB%B2%8C%ED%95%B4%EB%8B%AC%EB%9D%BC'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_htf.nws&ie=utf8&query=%EB%B0%B0%EB%8B%AC%EC%9D%98%EB%AF%BC%EC%A1%B1+%EA%B9%80%EB%B4%89%EC%A7%84+%EB%8C%80%ED%91%9C'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_htf.ent&ie=utf8&query=%EB%8D%94+%EC%84%9C%EC%9A%B8%EC%96%B4%EC%9B%8C%EC%A6%88'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_htf.ent&ie=utf8&query=%EB%B3%B4%EA%B7%B8%EB%A7%98+%EB%B0%95%ED%95%9C%EB%B3%84'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_htf.ent&ie=utf8&query=%EC%95%8C%EC%93%B8%EC%8B%A0%EC%9E%A12+%EC%9C%A0%EC%8B%9C%EB%AF%BC'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_htf.ent&ie=utf8&query=%EB%8D%94+%ED%8C%A8%ED%82%A4%EC%A7%80+%EC%B5%9C%EC%9A%B0%EC%8B%9D'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_htf.ent&ie=utf8&query=%EC%86%8C%EC%82%AC%EC%9D%B4%EC%96%B4%ED%8B%B0+%EA%B2%8C%EC%9E%842+%EC%9C%A0%EC%8A%B9%EC%98%A5'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_htf.ent&ie=utf8&query=%EC%A0%95%EA%B8%80%EC%9D%98+%EB%B2%95%EC%B9%99+%EB%B3%B4%EB%AF%B8'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_htf.ent&ie=utf8&query=%EB%B0%B1%EC%A2%85%EC%9B%90%EC%9D%98+%ED%91%B8%EB%93%9C%ED%8A%B8%EB%9F%AD+%EB%B0%B1%EC%A2%85%EC%9B%90'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_htf.ent&ie=utf8&query=%EA%B3%A0%EB%B0%B1%EB%B6%80%EB%B6%80+%EC%9E%A5%EB%82%98%EB%9D%BC'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_htf.ent&ie=utf8&query=%ED%8C%AC%ED%85%80%EC%8B%B1%EC%96%B42+%EA%B0%95%ED%98%95%ED%98%B8'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_htf.ent&ie=utf8&query=%EC%84%B1%EC%8B%9C%EA%B2%BD+%EB%82%98%EC%9D%98+%EB%B0%A4+%EB%82%98%EC%9D%98+%EB%84%88'
    , 'https://help.naver.com/support/alias/search/word/word_3.naver'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_bcf&ie=utf8&ug_cid=tee&query=%EC%9C%A0%ED%8A%9C%EB%B8%8C'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_bcf&ie=utf8&ug_cid=tee&query=%EB%B0%A9%ED%83%84%EC%86%8C%EB%85%84%EB%8B%A8'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_bcf&ie=utf8&ug_cid=tee&query=%EC%9D%B4%EB%8B%88%EC%8A%A4%ED%94%84%EB%A6%AC+%EC%9B%8C%EB%84%88%EC%9B%90+%EB%A6%BD%EB%B0%A4'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_bcf&ie=utf8&ug_cid=tee&query=%EC%9B%90%EB%82%98%EC%9E%87%ED%91%B8%EB%93%9C%ED%8A%B8%EB%A6%BD+%EC%98%A4%EC%82%AC%EC%B9%B4'

    , 'https://help.naver.com/support/alias/search/word/word_16.naver'
    , 'https://search.naver.com/search.naver?where=nexearch&sm=tab_htk.nws&ie=utf8&query=S%26P+%EB%82%98%EC%8A%A4%EB%8B%A5+%EC%82%AC%EC%83%81+%EC%B5%9C%EA%B3%A0+%EB%A7%88%EA%B0%90#'
    , 'https://nid.naver.com/nidlogin.login'
    , 'https://help.naver.com/support/alias/search/word/word_16.naver'
    , 'https://help.naver.com/support/alias/search/word/word_21.naver'
    , 'https://help.naver.com/support/alias/search/word/word_17.naver'
    , 'https://help.naver.com/support/alias/search/word/word_18.naver'

    , 'https://help.naver.com/support/alias/search/word/word_17.naver'
    , 'https://help.naver.com/support/alias/search/word/word_18.naver'

    , 'https://help.naver.com/support/alias/search/word/word_17.naver'
    , 'https://help.naver.com/support/alias/search/word/word_18.naver'

    , 'http://naver_diary.blog.me/220982360603'
    , 'https://help.naver.com/support/alias/search/footer/policy.naver'
    , 'https://smartplace.naver.com/'
    , 'http://searchad.naver.com/'
    , 'https://help.naver.com/support/alias/search/integration/integration_1.naver'
    , 'https://help.naver.com/support/alias/report/unsound.naver'
    , 'http://www.navercorp.com/'
];
var UserAgents = [
    "Mozilla/5.0 (Windows; U; Windows NT 6.1; ko; rv:1.9.2.8) Gecko/20100722 Firefox/3.6.8 IPMS/A640400A-14D460801A1-000000426571",
    "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.1; Trident/4.0; IPMS/A640400A-14D460801A1-000000426571; TCO_20110131100426; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; InfoPath.2; Tablet PC 2.0)",
    "Mozilla/5.0 (Windows; U; Windows NT 6.1; ko-KR) AppleWebKit/533.18.1 (KHTML, like Gecko) Version/5.0.2 Safari/533.18.5",
    "Opera/9.80 (Windows NT 6.1; U; ko) Presto/2.6.30 Version/10.62",
    "Mozilla/5.0 (Windows; U; Windows NT 6.1; ko; rv:1.9.2.8) Gecko/20100722 Firefox/3.6.8 IPMS/A640400A-14D460801A1-000000426571",
    "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.1; Trident/4.0; IPMS/A640400A-14D460801A1-000000426571; TCO_20110131100426; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; InfoPath.2; Tablet PC 2.0)",
    "Mozilla/5.0 (Windows; U; Windows NT 6.1; ko-KR) AppleWebKit/533.18.1 (KHTML, like Gecko) Version/5.0.2 Safari/533.18.5",
    , "Opera/9.80 (Windows NT 6.1; U; ko) Presto/2.6.30 Version/10.62",
    , 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/603.3.8 (KHTML, like Gecko)'
    , 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/601.7.7 (KHTML, like Gecko) Version/9.1.2 Safari/601.7.7'
    , 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/603.3.8 (KHTML, like Gecko) Version/10.1.2 Safari/603.3.8'
    , 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_3) AppleWebKit/601.4.4 (KHTML, like Gecko) Version/9.0.3 Safari/601.4.4'
    , 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/602.4.8 (KHTML, like Gecko) Version/10.0.3 Safari/602.4.8'
    , 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.1 Safari/603.1.30'
    , 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_4) AppleWebKit/601.5.17 (KHTML, like Gecko) Version/9.1 Safari/601.5.17'
    , 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_5) AppleWebKit/603.2.4 (KHTML, like Gecko) Version/10.1.1 Safari/603.2.4'
    , 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/601.6.17 (KHTML, like Gecko) Version/9.1.1 Safari/601.6.17'
    , 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_4) AppleWebKit/601.5.17 (KHTML, like Gecko)'
    , 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_1) AppleWebKit/602.2.14 (KHTML, like Gecko) Version/10.0.1 Safari/602.2.14'
    , 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_3) AppleWebKit/601.4.4 (KHTML, like Gecko)'
    , 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/601.2.7 (KHTML, like Gecko) Version/9.0.1 Safari/601.2.7'
    , 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/600.8.9 (KHTML, like Gecko) Version/8.0.8 Safari/600.8.9'
    , 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12) AppleWebKit/602.1.50 (KHTML, like Gecko) Version/10.0 Safari/602.1.50'
    , 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_2) AppleWebKit/602.3.12 (KHTML, like Gecko) Version/10.0.2 Safari/602.3.12'
    , 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/601.4.4 (KHTML, like Gecko) Version/9.0.3 Safari/601.4.4'
    , 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/601.3.9 (KHTML, like Gecko)'
    , 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/601.5.17 (KHTML, like Gecko) Version/9.1 Safari/601.5.17'
    , 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11) AppleWebKit/601.1.56 (KHTML, like Gecko) Version/9.0 Safari/601.1.56'
    , 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/601.7.8 (KHTML, like Gecko) Version/9.1.3 Safari/601.7.8'
    , 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/602.1.50 (KHTML, like Gecko) Version/10.0 Safari/602.1.50'
    , 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/601.7.7 (KHTML, like Gecko) Version/9.1.2 Safari/601.7.7'
    , 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_5_8) AppleWebKit/534.50.2 (KHTML, like Gecko) Version/5.0.6 Safari/533.22.3'
    , 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/601.2.7 (KHTML, like Gecko) Version/9.0.1 Safari/601.2.7'
    , 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/534.59.10 (KHTML, like Gecko) Version/5.1.9 Safari/534.59.10'
    , 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_5) AppleWebKit/537.78.2 (KHTML, like Gecko) Version/6.1.6 Safari/537.78.2'
    , 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/602.2.14 (KHTML, like Gecko) Version/10.0.1 Safari/602.2.14'
    , 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/600.8.9 (KHTML, like Gecko) Version/6.2.8 Safari/537.85.17'
    , 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/601.3.9 (KHTML, like Gecko) Version/9.0.2 Safari/601.3.9'
    , 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/602.2.14 (KHTML, like Gecko) Version/10.0.1 Safari/602.2.14'
    , 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/601.6.17 (KHTML, like Gecko) Version/9.1.1 Safari/601.6.17'
    , 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/601.7.8 (KHTML, like Gecko) Version/9.1.3 Safari/537.86.7'
    , 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/602.4.8 (KHTML, like Gecko) Version/10.0.3 Safari/602.4.8'
    , 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.90 Safari/537.36'
    , 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/602.1.50 (KHTML, like Gecko) Version/10.0 Safari/602.1.50'
    , 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/603.2.5 (KHTML, like Gecko) Version/10.1.1 Safari/603.2.5'
    , 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/537.17 (KHTML, like Gecko) Chrome/24.0.1312.57 Safari/537.17'
    , 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_4) AppleWebKit/600.7.12 (KHTML, like Gecko) Version/8.0.7 Safari/600.7.12'
    , 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/602.4.8 (KHTML, like Gecko) Version/10.0.3 Safari/602.4.8'
    , 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/601.1.56 (KHTML, like Gecko) Version/9.0 Safari/601.1.56'
    , 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/602.3.12 (KHTML, like Gecko) Version/10.0.2 Safari/602.3.12'
    , 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/603.2.5 (KHTML, like Gecko) Version/10.1.1 Safari/603.2.5'
    , 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.1 Safari/603.1.30'
    , 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/601.4.4 (KHTML, like Gecko)'
    , 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/603.3.8 (KHTML, like Gecko) Version/10.1.2 Safari/603.3.8'
    , 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.1 Safari/603.1.30'
    , 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_3) AppleWebKit/537.75.14 (KHTML, like Gecko) Version/7.0.3 Safari/7046A194A'
    , 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/601.5.17 (KHTML, like Gecko)'
    , 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/602.3.12 (KHTML, like Gecko) Version/10.0.2 Safari/602.3.12'
    , 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11) AppleWebKit/601.1.56 (KHTML, like Gecko) Version/9.0 Safari/601.1.56'
    , 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/601.7.8 (KHTML, like Gecko) Version/9.1.3 Safari/601.7.8'
    , 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/602.1.50 (KHTML, like Gecko) Version/10.0 Safari/602.1.50'
    , 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/601.7.7 (KHTML, like Gecko) Version/9.1.2 Safari/601.7.7'
    , 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_5_8) AppleWebKit/534.50.2 (KHTML, like Gecko) Version/5.0.6 Safari/533.22.3'
    , 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/601.2.7 (KHTML, like Gecko) Version/9.0.1 Safari/601.2.7'
    , 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/534.59.10 (KHTML, like Gecko) Version/5.1.9 Safari/534.59.10'
    , 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_5) AppleWebKit/537.78.2 (KHTML, like Gecko) Version/6.1.6 Safari/537.78.2'
    , 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/602.2.14 (KHTML, like Gecko) Version/10.0.1 Safari/602.2.14'
    , 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/600.8.9 (KHTML, like Gecko) Version/6.2.8 Safari/537.85.17'
    , 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/601.3.9 (KHTML, like Gecko) Version/9.0.2 Safari/601.3.9'
    , 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/602.2.14 (KHTML, like Gecko) Version/10.0.1 Safari/602.2.14'
    , 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/601.6.17 (KHTML, like Gecko) Version/9.1.1 Safari/601.6.17'
    , 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/601.7.8 (KHTML, like Gecko) Version/9.1.3 Safari/537.86.7'
    , 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/602.4.8 (KHTML, like Gecko) Version/10.0.3 Safari/602.4.8'
    , 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.90 Safari/537.36'
    , 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/602.1.50 (KHTML, like Gecko) Version/10.0 Safari/602.1.50'
    , 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/603.2.5 (KHTML, like Gecko) Version/10.1.1 Safari/603.2.5'
    , 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/537.17 (KHTML, like Gecko) Chrome/24.0.1312.57 Safari/537.17'
    , 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_4) AppleWebKit/600.7.12 (KHTML, like Gecko) Version/8.0.7 Safari/600.7.12'
    , 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/602.4.8 (KHTML, like Gecko) Version/10.0.3 Safari/602.4.8'
    , 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/601.1.56 (KHTML, like Gecko) Version/9.0 Safari/601.1.56'
    , 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/602.3.12 (KHTML, like Gecko) Version/10.0.2 Safari/602.3.12'
    , 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/603.2.5 (KHTML, like Gecko) Version/10.1.1 Safari/603.2.5'

]

exports.getBlogIdList = () => {
    return new Promise((resolve, reject) => {
        let workbook = xlsx.readFile('./blog.xlsx');
        let worksheet = workbook.Sheets['target'];
        let id_list = [];
        for (let col in worksheet) {
            if (col.toString()[0] == 'C') {
                let url = worksheet[col].v.split('/');
                id_list.push(url[3]);
            }
        }
        id_list.shift();
        resolve(id_list);
    })
}

exports.getTotalCount = (blog_id) => {
    return new Promise(async (resolve, reject) => {
        let info;
        try {
            info = await axios.get(postListURL + blog_id);
            if (info != undefined && info.data.resultCode != 'E') {
                let formatted_info = JSON.parse(info.data.replace(/'/gi, `"`));
                let total_count = formatted_info.totalCount;
                resolve(parseInt(total_count));
            } else {
                resolve(0);
            }
        } catch (e) {
            resolve(0);
        }
    });
}

exports.getLogNoList = (blog_id, count) => {
    let countPerPage = 30
    return new Promise(async (resolve, reject) => {
        let page = Math.ceil(count / countPerPage);
        console.log(page);
        // let promise = [];
        let post_list = [];
        for (let i = 1; i <= page; i++) {
            let url = `${postListURL}${blog_id}&currentPage=${i}&countPerPage=${countPerPage}`;
            // promise.push(axios({
            //     method: 'get',
            //     url: url,
            //     headers: {
            //         'Referer': Referers[getRandomInt(Referers.length - 1)],
            //         'User-Agent': UserAgents[getRandomInt(UserAgents.length - 1)],
            //         'Content-Type': 'application/x-www-form-urlencoded'
            //     }
            // }).then((val) => {
            //     return JSON.parse(val.data.replace(/'/gi, `"`)).postList;
            // }));
            // Promise.all(promise).then(function (value) {
            //     let post_list = [];
            //     for (let val of value) {
            //         for (let data of val) {
            //             let param = {
            //                 logNo: data.logNo,
            //                 title: data.title,
            //                 date: data.addDate
            //             }

            //             post_list.push(param);
            //         }
            //     }

            //     resolve(post_list);
            // });

            let temp = await (async () => {
                return new Promise((resolve, reject) => {
                    setTimeout(async function () {
                        let d = await axios({
                            method: 'get',
                            url: url,
                            headers: {
                                'Referer': Referers[getRandomInt(Referers.length - 1)],
                                'User-Agent': UserAgents[getRandomInt(UserAgents.length - 1)],
                                'Content-Type': 'application/x-www-form-urlencoded'
                            }
                        });
                        let value = JSON.parse(d.data.replace(/'/gi, `"`)).postList;
                        let temp_arr = [];
                        for (let val of value) {
                            let param = {
                                logNo: val.logNo,
                                title: val.title,
                                date: val.addDate
                            }
                            temp_arr.push(param);
                        }
                        resolve(temp_arr);
                    }, 100);
                })
            })(url);
            post_list = post_list.concat(temp);
        }
        resolve(post_list);
    })
}

exports.getContents = (blog_id, list) => {
    return new Promise(async (resolve, reject) => {
        // let promise = [];

        // for (let post of list) {
        //     let url = `${postViewURL}${blog_id}&logNo=${post.logNo}`
        //     promise.push(parse(blog_id,url, post));
        // }

        // let contents = Promise.all(promise)

        // resolve(contents);

        for (let post of list) {
            let url = `${postViewURL}${blog_id}&logNo=${post.logNo}`
            let temp = await (() => {
                return new Promise(async (resolve, reject) => {
                    setTimeout(() => {
                        resolve(parse(blog_id, url, post));
                    }, 1000);
                })
            })(blog_id, url, post);
            let text = 
            `\n블로그 ID : ${temp.blog_id}\n제목 : ${temp.title}\n날짜 : ${temp.date}\n내용 : ${temp.contents}`
            fs.appendFile('./data.txt', text, function(err){
                console.log(err);
            })
        }
        resolve('OK');
    })
}

function getRandomInt(max) {
    var min = 0;
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function parse(blog_id, url, post) {
    return new Promise(async (resolve, reject) => {
        let content = await axios({
            method: 'get',
            url: url,
            headers: {
                'Referer': Referers[getRandomInt(Referers.length - 1)],
                'User-Agent': UserAgents[getRandomInt(UserAgents.length - 1)],
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        let $ = cheerio.load(content.data);

        let div = $('.se-main-container').find('.se-text');
        let text_arr = [];
        div.each((i) => {
            text_arr.push($(div[i]).text().trim());
        })

        let param = {
            blog_id: blog_id,
            title: decodeURIComponent(post.title.replace(/\+/gi,' ')),
            date: post.date,
            contents: text_arr
        }
        console.log(param);
        resolve(param);
    })
}