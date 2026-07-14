Set-Location -LiteralPath $PSScriptRoot
$cssPath = Join-Path $PSScriptRoot 'extra.css'
if (-not (Test-Path $cssPath)) { Write-Error "extra.css not found"; exit 1 }
$cssText = Get-Content $cssPath -Raw
$selectorPattern = '(?m)^\s*\.([A-Za-z0-9_-]+)(?=[\s\{,:>\[])'
$matches = [regex]::Matches($cssText, $selectorPattern)
$selectors = $matches | ForEach-Object { $_.Groups[1].Value } | Select-Object -Unique
$htmlJsFiles = Get-ChildItem -Recurse -File -Include *.html,*.js | Select-Object -ExpandProperty FullName
$used = [System.Collections.Generic.HashSet[string]]::new()
foreach ($sel in $selectors) {
    $regex = [regex]::new('\\b' + [regex]::Escape($sel) + '\\b')
    foreach ($f in $htmlJsFiles) {
        $contents = Get-Content $f -Raw
        if ($regex.IsMatch($contents)) {
            $used.Add($sel) | Out-Null
            break
        }
    }
}
$unused = $selectors | Where-Object { -not $used.Contains($_) }
$reportPath = Join-Path $PSScriptRoot 'unused_extra_selectors.txt'
$report = @()
$report += "TOTAL $($selectors.Count)"
$report += "USED $($used.Count)"
$report += "UNUSED $($unused.Count)"
$report += '---'
$report += $unused
$report | Set-Content $reportPath -Encoding utf8
Write-Host "Report saved to $reportPath"
Write-Host "TOTAL $($selectors.Count) USED $($used.Count) UNUSED $($unused.Count)"
