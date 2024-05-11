import Conf from '/conf.js';

const cacheName = Conf.CacheName;

const cacheAssets = [
    '/assets/images/isoffline.png'
];

//install
self.addEventListener('install', e=>{
    console.log("Installed");
    e.waitUntil(
        caches
            .open(cacheName)
            .then(cache => {
                console.log('Caching Files');
                cache.addAll(cacheAssets);
            })
            .then(() => self.skipWaiting())
    );
});

//Activate
self.addEventListener('activate', e=>{
    console.log("Activated");
    // remove old caches
    e.waitUntil(
        caches.keys().then(cacheNamesList => {
            return Promise.all(
                cacheNamesList.map(cache => {
                    if(cache !== cacheName){
                        console.log("Clearing Cache");
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

//fetch event für offline
self.addEventListener('fetch', e => {
    console.log("fetching");
    e.respondWith(
        fetch(e.request)
            .then(res => {
                //clone response
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
});