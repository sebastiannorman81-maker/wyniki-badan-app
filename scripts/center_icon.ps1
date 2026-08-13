Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\JA\.gemini\antigravity\brain\3da8b9fb-e4c5-47a8-b3a1-e1d143da0d07\icon_adaptive_centered_1786646502658.png"
$src = [System.Drawing.Image]::FromFile($srcPath)

$canvas = New-Object System.Drawing.Bitmap(1024, 1024)
$g = [System.Drawing.Graphics]::FromImage($canvas)
$g.Clear([System.Drawing.ColorTranslator]::FromHtml("#05060b"))
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

$scale = 0.68
$w = [int]($canvas.Width * $scale)
$h = [int]($canvas.Height * $scale)
$x = [int](($canvas.Width - $w) / 2)
$y = [int](($canvas.Height - $h) / 2)

$g.DrawImage($src, $x, $y, $w, $h)

$destDir = "C:\Users\JA\Desktop\LOS\wyniki-badan-app\assets"
$canvas.Save("$destDir\icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
$canvas.Save("$destDir\android-icon-foreground.png", [System.Drawing.Imaging.ImageFormat]::Png)
$canvas.Save("$destDir\splash-icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
$canvas.Save("$destDir\favicon.png", [System.Drawing.Imaging.ImageFormat]::Png)

$g.Dispose()
$canvas.Dispose()
$src.Dispose()
Write-Host "Icon centered successfully with 68% safe area scale!"
