param(
  [ValidateSet('setup', 'export', 'update', 'remove', 'path', 'status')]
  [string]$Action = 'export',

  [string]$Branch = 'samples-before-portfolio-refresh',

  [string]$TargetDir = (Join-Path (Split-Path -Parent (Resolve-Path (Join-Path $PSScriptRoot '..')).Path) 'website-samples-archive')
)

$ErrorActionPreference = 'Stop'

$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$ResolvedTarget = [System.IO.Path]::GetFullPath($TargetDir)
$ResolvedSamplesPath = Join-Path $ResolvedTarget 'samples'

function Invoke-GitRepo {
  param(
    [Parameter(Mandatory = $true)]
    [string[]]$Args
  )

  & git -C $RepoRoot @Args
  if ($LASTEXITCODE -ne 0) {
    throw "git $($Args -join ' ') failed."
  }
}

function Test-LocalBranchExists {
  & git -C $RepoRoot show-ref --verify --quiet "refs/heads/$Branch"
  return $LASTEXITCODE -eq 0
}

function Test-RemoteBranchExists {
  & git -C $RepoRoot show-ref --verify --quiet "refs/remotes/origin/$Branch"
  return $LASTEXITCODE -eq 0
}

function Resolve-ArchiveRef {
  Invoke-GitRepo @('fetch', 'origin', $Branch)

  if (Test-LocalBranchExists) {
    return $Branch
  }

  if (Test-RemoteBranchExists) {
    return "origin/$Branch"
  }

  throw "Archive branch not found: $Branch"
}

function Assert-SafeTarget {
  if ($ResolvedTarget -eq $RepoRoot) {
    throw 'Target directory cannot be the repository root.'
  }

  if ($ResolvedTarget.Length -lt 10) {
    throw "Target directory looks unsafe: $ResolvedTarget"
  }
}

function Export-SamplesOnly {
  Assert-SafeTarget

  $archiveRef = Resolve-ArchiveRef
  $zipPath = Join-Path ([System.IO.Path]::GetTempPath()) ("samples-archive-" + [System.Guid]::NewGuid().ToString() + ".zip")

  try {
    if (Test-Path $ResolvedTarget) {
      Remove-Item -LiteralPath $ResolvedTarget -Recurse -Force
    }

    New-Item -ItemType Directory -Path $ResolvedTarget | Out-Null
    Invoke-GitRepo @('archive', "--format=zip", "--output=$zipPath", $archiveRef, 'samples')
    Expand-Archive -LiteralPath $zipPath -DestinationPath $ResolvedTarget -Force
  }
  finally {
    if (Test-Path $zipPath) {
      Remove-Item -LiteralPath $zipPath -Force
    }
  }

  Write-Output "Exported samples from $archiveRef to $ResolvedSamplesPath"
}

switch ($Action) {
  'path' {
    Write-Output $ResolvedSamplesPath
    break
  }

  'status' {
    $archiveRef = Resolve-ArchiveRef
    Write-Output "Repo root: $RepoRoot"
    Write-Output "Archive branch: $Branch"
    Write-Output "Archive ref: $archiveRef"
    Write-Output "Archive directory: $ResolvedTarget"
    Write-Output "Samples path: $ResolvedSamplesPath"
    Write-Output "Export exists: $(Test-Path $ResolvedSamplesPath)"
    if (Test-Path $ResolvedSamplesPath) {
      $entries = Get-ChildItem -LiteralPath $ResolvedSamplesPath | Select-Object -ExpandProperty Name
      Write-Output "Entries: $($entries -join ', ')"
    }
    break
  }

  'setup' {
    Export-SamplesOnly
    break
  }

  'export' {
    Export-SamplesOnly
    break
  }

  'update' {
    Export-SamplesOnly
    break
  }

  'remove' {
    Assert-SafeTarget

    if (-not (Test-Path $ResolvedTarget)) {
      Write-Output "Archive export does not exist: $ResolvedTarget"
      break
    }

    Remove-Item -LiteralPath $ResolvedTarget -Recurse -Force
    Write-Output "Archive export removed: $ResolvedTarget"
    break
  }
}
