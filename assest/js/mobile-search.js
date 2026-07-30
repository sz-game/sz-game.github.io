(function(){
    // NOTE: har game mein "img" field add ki gayi hai — apni asal thumbnail image ka
    // path/URL yahan daalein. Agar image load nahi hoti to color box (tint) fallback
    // ke tor par dikhega (neeche render() mein onerror handler dekhein).
    var GAMES = [
      {title:"I Am Taxi Prankster Sim", category:"Driving games", img:"/assest/games/taxi-prankster.jpg", tint:"#e0a63c"},
      {title:"Drive Quest", category:"Driving games", img:"/assest/games/drive-quest.jpg", tint:"#c23b3b"},
      {title:"Obby Car Challenge: Drive", category:"Driving games", img:"/assest/games/obby-car.jpg", tint:"#3aa0c2"},
      {title:"Line Driver", category:"Driving games", img:"/assest/games/line-driver.jpg", tint:"#e8e6df"},
      {title:"Moscow Metro Driver 3D", category:"Driving games", img:"/assest/games/moscow-metro.jpg", tint:"#555"},
      {title:"City Bus Driver", category:"Driving games", img:"/assest/games/city-bus.jpg", tint:"#444"},
      {title:"DriveTown", category:"Driving games", img:"/assest/games/drivetown.jpg", tint:"#4a4a4a"},
      {title:"Russian Car Driver ZIL 130", category:"Driving games", img:"/assest/games/zil130.jpg", tint:"#3d3d3d"},
      {title:"Dirt Rally Driver HD", category:"Driving games", img:"/assest/games/dirt-rally.jpg", tint:"#2c2c2c"},
      {title:"Block Blast Puzzle", category:"Puzzle games", img:"/assest/games/block-blast.jpg", tint:"#3ac27a"},
      {title:"Merge Master 2048", category:"Puzzle games", img:"/assest/games/merge-master.jpg", tint:"#c2a03a"},
      {title:"Ninja Runner X", category:"Action games", img:"/assest/games/ninja-runner.jpg", tint:"#c23a5a"},
      {title:"Zombie Arena Royale", category:"Action games", img:"/assest/games/zombie-arena.jpg", tint:"#5a5ac2"}
    ];

    var trigger      = document.getElementById('bns-search-trigger');
    var overlay       = document.getElementById('bns-overlay');
    var pill          = document.getElementById('bns-pill');
    var input         = document.getElementById('bns-input');
    var clearBtn      = document.getElementById('bns-clear');
    var cancelBtn     = document.getElementById('bns-cancel');
    var emptyState    = document.getElementById('bns-empty-state');
    var resultsState  = document.getElementById('bns-results-state');
    var tagRow        = document.getElementById('bns-tag-row');
    var tagLabel      = document.getElementById('bns-tag-label');
    var tagCount      = document.getElementById('bns-tag-count');
    var resultsList   = document.getElementById('bns-results-list');
    var noResults     = document.getElementById('bns-no-results');
    var noResultsText = document.getElementById('bns-no-results-text');

    trigger.addEventListener('click', function(e){
      e.preventDefault();
      document.querySelector('.bottom-nav-item.bottom-nav-active')?.classList.remove('bottom-nav-active');
      trigger.classList.add('bottom-nav-active');
      openSearch();
    });

    function openSearch(){
      overlay.classList.add('bns-open');
      document.body.style.overflow = 'hidden';
      setTimeout(function(){ input.focus(); }, 50);
    }

    function closeSearch(){
      overlay.classList.remove('bns-open');
      document.body.style.overflow = '';
      input.value = '';
      render();
    }

    cancelBtn.addEventListener('click', closeSearch);

    clearBtn.addEventListener('click', function(){
      input.value = '';
      input.focus();
      render();
    });

    input.addEventListener('focus', function(){
      pill.classList.add('bns-focused');
      cancelBtn.classList.add('bns-show');
    });

    input.addEventListener('input', render);

    function render(){
      var q = input.value.trim().toLowerCase();
      clearBtn.hidden = !q;

      if(!q){
        emptyState.hidden = false;
        resultsState.hidden = true;
        return;
      }

      emptyState.hidden = true;
      resultsState.hidden = false;

      var matches = GAMES.filter(function(g){
        return g.title.toLowerCase().indexOf(q) !== -1 ||
               g.category.toLowerCase().indexOf(q) !== -1;
      });

      if(!matches.length){
        resultsList.innerHTML = '';
        tagRow.hidden = true;
        noResults.hidden = false;
        noResultsText.textContent = 'No games match "' + input.value.trim() + '"';
        return;
      }

      noResults.hidden = true;

      var counts = {};
      matches.forEach(function(g){ counts[g.category] = (counts[g.category]||0) + 1; });
      var top = Object.keys(counts).sort(function(a,b){ return counts[b]-counts[a]; })[0];
      tagRow.hidden = false;
      tagLabel.textContent = top;
      tagCount.textContent = counts[top];

      resultsList.innerHTML = matches.map(function(g){
        return '<button class="bns-result-row">' +
                 '<img class="bns-thumb" src="' + g.img + '" alt="' + g.title + '" ' +
                 'style="background:' + g.tint + '" ' +
                 'onerror="this.onerror=null;this.removeAttribute(\'src\');this.style.background=\'' + g.tint + '\';">' +
                 '<span class="bns-result-title">' + g.title + '</span>' +
               '</button>';
      }).join('');
    }
  })();
