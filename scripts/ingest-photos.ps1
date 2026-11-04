Add-Type -AssemblyName System.Drawing

$srcBase = "C:\Users\nitis\OneDrive\Desktop\photography protfolio photos\pics"
$destBase = Join-Path (Get-Location) "public\photos"

Write-Host "Source directory: $srcBase"
Write-Host "Destination directory: $destBase"

# Ensure target directories exist
$targetDirs = @("intro", "ratio-16-9", "ratio-3-4", "ratio-4-3", "ratio-9-16", "ratio-1-1")
foreach ($d in $targetDirs) {
    $p = Join-Path $destBase $d
    if (-not (Test-Path $p)) {
        New-Item -ItemType Directory -Path $p -Force | Out-Null
    }
}

function Save-ResizedImage {
    param (
        [string]$sourcePath,
        [string]$destPath,
        [int]$maxDimension = 2200,
        [int]$quality = 88,
        [bool]$cropSquare = $false
    )

    if (-not (Test-Path $sourcePath)) {
        Write-Warning "Source file not found: $sourcePath"
        return
    }

    $rawBytes = [System.IO.File]::ReadAllBytes($sourcePath)
    $ms = New-Object System.IO.MemoryStream(,$rawBytes)
    $orig = [System.Drawing.Image]::FromStream($ms)

    $srcW = $orig.Width
    $srcH = $orig.Height

    if ($cropSquare) {
        $side = [Math]::Min($srcW, $srcH)
        $cropX = [int](($srcW - $side) / 2)
        $cropY = [int](($srcH - $side) * 0.3)
        if ($cropY -lt 0) { $cropY = 0 }
        if ($cropY + $side -gt $srcH) { $cropY = $srcH - $side }

        $targetW = [Math]::Min($side, $maxDimension)
        $targetH = $targetW

        $destBmp = New-Object System.Drawing.Bitmap($targetW, $targetH)
        $g = [System.Drawing.Graphics]::FromImage($destBmp)
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

        $srcRect = New-Object System.Drawing.Rectangle($cropX, $cropY, $side, $side)
        $destRect = New-Object System.Drawing.Rectangle(0, 0, $targetW, $targetH)
        $g.DrawImage($orig, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
        $g.Dispose()
    } else {
        $scale = 1.0
        if ($srcW -gt $maxDimension -or $srcH -gt $maxDimension) {
            $scale = [Math]::Min($maxDimension / $srcW, $maxDimension / $srcH)
        }
        $targetW = [int]($srcW * $scale)
        $targetH = [int]($srcH * $scale)

        $destBmp = New-Object System.Drawing.Bitmap($targetW, $targetH)
        $g = [System.Drawing.Graphics]::FromImage($destBmp)
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

        $destRect = New-Object System.Drawing.Rectangle(0, 0, $targetW, $targetH)
        $g.DrawImage($orig, $destRect, 0, 0, $srcW, $srcH, [System.Drawing.GraphicsUnit]::Pixel)
        $g.Dispose()
    }

    $orig.Dispose()
    $ms.Dispose()

    $encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
    $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
    $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]$quality)

    $destBmp.Save($destPath, $encoder, $encoderParams)
    $destBmp.Dispose()
    $encoderParams.Dispose()
}

# 1. INTRO PHOTOS (Hero Showcase)
Write-Host "`n--- Ingesting Intro Photos ---"
Save-ResizedImage (Join-Path $srcBase "intro\A3B_4111.jpg") (Join-Path $destBase "intro\photo-01.jpg") 2400 90
Save-ResizedImage (Join-Path $srcBase "intro\DSC_2730.jpg") (Join-Path $destBase "intro\photo-02.jpg") 2400 90

# 2. 16:9 HORIZONS (30 frames)
Write-Host "`n--- Ingesting 16:9 Photos (30 frames) ---"
$p169List = @("16-9\A3B_4111.jpg", "16-9\DSC_2730.jpg")
for ($i = 0; $i -lt 30; $i++) {
    $num = ($i + 1).ToString("00")
    $src = Join-Path $srcBase $p169List[$i % $p169List.Count]
    $dst = Join-Path $destBase ("ratio-16-9\photo-" + $num + ".jpg")
    if ($i -lt $p169List.Count) {
        Save-ResizedImage $src $dst 2400 90
    } else {
        $sourceNum = (($i % $p169List.Count) + 1).ToString("00")
        Copy-Item (Join-Path $destBase ("ratio-16-9\photo-" + $sourceNum + ".jpg")) $dst -Force
    }
}

# 3. 3:4 PORTRAITS (30 frames)
Write-Host "`n--- Ingesting 3:4 Portraits (30 frames) ---"
$p34List = @(
    "3-4\A3B_1643.jpg",
    "3-4\A3B_6241.jpg",
    "3-4\A3B_6702.jpg",
    "3-4\DSC_1213 (1).jpg",
    "3-4\DSC_1238.jpg",
    "3-4\DSC_5649.jpg",
    "3-4\DSC_5935.jpg",
    "3-4\DSC_6188.jpg",
    "3-4\DSC_6234 (1).jpg",
    "3-4\DSC_7207 (2) (1).jpg",
    "3-4\IMG20261017035508_01 (1).jpg"
)
for ($i = 0; $i -lt 30; $i++) {
    $num = ($i + 1).ToString("00")
    $src = Join-Path $srcBase $p34List[$i % $p34List.Count]
    $dst = Join-Path $destBase ("ratio-3-4\photo-" + $num + ".jpg")
    if ($i -lt $p34List.Count) {
        Save-ResizedImage $src $dst 2000 88
    } else {
        $sourceNum = (($i % $p34List.Count) + 1).ToString("00")
        Copy-Item (Join-Path $destBase ("ratio-3-4\photo-" + $sourceNum + ".jpg")) $dst -Force
    }
}

# 4. 4:3 CEREMONIES & VISTAS (30 frames)
Write-Host "`n--- Ingesting 4:3 Ceremonies (30 frames) ---"
$p43List = @(
    "4-3\A3B_1696.jpg",
    "4-3\A3B_4582.jpg",
    "4-3\A3B_4600.jpg",
    "4-3\A3B_4662.jpg",
    "4-3\A3B_8269.jpg",
    "4-3\DSC_1081 (2).jpg",
    "4-3\DSC_2336 (1).jpg",
    "4-3\DSC_7206 (2) (1).jpg"
)
for ($i = 0; $i -lt 30; $i++) {
    $num = ($i + 1).ToString("00")
    $src = Join-Path $srcBase $p43List[$i % $p43List.Count]
    $dst = Join-Path $destBase ("ratio-4-3\photo-" + $num + ".jpg")
    if ($i -lt $p43List.Count) {
        Save-ResizedImage $src $dst 2200 88
    } else {
        $sourceNum = (($i % $p43List.Count) + 1).ToString("00")
        Copy-Item (Join-Path $destBase ("ratio-4-3\photo-" + $sourceNum + ".jpg")) $dst -Force
    }
}

# 5. 9:16 VERTICAL STORIES (30 frames)
Write-Host "`n--- Ingesting 9:16 Vertical Stories (30 frames) ---"
$p916List = @(
    "9-16\A3B_4466.jpg",
    "9-16\DSC_2209.jpg",
    "3-4\A3B_1643.jpg",
    "3-4\DSC_1213 (1).jpg",
    "3-4\DSC_5935.jpg"
)
for ($i = 0; $i -lt 30; $i++) {
    $num = ($i + 1).ToString("00")
    $src = Join-Path $srcBase $p916List[$i % $p916List.Count]
    $dst = Join-Path $destBase ("ratio-9-16\photo-" + $num + ".jpg")
    if ($i -lt $p916List.Count) {
        Save-ResizedImage $src $dst 2000 88
    } else {
        $sourceNum = (($i % $p916List.Count) + 1).ToString("00")
        Copy-Item (Join-Path $destBase ("ratio-9-16\photo-" + $sourceNum + ".jpg")) $dst -Force
    }
}

# 6. 1:1 SQUARE MOSAIC (30 frames)
Write-Host "`n--- Generating 1:1 Square Mosaic Photos (30 frames) ---"
$sqSourceList = @(
    "4-3\A3B_1696.jpg",
    "3-4\A3B_6241.jpg",
    "3-4\DSC_1213 (1).jpg",
    "3-4\DSC_5935.jpg",
    "3-4\DSC_7207 (2) (1).jpg",
    "4-3\A3B_4582.jpg",
    "4-3\DSC_2336 (1).jpg",
    "16-9\A3B_4111.jpg"
)
for ($i = 0; $i -lt 30; $i++) {
    $num = ($i + 1).ToString("00")
    $src = Join-Path $srcBase $sqSourceList[$i % $sqSourceList.Count]
    $dst = Join-Path $destBase ("ratio-1-1\photo-" + $num + ".jpg")
    if ($i -lt $sqSourceList.Count) {
        Save-ResizedImage $src $dst 1400 90 -cropSquare $true
    } else {
        $sourceNum = (($i % $sqSourceList.Count) + 1).ToString("00")
        Copy-Item (Join-Path $destBase ("ratio-1-1\photo-" + $sourceNum + ".jpg")) $dst -Force
    }
}

Write-Host "`n=== All 150 Frames Ingested Successfully ==="
