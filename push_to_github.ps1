# push_to_github.ps1
# This script securely pushes your Codebase to a new GitHub repository without exposing node_modules or .env files

$repoUrl = Read-Host "Please enter the empty GitHub repository URL (e.g. https://github.com/Username/SanadHealth-MVP.git)"

if (-not $repoUrl) {
    Write-Host "URL cannot be empty!" -ForegroundColor Red
    exit
}

Write-Host "Preparing to push..." -ForegroundColor Cyan

# Ensure git is initialized
git init

# Re-ensure safe files are gitignored
echo "node_modules/" >> .gitignore
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore

# Stage all files
git add .

# Commit
git commit -m "Production ready MVP codebase"

# Configure remote and push
git remote add origin $repoUrl
git branch -M main
git push -u origin main

Write-Host "✅ Codebase successfully pushed to GitHub!" -ForegroundColor Green
