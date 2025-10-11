importScripts("https://www.gstatic.com/firebasejs/11.2.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.2.0/firebase-messaging-compat.js");

// Firebase configuration

const firebaseConfig = {
    apiKey: "AIzaSyAet2_RGiJFq_cWgBOjYT1yWdXirSBEOAU",
    authDomain: "littlegames-pn-live.firebaseapp.com",
    projectId: "littlegames-pn-live",
    storageBucket: "littlegames-pn-live.firebasestorage.app",
    messagingSenderId: "536054739612",
    appId: "1:536054739612:web:df080fff9113ddf13a7359",
    measurementId: "G-83M7HKT5YZ"
};

// Initialize Firebase in the service worker
firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onMessage((payload) => {
    console.log("Foreground Message Received", payload);

    // Check if a notification is included in the payload
    if (payload.notification) {
        // Let Firebase handle it automatically; do not manually call showNotification()
        return;
    }

    const notificationTitle = payload.notification.title || "Little Games";
    const notificationOptions = {
        body: payload.notification.body,
        icon: "/littlegames_small_logo-black.png",
        badge: "/littlegames_small_logo-black.png",
        image: payload.data.image || "/default-banner.png",
        data: {
            url: payload.data.click_action || "https://littlegames.io"
        }
    };

    self.registration.showNotification(notificationTitle, notificationOptions);

});

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log("Background Message received", payload);

    const notificationTitle = payload.notification.title || "Little Games";
    const notificationOptions = {
        body: payload.notification.body,
        icon: "/littlegames_small_logo-black.png",
        badge: "/littlegames_small_logo-black.png",
        image: payload.data.image || "/default-banner.png",
        data: {
            url: payload.data.click_action || "https://littlegames.io"
        }
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});



// Handle notification click events
self.addEventListener("notificationclick", function(event) {
    event.notification.close(); // Close the notification

    // Open the URL stored in the notification data
    const urlToOpen = event.notification.data.url || "https://littlegames.io";

    event.waitUntil(
        clients.matchAll({
            type: "window",
            includeUncontrolled: true
        }).then((windowClients) => {
            // Check if any client (tab) is already open with the URL
            for (let client of windowClients) {
                if (client.url === urlToOpen && "focus" in client) {
                    return client.focus();
                }
            }
            // If no open client, open a new window
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});