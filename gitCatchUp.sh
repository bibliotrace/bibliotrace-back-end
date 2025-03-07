#!/bin/bash

# Get the current branch name
current_branch=$(git rev-parse --abbrev-ref HEAD)

# Ensure we're not already on main
if [ "$current_branch" == "main" ]; then
  echo "You're already on 'main'. Please switch to a feature branch first."
  exit 1
fi

# Fetch latest changes
echo "Checking out main..."
git checkout main || { echo "Failed to checkout main"; exit 1; }

echo "Pulling latest changes..."
git pull || { echo "Failed to pull latest changes"; exit 1; }

# Switch back to the original feature branch
echo "Checking out $current_branch..."
git checkout "$current_branch" || { echo "Failed to checkout $current_branch"; exit 1; }

# Merge main into the feature branch
echo "Merging main into $current_branch..."
git merge main || { echo "Merge conflict detected. Resolve conflicts before continuing."; exit 1; }

echo "Merge successful!"