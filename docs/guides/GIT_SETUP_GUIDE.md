# Git Setup Guide for E-commerce Project

## 🚀 Quick Setup

### 1. Initialize Git Repository
```bash
git init
git add .
git commit -m "Initial commit: E-commerce project setup"
```

### 2. Add Remote Repository
```bash
git remote add origin https://github.com/yourusername/your-repo-name.git
git branch -M main
git push -u origin main
```

## 📁 Files Structure & Git Ignore

### ✅ Files INCLUDED in Git
```
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── .env.example
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── scripts/
│   ├── package.json
│   └── .env.example
├── .gitignore
├── README.md
├── SECURITY.md
└── docker-compose.yml
```

### ❌ Files EXCLUDED from Git (in .gitignore)
```
# Environment & Secrets
.env
.env.local
.env.production
backend/.env
frontend/.env.local

# Dependencies
node_modules/
package-lock.json
yarn.lock

# Logs & Uploads
backend/logs/
backend/uploads/
*.log

# Build files
build/
dist/

# OS files
.DS_Store
Thumbs.db
*.stackdump

# Cache
.cache/
.eslintcache

# Database
*.db
*.sqlite

# Security sensitive
admin-credentials.json
master-keys.json
secrets/
```

## 🔒 Security Before First Commit

### 1. Check for Sensitive Files
```bash
# Make sure these files exist and are properly configured
ls -la .gitignore
ls -la backend/.env.example
ls -la frontend/.env.example

# Make sure these files are NOT in your repo
ls -la backend/.env
ls -la frontend/.env.local
```

### 2. Verify .gitignore is Working
```bash
# Check what files will be committed
git status

# Should NOT see:
# - .env files
# - node_modules/
# - logs/
# - uploads/
# - *.log files
```

### 3. Test Environment Setup
```bash
# Copy example files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# Edit with your actual values
nano backend/.env
nano frontend/.env.local
```

## 🌟 Git Workflow

### Daily Development
```bash
# Check status
git status

# Add changes
git add .

# Commit with meaningful message
git commit -m "feat: add real-time updates to admin dashboard"

# Push to remote
git push origin main
```

### Feature Development
```bash
# Create feature branch
git checkout -b feature/admin-promotions

# Work on feature...
git add .
git commit -m "feat: implement promotion management"

# Push feature branch
git push origin feature/admin-promotions

# Create Pull Request on GitHub
# After review, merge to main
```

### Hotfix
```bash
# Create hotfix branch
git checkout -b hotfix/security-patch

# Fix issue...
git add .
git commit -m "fix: patch security vulnerability"

# Push and merge immediately
git push origin hotfix/security-patch
```

## 📋 Pre-commit Checklist

### Before Every Commit
- [ ] No `.env` files in staging area
- [ ] No `node_modules/` in staging area
- [ ] No log files in staging area
- [ ] No sensitive data in code
- [ ] Code is tested and working
- [ ] Commit message is descriptive

### Before Pushing to Production
- [ ] All tests pass
- [ ] Security scan completed
- [ ] Environment variables updated
- [ ] Database migrations ready
- [ ] Backup plan in place

## 🚨 Emergency Procedures

### If Sensitive Data Committed
```bash
# Remove file from Git history (DANGEROUS)
git filter-branch --force --index-filter \
'git rm --cached --ignore-unmatch backend/.env' \
--prune-empty --tag-name-filter cat -- --all

# Force push (WARNING: This rewrites history)
git push origin --force --all
```

### If Wrong Branch Pushed
```bash
# Revert last commit
git revert HEAD

# Or reset to previous commit (DANGEROUS)
git reset --hard HEAD~1
git push --force
```

## 🔧 Git Configuration

### Set Up User Info
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Useful Git Aliases
```bash
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.unstage 'reset HEAD --'
```

### Git Hooks (Optional)
Create `.git/hooks/pre-commit`:
```bash
#!/bin/sh
# Check for .env files
if git diff --cached --name-only | grep -E '\.(env|env\.local)$'; then
    echo "Error: .env files should not be committed!"
    exit 1
fi
```

## 📚 Git Best Practices

### Commit Messages
```bash
# Good commit messages
git commit -m "feat: add user authentication system"
git commit -m "fix: resolve payment gateway timeout issue"
git commit -m "docs: update API documentation"
git commit -m "refactor: optimize database queries"

# Bad commit messages
git commit -m "fix"
git commit -m "update"
git commit -m "changes"
```

### Branch Naming
```bash
# Feature branches
feature/user-authentication
feature/payment-integration
feature/admin-dashboard

# Bug fix branches
fix/login-validation
fix/cart-calculation
fix/email-sending

# Hotfix branches
hotfix/security-patch
hotfix/critical-bug
```

## 🔍 Troubleshooting

### Common Issues

**Issue**: `.env` file accidentally committed
```bash
# Remove from Git but keep local file
git rm --cached backend/.env
git commit -m "Remove .env from tracking"
```

**Issue**: Large files in repository
```bash
# Check repository size
git count-objects -vH

# Remove large files from history
git filter-branch --tree-filter 'rm -f large-file.zip' HEAD
```

**Issue**: Merge conflicts
```bash
# View conflicts
git status

# Edit conflicted files, then:
git add .
git commit -m "resolve merge conflicts"
```

## 📞 Support

If you encounter issues:
1. Check this guide first
2. Search GitHub issues
3. Contact the development team
4. Create a new issue with details

## 🎯 Next Steps

After setting up Git:
1. Set up CI/CD pipeline
2. Configure automated testing
3. Set up deployment scripts
4. Configure monitoring and alerts