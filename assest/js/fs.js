document.addEventListener('DOMContentLoaded', function() {
        // Fullscreen functionality
        const fullscreenBtn = document.getElementById('enter-fullscreen');
        const gameFrameWrapper = document.getElementById('gameFrameWrapper');
        
        if (fullscreenBtn && gameFrameWrapper) {
            fullscreenBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                if (!document.fullscreenElement) {
                    if (gameFrameWrapper.requestFullscreen) {
                        gameFrameWrapper.requestFullscreen().catch(err => console.log('Fullscreen error:', err));
                    } else if (gameFrameWrapper.webkitRequestFullscreen) {
                        gameFrameWrapper.webkitRequestFullscreen();
                    } else if (gameFrameWrapper.mozRequestFullScreen) {
                        gameFrameWrapper.mozRequestFullScreen();
                    } else if (gameFrameWrapper.msRequestFullscreen) {
                        gameFrameWrapper.msRequestFullscreen();
                    }
                } else {
                    if (document.exitFullscreen) {
                        document.exitFullscreen();
                    } else if (document.webkitExitFullscreen) {
                        document.webkitExitFullscreen();
                    } else if (document.mozCancelFullScreen) {
                        document.mozCancelFullScreen();
                    } else if (document.msExitFullscreen) {
                        document.msExitFullscreen();
                    }
                }
            });
        }

           // Like/Dislike functionality with toggle and persistence
            const upvoteBtn = document.getElementById('upvoteBtn');
            const downvoteBtn = document.getElementById('downvoteBtn');
            const gameId = '99-nights-forest-survival';
            let userVote = localStorage.getItem('vote_' + gameId) || null;

            // Load saved vote state
            if (upvoteBtn && downvoteBtn) {
                function updateVoteDisplay() {
                    if (userVote === 'upvote') {
                        upvoteBtn.classList.add('active');
                        downvoteBtn.classList.remove('active');
                    } else if (userVote === 'downvote') {
                        downvoteBtn.classList.add('active');
                        upvoteBtn.classList.remove('active');
                    } else {
                        upvoteBtn.classList.remove('active');
                        downvoteBtn.classList.remove('active');
                    }
                }

                updateVoteDisplay();

                upvoteBtn.addEventListener('click', function (e) {
                    e.preventDefault();

                    if (userVote === 'upvote') {
                        // Clicking like again = unlike
                        const count = parseInt(upvoteBtn.querySelector('span').textContent);
                        upvoteBtn.querySelector('span').textContent = count - 1;
                        userVote = null;
                    } else {
                        // First time like or switching from dislike
                        if (userVote === 'downvote') {
                            const downCount = parseInt(downvoteBtn.querySelector('span').textContent);
                            downvoteBtn.querySelector('span').textContent = downCount - 1;
                        }
                        const upCount = parseInt(upvoteBtn.querySelector('span').textContent);
                        upvoteBtn.querySelector('span').textContent = upCount + 1;
                        userVote = 'upvote';
                    }

                    localStorage.setItem('vote_' + gameId, userVote || '');
                    updateVoteDisplay();
                });

                downvoteBtn.addEventListener('click', function (e) {
                    e.preventDefault();

                    if (userVote === 'downvote') {
                        // Clicking dislike again = un-dislike
                        const count = parseInt(downvoteBtn.querySelector('span').textContent);
                        downvoteBtn.querySelector('span').textContent = count - 1;
                        userVote = null;
                    } else {
                        // First time dislike or switching from like
                        if (userVote === 'upvote') {
                            const upCount = parseInt(upvoteBtn.querySelector('span').textContent);
                            upvoteBtn.querySelector('span').textContent = upCount - 1;
                        }
                        const downCount = parseInt(downvoteBtn.querySelector('span').textContent);
                        downvoteBtn.querySelector('span').textContent = downCount + 1;
                        userVote = 'downvote';
                    }

                    localStorage.setItem('vote_' + gameId, userVote || '');
                    updateVoteDisplay();
                });
            }
    });
    (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "vke5joxz7z");

     // Prevent scrolling when keys are pressed inside the iframe
    const iframe = document.getElementById('test_app_frame');
    let isIframeFocused = false;

    // Detect mouse over iframe
    iframe.addEventListener('mouseenter', () => { isIframeFocused = true; });
    iframe.addEventListener('mouseleave', () => { isIframeFocused = false; });

    // Also detect focus (for accessibility)
    iframe.addEventListener('focus', () => { isIframeFocused = true; });
    iframe.addEventListener('blur', () => { isIframeFocused = false; });

    window.addEventListener('keydown', function(e) {
        if (isIframeFocused) {
            // List of keys to block
            const blockedKeys = [
                ' ', // Spacebar
                'ArrowUp',
                'ArrowDown',
                'ArrowLeft',
                'ArrowRight',
                'PageUp',
                'PageDown',
                'Home',
                'End'
            ];
            if (blockedKeys.includes(e.key)) {
                e.preventDefault();
            }
        }
    }, { passive: false });