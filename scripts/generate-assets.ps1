Add-Type -AssemblyName System.Drawing

$assetDir = Join-Path $PSScriptRoot "..\public\assets"
New-Item -ItemType Directory -Force -Path $assetDir | Out-Null

function New-Canvas($name) {
  $bmp = New-Object System.Drawing.Bitmap 1000, 1000
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $rect = New-Object System.Drawing.Rectangle 0, 0, 1000, 1000
  $bg = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, ([System.Drawing.Color]::FromArgb(255, 251, 252, 252)), ([System.Drawing.Color]::FromArgb(255, 222, 228, 233)), 35
  $g.FillRectangle($bg, $rect)
  $noisePen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(32, 70, 78, 86)), 2
  for ($i = 0; $i -lt 16; $i++) {
    $x = 80 + ($i * 63)
    $g.DrawLine($noisePen, $x, 0, $x - 240, 1000)
  }
  return @{ Bitmap = $bmp; Graphics = $g; Path = Join-Path $assetDir $name }
}

function Save-Canvas($canvas) {
  $canvas.Bitmap.Save($canvas.Path, [System.Drawing.Imaging.ImageFormat]::Png)
  $canvas.Graphics.Dispose()
  $canvas.Bitmap.Dispose()
}

function New-Pen([float]$width) {
  return New-Object System.Drawing.Pen -ArgumentList ([System.Drawing.Color]::FromArgb(255, 176, 186, 194)), $width
}

function Draw-Ring($g, [float]$x, [float]$y, [float]$w, [float]$h, [float]$width) {
  $pen = New-Pen $width
  $shadow = New-Object System.Drawing.Pen -ArgumentList ([System.Drawing.Color]::FromArgb(80, 96, 102, 108)), ($width + 8)
  $g.DrawEllipse($shadow, $x + 12, $y + 18, $w, $h)
  $g.DrawEllipse($pen, $x, $y, $w, $h)
  $shineWidth = [Math]::Max(5, ($width / 4))
  $shine = New-Object System.Drawing.Pen -ArgumentList ([System.Drawing.Color]::FromArgb(210, 255, 255, 255)), $shineWidth
  $g.DrawArc($shine, $x + 35, $y + 35, $w - 70, $h - 70, 205, 110)
}

function Draw-Chain($g, $offset, $scale) {
  $pen = New-Pen (18 * $scale)
  for ($i = 0; $i -lt 12; $i++) {
    $x = 110 + ($i * 66 * $scale)
    $y = 380 + [Math]::Sin($i / 1.5) * 45 + $offset
    $g.DrawEllipse($pen, $x, $y, 92 * $scale, 44 * $scale)
  }
}

function Draw-Pendant($g, $shape) {
  Draw-Chain $g -80 1
  $pen = New-Pen 18
  if ($shape -eq "heart") {
    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.AddBezier(500, 430, 410, 330, 270, 420, 500, 650)
    $path.AddBezier(500, 650, 730, 420, 590, 330, 500, 430)
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush (New-Object System.Drawing.Rectangle 250, 330, 500, 340), ([System.Drawing.Color]::FromArgb(255, 235, 239, 242)), ([System.Drawing.Color]::FromArgb(255, 150, 160, 170)), 45
    $g.FillPath($brush, $path)
    $g.DrawPath($pen, $path)
  } else {
    Draw-Ring $g 405 420 190 190 22
    $stone = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 246, 248, 250))
    $g.FillEllipse($stone, 456, 471, 88, 88)
  }
}

function Make-Asset($name, $kind, $variant) {
  $canvas = New-Canvas $name
  $g = $canvas.Graphics
  if ($kind -eq "chain") { Draw-Chain $g (20 * $variant) (0.92 + ($variant * 0.04)) }
  if ($kind -eq "pendant") { Draw-Pendant $g "stone" }
  if ($kind -eq "heart") { Draw-Pendant $g "heart" }
  if ($kind -eq "earring") { Draw-Ring $g 250 280 190 300 26; Draw-Ring $g 560 280 190 300 26 }
  if ($kind -eq "drop") { Draw-Ring $g 310 250 120 120 18; Draw-Ring $g 570 250 120 120 18; Draw-Ring $g 265 415 210 290 24; Draw-Ring $g 525 415 210 290 24 }
  if ($kind -eq "bracelet") { Draw-Chain $g 110 1.12; Draw-Ring $g 430 420 140 140 16 }
  if ($kind -eq "ring") { Draw-Ring $g 300 310 400 400 54 }
  if ($kind -eq "band") { Draw-Ring $g 310 345 380 310 62 }
  Save-Canvas $canvas
}

$items = @(
  @("corrente-1.png", "chain"), @("corrente-2.png", "chain"), @("corrente-3.png", "chain"),
  @("cartier-1.png", "chain"), @("cartier-2.png", "chain"), @("cartier-3.png", "chain"),
  @("pingente-1.png", "pendant"), @("pingente-2.png", "pendant"), @("pingente-3.png", "pendant"),
  @("coracao-1.png", "heart"), @("coracao-2.png", "heart"), @("coracao-3.png", "heart"),
  @("brinco-1.png", "earring"), @("brinco-2.png", "earring"), @("brinco-3.png", "earring"),
  @("gota-1.png", "drop"), @("gota-2.png", "drop"), @("gota-3.png", "drop"),
  @("pulseira-1.png", "bracelet"), @("pulseira-2.png", "bracelet"), @("pulseira-3.png", "bracelet"),
  @("elo-1.png", "bracelet"), @("elo-2.png", "bracelet"), @("elo-3.png", "bracelet"),
  @("anel-1.png", "ring"), @("anel-2.png", "ring"), @("anel-3.png", "ring"),
  @("alianca-1.png", "band"), @("alianca-2.png", "band"), @("alianca-3.png", "band"),
  @("combo-corrente.png", "pendant"), @("combo-pulseira.png", "bracelet"), @("combo-alianca.png", "band"),
  @("gift-box.png", "pendant")
)

for ($i = 0; $i -lt $items.Count; $i++) {
  Make-Asset $items[$i][0] $items[$i][1] (($i % 3) + 1)
}

$hero = New-Canvas "hero-prata.png"
Draw-Chain $hero.Graphics -90 1.25
Draw-Pendant $hero.Graphics "heart"
Draw-Ring $hero.Graphics 160 610 240 240 35
Draw-Ring $hero.Graphics 620 600 230 230 32
Save-Canvas $hero
