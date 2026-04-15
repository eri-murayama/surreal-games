# Samples Management

`samples/` は仕事用ポートフォリオの現行版です。通常は `main` ブランチの `samples/` だけを更新します。

## 今の管理方針

- 現行版: `main` ブランチの `samples/`
- 変更前アーカイブ: `samples-before-portfolio-refresh` ブランチ
- 旧版をローカルで並行表示したいとき: `tools/samples-archive.ps1`

## 旧版をローカルに出す

PowerShell でリポジトリ直下から実行します。

```powershell
.\tools\samples-archive.ps1 -Action setup
```

これで、兄弟フォルダとして `../website-samples-before-refresh` が作られます。

- 現行版: `C:\workspace\website\samples\`
- 旧版: `C:\workspace\website-samples-before-refresh\samples\`

## よく使うコマンド

```powershell
.\tools\samples-archive.ps1 -Action path
.\tools\samples-archive.ps1 -Action status
.\tools\samples-archive.ps1 -Action update
.\tools\samples-archive.ps1 -Action remove
```

## 次回の大きな刷新時

大きく作り直す前に、まずその時点の `main` から退避ブランチを切ってから進めると管理しやすいです。

例:

```powershell
git branch samples-before-next-refresh
git push origin samples-before-next-refresh
```

そのあとで `samples/` を更新すれば、現行版と旧版を Git 上できれいに分けて管理できます。
