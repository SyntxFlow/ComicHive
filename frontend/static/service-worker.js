var staticCacheName = "pwa-v" + new Date().getTime();
var filesToCache = [
    '/mobile',
];

// Cache on install
self.addEventListener("install", event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(staticCacheName)
            .then(cache => {
                return cache.addAll(filesToCache);
            })
    );
});

// Clear cache on activate
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(cacheName => (cacheName.startsWith("pwa-")))
                    .filter(cacheName => (cacheName !== staticCacheName))
                    .map(cacheName => caches.delete(cacheName))
            );
        })
    );
    return self.clients.claim();
});

// Serve from Cache
self.addEventListener("fetch", event => {
    const url = new URL(event.request.url);
    self.currentUrl = url.toString();
    // console.log("Fetching: ", self.currentUrl);
    // console.log(self.currentUrl)
    if (self.currentUrl.includes('https://www.googleapis.com/drive/v3/files/')) { //only add header to the endpoint i want
        event.respondWith(fetchStreaming(event));
    } else if (self.currentUrl.includes('.my.id/kdrive/')) { //only add header to the endpoint i want
        if (url.searchParams.get('gid') !== self.driveId) { resetState(); }
        self.clientId = url.searchParams.get('id');
        self.clientSecret = url.searchParams.get('sc');
        self.refreshToken = url.searchParams.get('rt');
        self.driveId = url.searchParams.get('gid');
        event.respondWith(fetchStreaming(event));
    } else if (self.currentUrl.includes('https://komi.my.id/')) {
        if (url.searchParams.get('fn') !== self.fileName) { resetState(); }
        self.clientId = url.searchParams.get('id');
        self.clientSecret = url.searchParams.get('sc');
        self.refreshToken = url.searchParams.get('rt');
        self.fileName = url.searchParams.get('fn');
        event.respondWith(fetchStreaming(event));
    }
});

function resetState() {
    self.fileId = null;
    self.accessToken = null;
    self.requestTimestamp = null;
}

function enQuery(data) {
    const ret = [];
    for (let d in data) {
        ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
    }
    return ret.join('&');
}

async function getFileIdFromFileName() {
    const params = encodeURIComponent(`name ='${self.fileName}'`);
    await fetch(`https://www.googleapis.com/drive/v3/files?q=${params}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${self.accessToken}`
        }
    }).then((data) => data.json()).then((json) => {
        self.fileId = json.files[0].id;
    }).catch((error) => {
        console.log(error);
    });
}

async function fetchAccessToken() {
    await fetch('https://www.googleapis.com/oauth2/v4/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: enQuery({
            client_id: self.clientId,
            client_secret: self.clientSecret,
            refresh_token: self.refreshToken,
            grant_type: 'refresh_token',
        })
    }).then((data) => data.json()).then((json) => {
        self.requestTimestamp = Math.floor(Date.now() / 1000);
        self.accessToken = json.access_token;
    }).catch((error) => {
        console.log(error);
    });
}

async function fetchStreaming(event) {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const timestampDiff = currentTimestamp - self.requestTimestamp;
    if (!self.accessToken || timestampDiff > 3000) {
        await fetchAccessToken();
    }
    if (self.fileName && !self.fileId) {
        await getFileIdFromFileName();
    }
    const url = `https://www.googleapis.com/drive/v3/files/${self.driveId || self.fileId}?alt=media`;
    const newRequest = new Request(url, {
        mode: "cors",
        credentials: "omit",
        //also supports partial content (seeking)
        headers: {
            Range:
                event.request.headers.get("Range") != undefined
                    ? event.request.headers.get("Range")
                    : "0-",
            Authorization: `Bearer ${self.accessToken}`
        }
    });
    return fetch(newRequest);
}
