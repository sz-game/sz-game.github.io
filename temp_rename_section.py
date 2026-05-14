from pathlib import Path

html_path = Path('sample.html')
css_path = Path('games-layout.css')
text = html_path.read_text(encoding='utf-8')
replacements = [
    ('class="css-1w7kyz3 thumb-grid"', 'class="thumb-grid"'),
    ('class="css-y8aj3r thumb-link GameThumb_gameThumbLinkDesktop__wcir5 GameThumb_isResponsiveGrid__b4QQf thumb-responsive game-thumb-test-class game-thumb-test"', 'class="thumb-link thumb-responsive"'),
    ('class="GameThumbLabel_multipleLabelsContainer__eEBwr thumb-label-group"', 'class="thumb-label-group"'),
    ('class="GameThumbLabel_label__dz3yR thumb-label GameThumbLabel_hot__CWhxn thumb-label-hot"', 'class="thumb-label thumb-label-hot"'),
    ('class="GameThumbLabel_label__dz3yR thumb-label GameThumbLabel_withOriginals__7mhGw thumb-label-with-originals GameThumbLabel_originals__dbBXE thumb-label-originals"', 'class="thumb-label thumb-label-originals"'),
    ('class="GameThumbLabel_label__dz3yR thumb-label GameThumbLabel_iconMode__Ljye2 thumb-label-icon GameThumbLabel_withOriginals__7mhGw thumb-label-with-originals GameThumbLabel_originals__dbBXE thumb-label-originals"', 'class="thumb-label thumb-label-originals"'),
    ('class="GameThumb_gameThumbTitleContainer__J1K4D thumb-title gameThumbTitleContainer"', 'class="thumb-title"'),
    ('class="GameThumb_gameThumbImage__FSasr thumb-image"', 'class="thumb-image"'),
    ('class="GameContainerDesktop_gameContainerDesktopRoot__qvoxU game-container-root"', 'class="game-container-root"'),
    ('class="GameContainer game-container"', 'class="game-container"'),
    ('class="GamePageDesktop_leaderboard__ddMUk page-leaderboard leaderboard"', 'class="page-leaderboard"'),
    ('class="GamePageDesktop_underGameContainerGrid__cdhNC page-under-grid"', 'class="page-under-grid"'),
    ('class="GamePageDesktop_underGameContainerGamesWrapper__Rahgf page-under-games"', 'class="page-under-games"'),
    ('class="GamePageDesktop_playNextTitle__mvetU page-play-next-title"', 'class="page-play-next-title"'),
    ('class="Button_czyButton__y8IRs btn Button_czyButton--contained--purple__OBSeL btn-contained-purple Button_czyButton--height50__yzcvJ btn-height50 GamePageDesktop_showMoreButton__xWgfT page-show-more-button"', 'class="btn btn-contained-purple btn-height50 page-show-more-button"'),
    ('class="GameInfo_gameInfo__2UItk game-info GameInfo_isDesktop__KqJ3d game-info-desktop"', 'class="game-info game-info-desktop"'),
    ('class="GameInfo_roundedCornersContainer__D5D_p game-info-rounded"', 'class="game-info-rounded"'),
    ('class="GameInfo_styledHtmlDiv__Zg2EY game-info-html gameDescription_first description-first"', 'class="game-info-html description-first"'),
    ('class="GameInfo_styledHtmlDiv__Zg2EY game-info-html"', 'class="game-info-html"'),
    ('class="GameInfo_roundedCornersContainer__D5D_p game-info-rounded GameInfo_removeTopPadding__hI61b game-info-no-top-padding"', 'class="game-info-rounded no-top-padding"'),
    ('class="GameInfo_gameInfoStoreButtonsContainer__snbxi game-info-buttons"', 'class="game-info-buttons"'),
]
for old, new in replacements:
    text = text.replace(old, new)
html_path.write_text(text, encoding='utf-8')

css = css_path.read_text(encoding='utf-8')
css = css.replace('.GameThumb_gameThumbLinkDesktop__wcir5.GameThumb_isResponsiveGrid__b4QQf, .thumb-link.GameThumb_isResponsiveGrid__b4QQf {', '.GameThumb_gameThumbLinkDesktop__wcir5.GameThumb_isResponsiveGrid__b4QQf, .thumb-link.thumb-responsive {')
marker = 'GameInfo_roundedCornersContainer__D5D_p, .game-info-rounded {'
idx = css.find(marker)
if idx != -1:
    start = css.find('{', idx)
    end = css.find('}\n', start)
    if end != -1:
        insert_pos = end + 2
        css = css[:insert_pos] + '\n.game-info-rounded.no-top-padding {\n    padding-top: 0\n}\n' + css[insert_pos:]
css_path.write_text(css, encoding='utf-8')
print('Done')
