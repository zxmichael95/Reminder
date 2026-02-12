---
description: Standard git workflow for Reminder Pro project
---

# Git Workflow for Reminder Pro

To maintain a professional and stable codebase, follow these steps for every feature or bug fix:

1. **Create a Feature Branch**
   - Always create a new branch from `main` for any new work.
   - Use a descriptive name like `feature/add-reminders` or `fix/modal-styles`.
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Develop and Test**
   - Implement your changes in the feature branch.
   - Test the application locally using `npm run dev`.
   - Ensure there are no console errors or regressions.

3. **Descriptive Commits**
   - Use meaningful commit messages that explain *what* and *why*.
   ```bash
   git add .
   git commit -m "feat: implement modal for adding new reminders"
   ```

4. **Prepare for Merge**
   - Switch back to `main` and pull the latest changes.
   - Merge `main` into your feature branch to resolve any conflicts.

5. **Merge to Main**
   - Only merge to `main` once the feature is fully tested and verified.
   - Push the updated `main` branch to GitHub.
   ```bash
   git checkout main
   git merge feature/your-feature-name
   git push origin main
   ```
