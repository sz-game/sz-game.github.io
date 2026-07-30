 import {
      initializeApp
    }
      from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
    import {
      getDatabase,
      ref,
      onValue,
      runTransaction
    }
      from "https://www.gstatic.com/firebasejs/12.13.0/firebase-database.js";
    /* FIREBASE CONFIG */
    const firebaseConfig = {
      apiKey: "AIzaSyBwyoXZ0zObSvs6dQsuslFoQf58XJZ56r8",
      authDomain: "unblockedgames-free.firebaseapp.com",
      databaseURL: "https://unblockedgames-free-default-rtdb.firebaseio.com",
      projectId: "unblockedgames-free",
      storageBucket: "unblockedgames-free.firebasestorage.app",
      messagingSenderId: "733863181516",
      appId: "1:733863181516:web:0d74cd3b08ca559f869669"
    };
    /* INIT */
    const app = initializeApp(firebaseConfig);
    const db = getDatabase(app);
    /* AUTO GAME ID */
    const gameId = "level-devil";
    /* DB REF */
    const gameRef = ref(db, "games/" + gameId);
    /* BUTTONS */
    const likeButtons = document.querySelectorAll(".like-btn");
    const dislikeButtons = document.querySelectorAll(".dislike-btn");
    const likeBtn = likeButtons[0];
    const dislikeBtn = dislikeButtons[0];
    /* COUNTS */
    const likeCounts = document.querySelectorAll(".like-count");
    const dislikeCounts = document.querySelectorAll(".dislike-count");
    /* FORMATTER */
    function formatCount(num) {
      if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + "M";
      }
      if (num >= 1000) {
        return (num / 1000).toFixed(1) + "K";
      }
      return num;
    }
    function setReactionUI(type) {
      likeButtons.forEach((btn) => btn.classList.toggle("active", type === "like"));
      dislikeButtons.forEach((btn) => btn.classList.toggle("active", type === "dislike"));
    }
    function setCountText(elementList, value) {
      elementList.forEach((element) => {
        element.innerText = value;
      });
    }
    /* USER REACTION STORAGE */
    const reactionKey = "reaction-" + gameId;
    /* LOAD SAVED STATE */
    const savedReaction = localStorage.getItem(reactionKey);
    if (savedReaction === "like") {
      setReactionUI("like");
    } else if (savedReaction === "dislike") {
      setReactionUI("dislike");
    } else {
      setReactionUI("");
    }
    /* REALTIME DATABASE */
    onValue(gameRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setCountText(likeCounts, 0);
        setCountText(dislikeCounts, 0);
        return;
      }
      setCountText(likeCounts, formatCount(data.likes || 0));
      setCountText(dislikeCounts, formatCount(data.dislikes || 0));
    });
    /* UPDATE REACTION */
    async function updateReaction(type) {
      const currentReaction = localStorage.getItem(reactionKey);
      if (currentReaction === type) {
        localStorage.removeItem(reactionKey);
        setReactionUI("");
        runTransaction(gameRef, (data) => {
          if (data == null) {
            return { likes: 0, dislikes: 0 };
          }
          if (type === "like") {
            data.likes = Math.max((data.likes || 0) - 1, 0);
          }
          if (type === "dislike") {
            data.dislikes = Math.max((data.dislikes || 0) - 1, 0);
          }
          return data;
        });
        return;
      }
      localStorage.setItem(reactionKey, type);
      setReactionUI(type);
      runTransaction(gameRef, (data) => {
        if (data == null) {
          data = { likes: 0, dislikes: 0 };
        }
        if (currentReaction === "like") {
          data.likes = Math.max((data.likes || 0) - 1, 0);
        }
        if (currentReaction === "dislike") {
          data.dislikes = Math.max((data.dislikes || 0) - 1, 0);
        }
        if (type === "like") {
          data.likes = (data.likes || 0) + 1;
        }
        if (type === "dislike") {
          data.dislikes = (data.dislikes || 0) + 1;
        }
        return data;
      });
    }
    /* EVENTS */
    likeButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        updateReaction("like");
      });
    });
    dislikeButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        updateReaction("dislike");
      });
    });