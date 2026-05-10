# ================================
# AUTO FAQ SCHEMA GENERATOR
# ================================

# ROOT FOLDER
$rootPath = "D:\a unblockedgames.free new design\g"

# UTF8 WITHOUT BOM
$utf8NoBom = New-Object System.Text.UTF8Encoding $false

# FIND ALL index.html FILES
Get-ChildItem -Path $rootPath -Recurse -Filter "index.html" | ForEach-Object {

    $file = $_.FullName

    Write-Host ""
    Write-Host "====================================="
    Write-Host "Processing: $file"
    Write-Host "====================================="

    try {

        # READ FILE
        $content = Get-Content -Path $file -Raw -Encoding UTF8

        # SKIP IF FAQ SCHEMA ALREADY EXISTS
        if ($content -match '"@type"\s*:\s*"FAQPage"') {

            Write-Host "FAQ schema already exists. Skipped."
            return
        }

        # FIND FAQ SECTION
        $faqStart = $content.IndexOf("<h2>Frequently Asked Questions</h2>")

        if ($faqStart -lt 0) {

            Write-Host "No FAQ section found. Skipped."
            return
        }

        # GET FAQ CONTENT
        $faqContent = $content.Substring($faqStart)

        # MATCH FAQ QUESTIONS + ANSWERS
        $matches = [regex]::Matches(
            $faqContent,
            '<h3>(.*?)</h3>\s*<p>(.*?)</p>',
            [System.Text.RegularExpressions.RegexOptions]::Singleline
        )

        if ($matches.Count -eq 0) {

            Write-Host "No FAQ items found. Skipped."
            return
        }

        # STORE FAQ ITEMS
        $faqItems = @()

        foreach ($match in $matches) {

            $question = $match.Groups[1].Value.Trim()
            $answer = $match.Groups[2].Value.Trim()

            # REMOVE HTML TAGS
            $answer = [regex]::Replace($answer, '<.*?>', '')

            # DECODE HTML ENTITIES
            $answer = [System.Net.WebUtility]::HtmlDecode($answer)

            # CLEAN EXTRA SPACES
            $answer = $answer -replace '\s+', ' '

            # ADD FAQ ITEM
            $faqItems += @{
                "@type" = "Question"
                "name" = $question
                "acceptedAnswer" = @{
                    "@type" = "Answer"
                    "text" = $answer
                }
            }
        }

        # CREATE FAQ SCHEMA
        $schema = @{
            "@context" = "https://schema.org"
            "@type" = "FAQPage"
            "mainEntity" = $faqItems
        }

        # CONVERT TO JSON
        $jsonSchema = $schema | ConvertTo-Json -Depth 10 -Compress

        # CREATE SCRIPT TAG
        $scriptTag = @"

<script type="application/ld+json">
$jsonSchema
</script>

"@

        # INSERT BEFORE </head>
        $updatedContent = $content -replace '</head>', "$scriptTag</head>"

        # SAVE FILE
        [System.IO.File]::WriteAllText(
            $file,
            $updatedContent,
            $utf8NoBom
        )

        Write-Host "FAQ schema added successfully."

    }
    catch {

        Write-Host "ERROR: $($_.Exception.Message)"
    }
}

Write-Host ""
Write-Host "====================================="
Write-Host "ALL FILES COMPLETED"
Write-Host "====================================="