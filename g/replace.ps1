Get-ChildItem -Directory | ForEach-Object {

    $folder = $_.Name
    $index = Join-Path $_.FullName "index.html"

    if (!(Test-Path $index)) { return }

    $html = Get-Content $index -Raw

    if ($html -notmatch "<!-- Mobile version -->") { return }

$block = @"
<div class="mobileVersion">
      <div class="force-visible site-wrapper">

        <div class="games-block mobile-game-page">
           
          <div class="mobile-game-divider"></div>
          <div class="mobile-game-area48 mobile-game-area-inner48">
            <div id="game-container" class="mobile-game-container"><button type="button" id="play-game-tile"
                class="buttonReset mobile-play-button mobile-play-button-large">
                <div class="mobile-play-icon-wrap"><svg width="36" height="36" xmlns="http://www.w3.org/2000/svg"
                    class="mobile-play-icon-bgo">
                    <use href="#playIcon"></use>
                  </svg></div>
                <h2 class="mobile-play-text">Play now</h2><img alt="$folder" width="314"
                  height="314" src="/assest/images/$folder@2x.webp" class="mobile-game-thumbnail">
              </button></div>
          </div>
           <!-- releated-games -->
        </div>
      </div>
    </div>

"@

    $html = $html -replace "<!-- Mobile version -->", $block

    Set-Content $index $html -Encoding UTF8
}
