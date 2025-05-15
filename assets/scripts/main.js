"use strict";

import Conf from '../../conf.js';

const cacheName = Conf.CacheName;

if('serviceWorker' in navigator){ //um service worker zu registrieren.
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('/sw_site.js', {type: 'module'})
            .then(reg => console.log('SW Registered'))
            .catch(err => console.log("SW Error!"))
    });
}

window.addEventListener('online', updateOnlineStatus); //wenn die Verbindung wieder hergestellt wird
window.addEventListener('offline', updateOnlineStatus); //wenn die Verbindung unterbrochen wird

const netz_img = document.getElementById("netz_img");
const netz_text = document.getElementById("netz_text");

updateOnlineStatus();

async function updateOnlineStatus() { //Verbindungsstatus anzeigen
    const imgPath = "assets/images/"
    netz_img.src = navigator.onLine ? `${imgPath}isonline.png` : ((await getDataFromCache(`${imgPath}isoffline.png`)) || `${imgPath}gear-spinner.svg`);
    netz_text.textContent = navigator.onLine ? "Online" : 'Offline';
}

async function getDataFromCache(itemUrl) { //da isoffline.png geladen wurde, deswegen wird Data von Service Worker abgerufen
    try {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();

        for (const request of requests) {
            const url = new URL(request.url);
            //console.log(url.pathname, itemUrl)
            if (url.pathname.includes(itemUrl)) {
                const response = await cache.match(request);
                if (response) {
                    const blob = await response.blob();
                    const resUrl = URL.createObjectURL(blob);
                    return resUrl;
                }
            }
        }
        return null;
    } catch (error) {
        return null;
    }
}