Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$root = $PSScriptRoot
$dataDir = Join-Path $root 'data'
$manage = Join-Path $root 'manage-notifier.mjs'
$startCmd = Join-Path $root 'start-telegram-notifier.cmd'
$logPath = Join-Path $dataDir 'telegram-notifier.log'
$mapPath = Join-Path $dataDir 'telegram-topic-map.json'
$readmePath = Join-Path $root 'README.md'

function Invoke-NotifierStatus {
  try {
    $raw = node $manage status
    return $raw | ConvertFrom-Json
  } catch {
    return $null
  }
}

function Start-Notifier {
  Start-Process -FilePath $startCmd -WorkingDirectory $root -WindowStyle Hidden | Out-Null
  Start-Sleep -Seconds 2
}

function Stop-Notifier {
  node $manage stop | Out-Null
  Start-Sleep -Seconds 1
}

function Restart-Notifier {
  Stop-Notifier
  Start-Notifier
}

function Open-TextFile($path) {
  if (Test-Path $path) {
    Start-Process notepad.exe $path | Out-Null
  } else {
    Show-InfoBalloon 'telegram-opencode' "File not found: $path" ([System.Windows.Forms.ToolTipIcon]::Warning)
  }
}

function Show-InfoBalloon($title, $text, $icon) {
  $notifyIcon.ShowBalloonTip(3000, $title, $text, $icon)
}

function Update-TrayVisuals {
  $status = Invoke-NotifierStatus
  if ($status -and $status.running) {
    $notifyIcon.Icon = [System.Drawing.SystemIcons]::Information
    $notifyIcon.Text = ("telegram-opencode - running ({0})" -f $status.pid).Substring(0, [Math]::Min(63, ("telegram-opencode - running ({0})" -f $status.pid).Length))
    $itemStatus.Text = "Status: running ($($status.pid))"
    $itemStart.Enabled = $false
    $itemStop.Enabled = $true
    $itemRestart.Enabled = $true
  } else {
    $notifyIcon.Icon = [System.Drawing.SystemIcons]::Warning
    $notifyIcon.Text = 'telegram-opencode - stopped'
    $itemStatus.Text = 'Status: stopped'
    $itemStart.Enabled = $true
    $itemStop.Enabled = $false
    $itemRestart.Enabled = $false
  }
}

function Show-StatusBalloon {
  $status = Invoke-NotifierStatus
  if ($status -and $status.running) {
    Show-InfoBalloon 'telegram-opencode' ("Running with PID {0}`nRoot: {1}" -f $status.pid, $root) ([System.Windows.Forms.ToolTipIcon]::Info)
  } else {
    Show-InfoBalloon 'telegram-opencode' 'Notifier is stopped.' ([System.Windows.Forms.ToolTipIcon]::Warning)
  }
}

$notifyIcon = New-Object System.Windows.Forms.NotifyIcon
$notifyIcon.Text = 'telegram-opencode'
$notifyIcon.Visible = $true

$menu = New-Object System.Windows.Forms.ContextMenuStrip
$itemStatus = $menu.Items.Add('Status')
$null = $menu.Items.Add('-')
$itemStart = $menu.Items.Add('Start notifier')
$itemStop = $menu.Items.Add('Stop notifier')
$itemRestart = $menu.Items.Add('Restart notifier')
$null = $menu.Items.Add('-')
$itemOpenLog = $menu.Items.Add('Open log')
$itemOpenMap = $menu.Items.Add('Open topic map')
$itemOpenReadme = $menu.Items.Add('Open README')
$itemOpenFolder = $menu.Items.Add('Open folder')
$null = $menu.Items.Add('-')
$itemExit = $menu.Items.Add('Exit tray')
$notifyIcon.ContextMenuStrip = $menu

$itemStatus.add_Click({
  Update-TrayVisuals
  Show-StatusBalloon
})

$itemStart.add_Click({
  Start-Notifier
  Update-TrayVisuals
  Show-InfoBalloon 'telegram-opencode' 'Start requested.' ([System.Windows.Forms.ToolTipIcon]::Info)
})

$itemStop.add_Click({
  Stop-Notifier
  Update-TrayVisuals
  Show-InfoBalloon 'telegram-opencode' 'Stop requested.' ([System.Windows.Forms.ToolTipIcon]::Info)
})

$itemRestart.add_Click({
  Restart-Notifier
  Update-TrayVisuals
  Show-InfoBalloon 'telegram-opencode' 'Restart requested.' ([System.Windows.Forms.ToolTipIcon]::Info)
})

$itemOpenLog.add_Click({
  Open-TextFile $logPath
})

$itemOpenMap.add_Click({
  Open-TextFile $mapPath
})

$itemOpenReadme.add_Click({
  Open-TextFile $readmePath
})

$itemOpenFolder.add_Click({
  Start-Process explorer.exe $root | Out-Null
})

$itemExit.add_Click({
  $timer.Stop()
  $notifyIcon.Visible = $false
  $notifyIcon.Dispose()
  [System.Windows.Forms.Application]::Exit()
})

$notifyIcon.add_DoubleClick({
  Show-StatusBalloon
})

$timer = New-Object System.Windows.Forms.Timer
$timer.Interval = 5000
$timer.add_Tick({
  Update-TrayVisuals
})

Update-TrayVisuals
$initialStatus = Invoke-NotifierStatus
if (-not $initialStatus -or -not $initialStatus.running) {
  Start-Notifier
  Update-TrayVisuals
}

$timer.Start()
[System.Windows.Forms.Application]::Run()
