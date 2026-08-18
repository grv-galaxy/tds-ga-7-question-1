# TDS GA7 Release Gate

This repository contains the deterministic policy endpoint for a GitHub Actions run to decide whether to promote a container image, satisfying the least-privilege CI, complete matrix testing, action pinning, and hardened Docker image requirements.

## Project Structure

- `question-1/index.js`: The Express.js API endpoint (`POST /release-gate`) evaluating the payload against the promotion rules.
- `question-1/package.json`: Project dependencies and scripts.
- `.github/workflows/main.yml`: The GitHub Actions workflow "TDS GA7 Release Gate" that tests the implementation and runs on pushes to the `main` branch.

## Running Locally

1. Navigate to the `question-1` directory:
   ```bash
   cd question-1
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```
   The server will run on port 3000 by default.

## Deployment with Cloudflare Tunnel

To expose this local server to the public internet using Cloudflare Tunnel, follow these steps:

1. **Install `cloudflared`:** Download and install the Cloudflare Tunnel daemon for your operating system.
2. **Authenticate:** Run `cloudflared tunnel login` to authenticate with your Cloudflare account.
3. **Start the Tunnel:** Assuming the server is running locally on port 3000, start the tunnel with:
   ```bash
   cloudflared tunnel --url http://localhost:3000
   ```
4. Cloudflare will provide a public HTTPS URL (e.g., `https://your-random-subdomain.trycloudflare.com`). Use this URL as the endpoint for your release gate (`POST https://your-random-subdomain.trycloudflare.com/release-gate`).

## GitHub Setup Instructions

1. Initialize a Git repository if you haven't already:
   ```bash
   git init
   ```
2. Commit all the files, including the `.github/workflows/main.yml` and the `question-1` directory.
3. Create a **public** repository on GitHub.
4. Add the remote and push your code:
   ```bash
   git remote add origin https://github.com/your-username/your-repo-name.git
   git branch -M main
   git push -u origin main
   ```
5. Navigate to the **Actions** tab in your GitHub repository. You should see the "TDS GA7 Release Gate" workflow running.
6. Once the workflow successfully completes on the `main` branch, copy the URL of the workflow page (not an individual run URL).
7. Ensure the identity step `TDS identity: 24f1000758@ds.study.iitm.ac.in` executes correctly.

Submit the workflow page URL as required for the assignment.
