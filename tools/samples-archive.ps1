param(
  [ValidateSet('setup', 'update', 'remove', 'path', 'status')]
  [string]$Action = 'setup',

  [string]$Branch = 'samples-before-portfolio-refresh',

  [string]$TargetDir = (Join-Path (Split-Path -Parent (Resolve-Path (Join-Path $PSScriptRoot '..')).Path) 'website-samples-before-refresh')
)

$ErrorActionPreference = 'Stop'

$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$ResolvedTarget = [System.IO.Path]::GetFullPath($TargetDir)

function Normalize-GitPath {
  param(
    [Parameter(Mandatory = $true)]
    [string]$PathValue
  )

  return ([System.IO.Path]::GetFullPath($PathValue)).Replace('\', '/')
}

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

function Invoke-GitTarget {
  param(
    [Parameter(Mandatory = $true)]
    [string[]]$Args
  )

  & git -C $ResolvedTarget @Args
  if ($LASTEXITCODE -ne 0) {
    throw "git -C `"$ResolvedTarget`" $($Args -join ' ') failed."
  }
}

function Get-WorktreeList {
  $lines = & git -C $RepoRoot worktree list --porcelain
  if ($LASTEXITCODE -ne 0) {
    throw 'git worktree list failed.'
  }
  return $lines
}

function Test-BranchExists {
  & git -C $RepoRoot show-ref --verify --quiet "refs/heads/$Branch"
  return $LASTEXITCODE -eq 0
}

function Test-WorktreeRegistered {
  $normalizedTarget = Normalize-GitPath -PathValue $ResolvedTarget

  foreach ($line in Get-WorktreeList) {
    if (-not $line.StartsWith('worktree ')) {
      continue
    }

    $worktreePath = $line.Substring(9)
    if ((Normalize-GitPath -PathValue $worktreePath) -eq $normalizedTarget) {
      return $true
    }
  }

  return $false
}

function Ensure-ArchiveBranch {
  Invoke-GitRepo @('fetch', 'origin', $Branch)

  if (-not (Test-BranchExists)) {
    Invoke-GitRepo @('branch', '--track', $Branch, "origin/$Branch")
  }
}

switch ($Action) {
  'path' {
    Write-Output $ResolvedTarget
    break
  }

  'status' {
    Write-Output "Repo root: $RepoRoot"
    Write-Output "Archive branch: $Branch"
    Write-Output "Archive path: $ResolvedTarget"
    Write-Output "Registered: $(Test-WorktreeRegistered)"
    if (Test-Path $ResolvedTarget) {
      $head = & git -C $ResolvedTarget rev-parse --short HEAD
      $branchName = & git -C $ResolvedTarget branch --show-current
      if ($LASTEXITCODE -ne 0) {
        throw 'Failed to inspect archive worktree.'
      }
      Write-Output "Checked out branch: $branchName"
      Write-Output "HEAD: $head"
    }
    break
  }

  'setup' {
    Ensure-ArchiveBranch

    if (Test-Path $ResolvedTarget) {
      if (Test-WorktreeRegistered) {
        Write-Output "Archive worktree already exists: $ResolvedTarget"
        break
      }
      throw "Target path already exists but is not registered as a git worktree: $ResolvedTarget"
    }

    Invoke-GitRepo @('worktree', 'add', $ResolvedTarget, $Branch)
    Write-Output "Archive worktree created: $ResolvedTarget"
    break
  }

  'update' {
    Ensure-ArchiveBranch

    if (-not (Test-Path $ResolvedTarget)) {
      Invoke-GitRepo @('worktree', 'add', $ResolvedTarget, $Branch)
      Write-Output "Archive worktree created: $ResolvedTarget"
      break
    }

    if (-not (Test-WorktreeRegistered)) {
      throw "Target path exists but is not registered as a git worktree: $ResolvedTarget"
    }

    Invoke-GitTarget @('fetch', 'origin', $Branch)
    Invoke-GitTarget @('checkout', $Branch)
    Invoke-GitTarget @('pull', '--ff-only', 'origin', $Branch)
    Write-Output "Archive worktree updated: $ResolvedTarget"
    break
  }

  'remove' {
    if (-not (Test-Path $ResolvedTarget)) {
      Write-Output "Archive worktree does not exist: $ResolvedTarget"
      break
    }

    Invoke-GitRepo @('worktree', 'remove', $ResolvedTarget)
    Write-Output "Archive worktree removed: $ResolvedTarget"
    break
  }
}
