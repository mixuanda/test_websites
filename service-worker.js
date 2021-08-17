
// configuration
const
  version = '1.0.0',
  CACHE = version + '::PWAsite',
  offlineURL = '/',
  installFilesEssential = [
    '/',
    '/manifest.json',
    '/assest/css/main.css',
    '/assest/css/noscript.css',
    '/assest/css/fontawesome-all.min.css',
    '/assest/js/main.js',
    '/assest/js/breakpoints.min.js',
    '/assest/js/browser.min.js',
    '/assest/js/jquery.min.js',
    '/assest/js/jquery.scrollex.min.js',
    '/assest/js/jquery.scrolly.min.js',
    '/assest/js/util.js',
    '/assest/sass/main.scss',
    '/assest/sass/noscript.scss',
    '/assest/sass/base/_page.scss',
    '/assest/sass/base/_reset.scss',
    '/assest/sass/base/_typography.scss',
    '/assest/sass/components/_actions.scss',
    '/assest/sass/components/_box.scss',
    '/assest/sass/components/_button.scss',
    '/assest/sass/components/_features.scss',
    '/assest/sass/components/_form.scss',
    '/assest/sass/components/_icon.scss',
    '/assest/sass/components/_icons.scss',
    '/assest/sass/components/_image.scss',
    '/assest/sass/components/_list.scss',
    '/assest/sass/components/_row.scss',
    '/assest/sass/components/_section.scss',
    '/assest/sass/components/_spotlight.scss',
    '/assest/sass/components/_statistics.scss',
    '/assest/sass/components/_table.scss',
    '/assest/sass/layout/_footer.scss',
    '/assest/sass/layout/_header.scss',
    '/assest/sass/layout/_main.scss',
    '/assest/sass/layout/_nav.scss',
    '/assest/sass/layout/_wrapper.scss',
    '/assest/sass/libs/_breakpoints.scss',
    '/assest/sass/libs/_functions.scss',
    '/assest/sass/libs/_html-grid.scss',
    '/assest/sass/libs/_mixins.scss',
    '/assest/sass/libs/_vars.scss',
    '/assest/sass/libs/_vendor.scss',
    '/images/logo/logo152.png',
    '/index.html',
    '/generic.html',
    'elements.html'
  ].concat(offlineURL),
  installFilesDesirable = [
    '/favicon.ico',
    '/images/pic1.jpg',
    '/images/pic2.jpg',
    '/images/pic3.jpg',
    '/images/pic4.jpg',
    '/images/pic5.jpg',
    '/images/pic6.jpg'
  ];

// install static assets
function installStaticFiles() {
 
  return caches.open(CACHE)
    .then(cache => {
 
      // cache desirable files
      cache.addAll(installFilesDesirable);
 
      // cache essential files
      return cache.addAll(installFilesEssential);
 
    });
 
}

// clear old caches
function clearOldCaches() {
 
    return caches.keys()
      .then(keylist => {
   
        return Promise.all(
          keylist
            .filter(key => key !== CACHE)
            .map(key => caches.delete(key))
        );
   
      });
   
  }
   
  // application activated
  self.addEventListener('activate', event => {
   
    console.log('service worker: activate');
   
      // delete old caches
    event.waitUntil(
      clearOldCaches()
      .then(() => self.clients.claim())
      );
   
  });


// application installation
self.addEventListener('install', event => {
 
    console.log('service worker: install');
   
    // cache core files
    event.waitUntil(
      installStaticFiles()
      .then(() => self.skipWaiting())
    );
   
  });



// is image URL?
let iExt = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp'].map(f => '.' + f);
function isImage(url) {
 
  return iExt.reduce((ret, ext) => ret || url.endsWith(ext), false);
 
}
 
 
// return offline asset
function offlineAsset(url) {
 
  if (isImage(url)) {
 
    // return image
    return new Response(
      '<svg role="img" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><title>offline</title><path d="M0 0h400v300H0z" fill="#eee" /><text x="200" y="150" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif" font-size="50" fill="#ccc">offline</text></svg>',
      { headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'no-store'
      }}
    );
 
  }
  else {
 
    // return page
    return caches.match(offlineURL);
 
  }
 
}

// application fetch network data
self.addEventListener('fetch', event => {
 
    // abandon non-GET requests
    if (event.request.method !== 'GET') return;
   
    let url = event.request.url;
   
    event.respondWith(
   
      caches.open(CACHE)
        .then(cache => {
   
          return cache.match(event.request)
            .then(response => {
   
              if (response) {
                // return cached file
                console.log('cache fetch: ' + url);
                return response;
              }
   
              // make network request
              return fetch(event.request)
                .then(newreq => {
   
                  console.log('network fetch: ' + url);
                  if (newreq.ok) cache.put(event.request, newreq.clone());
                  return newreq;
   
                })
                // app is offline
                .catch(() => offlineAsset(url));
   
            });
   
        })
   
    );
   
  });
