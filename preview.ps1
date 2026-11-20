$ErrorActionPreference = 'Stop'
$previewRoot = $PSScriptRoot
$previewPort = 8767
$previewUrl = "http://127.0.0.1:$previewPort/"
$previewLog = Join-Path $env:TEMP 'qxgr-preview.log'
$previewErrorLog = Join-Path $env:TEMP 'qxgr-preview-error.log'
$listener = Get-NetTCPConnection -LocalPort $previewPort -State Listen -ErrorAction SilentlyContinue
if (-not $listener) {
    $pythonCommand = (Get-Command python -ErrorAction Stop).Source
    Start-Process -FilePath $pythonCommand -ArgumentList '-u','-m','http.server',"$previewPort",'--bind','127.0.0.1' -WorkingDirectory $previewRoot -WindowStyle Hidden -RedirectStandardOutput $previewLog -RedirectStandardError $previewErrorLog | Out-Null
}
$ready = $false
for ($attempt = 0; $attempt -lt 30; $attempt++) {
    try {
        $response = Invoke-WebRequest -UseBasicParsing -Uri $previewUrl -TimeoutSec 2
        if ($response.StatusCode -eq 200 -and $response.Content.Contains('js/chapters.js')) { $ready = $true; break }
    } catch { }
    Start-Sleep -Milliseconds 200
}
if (-not $ready) { throw "Preview could not start on port $previewPort. See $previewErrorLog." }
Start-Process $previewUrl
Write-Host "Game preview: $previewUrl"
