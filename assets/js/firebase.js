fetch("/firebase-config").then(e => e.json()).then(e => {
    let t = {
        apiKey: e.apiKey,
        authDomain: e.authDomain,
        projectId: e.projectId,
        storageBucket: e.storageBucket,
        messagingSenderId: e.messagingSenderId,
        appId: e.appId,
        measurementId: e.measurementId
    };
    firebase.initializeApp(t);
    let n = firebase.messaging();
    async function a() {
        try {
            let e = await Notification.requestPermission();
            "granted" === e && i()
        } catch (t) {}
    }
    async function i() {
        try {
            let e = await n.getToken({
                    vapidKey: "BAFOXQZdSJpLC2cnQG_D4JU23uoc2W_fK4AVpV3d_2LIrKLdpVlnW9nvqktaKe7hyt1pQXopanKdM3671oce4BA"
                }),
                t = document.querySelector('meta[name="csrf-token"]').getAttribute("content");
            e && await fetch("/store-token", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": t
                },
                body: JSON.stringify({
                    token: e
                })
            })
        } catch (a) {}
    }
    "serviceWorker" in navigator && navigator.serviceWorker.register("https://littlegames.io/firebase-messaging-sw.js").then(e => {
        setTimeout(function() {
            a()
        }, 15e3)
    }).catch(e => {})
}).catch(e => console.error("Error fetching Firebase config:", e));