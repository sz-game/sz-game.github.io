Get-ChildItem -Directory | ForEach-Object {

    $folder = $_.Name
    $index = Join-Path $_.FullName "index.html"

    if (!(Test-Path $index)) { return }

    # slug → title
    $title = $folder -replace "-", " "
    $title = (Get-Culture).TextInfo.ToTitleCase($title)

    $html = Get-Content $index -Raw

    # Replace only the game title div
    $html = $html -replace '<div class="hSBT7NJmqCF0UOqGFDLA">.*?</div>', "<div class=`"hSBT7NJmqCF0UOqGFDLA`">$title</div>"

    Set-Content $index $html -Encoding UTF8
}
