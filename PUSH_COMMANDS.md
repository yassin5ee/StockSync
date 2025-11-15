# Quick Push Commands

After creating your GitHub repository, run these commands:

## Option 1: HTTPS (Easier)

```bash
# Add your GitHub repository as remote (replace YOUR_USERNAME and YOUR_REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

## Option 2: SSH (If you have SSH keys set up)

```bash
# Add your GitHub repository as remote (replace YOUR_USERNAME and YOUR_REPO_NAME)
git remote add origin git@github.com:YOUR_USERNAME/YOUR_REPO_NAME.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

## Example:

If your GitHub username is `john` and repository name is `StockSync`:

```bash
git remote add origin https://github.com/john/StockSync.git
git branch -M main
git push -u origin main
```

## If you get authentication errors:

1. **HTTPS**: GitHub may ask for username and password
   - Username: Your GitHub username
   - Password: Use a Personal Access Token (not your GitHub password)
   - Create token: https://github.com/settings/tokens

2. **SSH**: Make sure your SSH key is added to GitHub
   - Check: https://github.com/settings/keys

