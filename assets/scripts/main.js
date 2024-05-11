import Conf from '/conf.js';

const cacheName = Conf.CacheName;

if('serviceWorker' in navigator){
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('/sw_site.js', {type: 'module'})
            .then(reg => console.log('SW Registered'))
            .catch(err => console.log("SW Error!"))
    });
}

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

const netz_img = document.getElementById("netz_img");
const netz_text = document.getElementById("netz_text");

updateOnlineStatus();

async function updateOnlineStatus() {
    const imgPath = "/assets/images/"
    netz_img.src = navigator.onLine ? `${imgPath}isonline.png` : ((await getDataFromCache(`${imgPath}isoffline.png`)) || `${imgPath}gear-spinner.svg`);
    netz_text.textContent = navigator.onLine ? "Online" : 'Offline';
}

async function getDataFromCache(itemUrl) { //da, isoffline.png noch nicht geladen, deswegen nehme ich von gespeicherte Data bei Service Worker
    try {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();

        for (const request of requests) {
            const url = new URL(request.url);
            if (url.pathname === itemUrl) {
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