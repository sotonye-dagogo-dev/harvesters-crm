$base = "c:\Users\Harvesters WebDev\Downloads\web-dev\harvesters-crm"
Set-Location $base

$paths = @(
  "components\features\reports",
  "app\leader\reports",
  "app\superadmin\reports",
  "app\api\reports",
  "lib\utils\reportFieldUtils.ts",
  "lib\utils\notificationHelpers.ts"
)

$files = @()
foreach ($p in $paths) {
  $full = Join-Path $base $p
  if (Test-Path -LiteralPath $full -PathType Container) {
    $files += Get-ChildItem -LiteralPath $full -Recurse -Include "*.ts","*.tsx" -File
  } elseif (Test-Path -LiteralPath $full -PathType Leaf) {
    $files += Get-Item -LiteralPath $full
  }
}

Write-Host "Found $($files.Count) files to search"
Write-Host "========================================="

$matchCount = 0

foreach ($file in $files) {
  $relPath = $file.FullName.Substring($base.Length + 1)
  $lines = Get-Content -LiteralPath $file.FullName
  for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    $ln = $i + 1

    # Pattern 1: type annotation ": Report" not followed by word chars
    if ($line -cmatch ':\s+Report(?![A-Za-z0-9_])') {
      Write-Host "TYPE_ANN | $relPath | L$ln | $($line.Trim())"
      $matchCount++
    }

    # Pattern 2: array type "Report[]" not preceded by word chars
    if ($line -cmatch '(?<![A-Za-z0-9_])Report\[\]') {
      Write-Host "ARR_TYPE | $relPath | L$ln | $($line.Trim())"
      $matchCount++
    }

    # Pattern 3: type cast "as Report" not followed by word chars
    if ($line -cmatch 'as\s+Report(?![A-Za-z0-9_])') {
      Write-Host "TYPECAST | $relPath | L$ln | $($line.Trim())"
      $matchCount++
    }

    # Pattern 4: generic param "<Report>" or "<Report,"
    if ($line -cmatch '<Report[>,\s]') {
      Write-Host "GENERIC  | $relPath | L$ln | $($line.Trim())"
      $matchCount++
    }
  }
}

Write-Host "========================================="
Write-Host "Total matches: $matchCount"
Write-Host "DONE"
