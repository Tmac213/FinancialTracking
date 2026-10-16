$langs = @('zh-CN','hi','es','fr','ar','bn','ru','pt','ur','id','de','ja','mr','te','tr','ta','vi','pa','ko')
foreach ($l in $langs) {
  $dir = "c:/Users/ahmad/Downloads/Financial Tracking/public/locales/$l"
  if (-not (Test-Path $dir)) {
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
  }
  Copy-Item -Path 'c:/Users/ahmad/Downloads/Financial Tracking/public/locales/en/common.json' -Destination "$dir/common.json" -Force
}
