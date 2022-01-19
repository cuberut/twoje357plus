// ==UserScript==
// @name         Rekomendacje357+
// @version      0.1
// @author       cuberut
// @include      https://radio357.pl/twoje357/*
// @updateURL    https://raw.githubusercontent.com/cuberut/twoje357plus/main/twoje357plus.js
// @grant        GM_addStyle
// @run-at       document-body
// ==/UserScript==

GM_addStyle("div.tile__rank { color: white; font-weight: bold; position: absolute; z-index: 1; right: 5px; text-shadow: 1px 1px 3px #000; }");
GM_addStyle("div.podcast__rank { position: absolute; right: -100px; }");

const getTagRank = (data) => `<div class="tile__rank">${data.rank} (${data.amount})</div>`;

const podcastRoot = "https://api.r357.eu/api/podcasts/"
const rankUrl = "https://opensheet.elk.sh/1QFwNWRWAAi_DU7FIpHkYxeCStAvZGUR_L1Mps85JYbg/ranks"

const dicPathApi = {
    "na-dzis": "today",

};

const orderToday = ["to_listen", "recommended", "latest", "popular"];

const getData = async (path) => {
    const podcastUrl = podcastRoot + dicPathApi[path];

    const podcastResponse = await fetch(podcastUrl);
    const rankResponse = await fetch(rankUrl);

    const podcastJson = await podcastResponse.json();
    const rankJson = await rankResponse.json();

    return await { podcastData: podcastJson, rankData: rankJson };
}

(function() {
    'use strict';

    const currPath = window.location.pathname.substr(10);

    getData(currPath).then(({podcastData, rankData}) => {
        const dicRank = rankData.reduce((a, x) => ({...a, [x.id]: {rank: x.rank, amount: x.amount}}), {});

        const tileData = orderToday
            .reduce((array, key) => [...array, ...podcastData[key]], [])
            .map(tile => ({
                id: tile.id,
                rank: dicRank[tile.id]?.rank,
                amount: dicRank[tile.id]?.amount
            }));

        const tileList = document.querySelectorAll(".podcast-tile");

        tileList.forEach((tile, i) => {
            if (tileData[i].rank) {
                tile.insertAdjacentHTML('afterbegin', getTagRank(tileData[i]));
            }
        });
    });
})();
