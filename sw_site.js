"use strict";

import Conf from './conf.js';

const cacheName = Conf.CacheName;

const cacheAssets = [
    'assets/images/isoffline.png'
];

/* '/',
'/conf.js',
'assets/scripts/mvp.js',
'assets/scripts/data.json',
'assets/scripts/main.js',
'assets/css/mvp.css',
'assets/images/header.jpg',
'assets/images/isoffline.png',
'assets/images/isonline.png',
'assets/images/gear-spinner.svg',
'assets/manifest/icons/icon-128x128.png',
'https://cdnjs.cloudflare.com/ajax/libs/vexflow/1.2.88/vexflow-min.js',
'https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/katex.min.css',
'https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/katex.min.js',
'https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/contrib/auto-render.min.js' */

//install
self.addEventListener('install', e=>{
    //console.log("Installed");
    e.waitUntil(
        caches
            .open(cacheName)
            .then(cache => {
                //console.log('Caching Files');
                cache.addAll(cacheAssets);
            })
            .then(() => self.skipWaiting())
    );
});

//Activate
self.addEventListener('activate', e=>{
    //console.log("Activated");
    // remove old caches
    e.waitUntil(
        caches.keys().then(cacheNamesList => {
            return Promise.all(
                cacheNamesList.map(cache => {
                    if(cache !== cacheName){
                        //console.log("Clearing Cache");
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

//fetch event für offline
self.addEventListener('fetch', e => {
    if (e.request.method !== 'POST') {
        e.respondWith(
            fetch(e.request)
                .then(res => {
                    const resClone = res.clone();
                    caches
                        .open(cacheName)
                        .then(cache => {
                            cache.put(e.request, resClone);
                        });
                    return res;
                })
                .catch(err => caches.match(e.request).then(res => res))
        );
    }
});
