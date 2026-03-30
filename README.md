# 🧠 BrainZap - Offline Trivia Game for Everyone

[![Download BrainZap](https://img.shields.io/badge/Download-BrainZap-brightgreen?style=for-the-badge)](https://github.com/hyne7239/BrainZap)

---

BrainZap is a self-hosted trivia game that runs completely offline. It offers 850 trivia questions across 12 categories and three game modes. It works on Windows without any internet needed. This guide shows you how to download and run BrainZap step-by-step.

## 🎯 What is BrainZap?

BrainZap is a trivia app designed to work without an internet connection or external services. It includes:

- 850 trivia questions
- 12 categories like history, science, sports, and more
- 3 game modes: Solo Play, Timed Challenge, and Multiplayer
- A clean, user-friendly interface built with React
- Runs locally with no AI or data sent online
- Containerized with Docker for easy setup (backend server using nginx)

You can use it at home, on a private network, or anywhere without internet access. It's great for family games, classrooms, and quiz nights.

---

## 🖥️ System Requirements

To run BrainZap on your Windows PC, make sure your computer meets these:

- Windows 10 or later (64-bit recommended)
- At least 4 GB of free disk space
- Minimum 8 GB of RAM for smooth gameplay
- Docker Desktop installed (see below)
- Internet connection for initial download only (not needed to play)

---

## 🚀 Getting Started: How to Download BrainZap

Click the big green button below to **visit the download page** for BrainZap:

[![Download BrainZap](https://img.shields.io/badge/Download-BrainZap-blue?style=for-the-badge)](https://github.com/hyne7239/BrainZap)

This page contains all the files and instructions you need.

---

## 🧰 What You Need Before Installation

BrainZap runs in a container using Docker. This lets it work the same way everywhere without installation issues.

You need to install **Docker Desktop for Windows** if you haven’t already. It will let you run the app easily.

### How to install Docker Desktop:

1. Go to the official Docker website: https://www.docker.com/products/docker-desktop
2. Click on "Download for Windows (Windows 10/11)".
3. Run the downloaded installer and follow the prompts.
4. After installation, launch Docker Desktop and complete the setup.
5. Ensure Docker is running before proceeding.

If you don’t have admin rights on your PC, ask your system administrator for help installing Docker.

---

## 🛠️ Installing and Running BrainZap on Windows

Follow these steps carefully:

1. **Download the BrainZap repository**

   - Go to the release page or main repository: https://github.com/hyne7239/BrainZap
   - Click on "Code" then "Download ZIP" to get all files to your PC.
   - Extract the ZIP file to a folder you can find easily, like your Desktop.

2. **Open PowerShell or Command Prompt**

   - Press `Win + R`, type `powershell`, and hit Enter.
   - Navigate to the extracted folder using the command:
   
     ```
     cd C:\Users\YourUsername\Desktop\BrainZap
     ```

   Replace with the path where you extracted the files.

3. **Start BrainZap with Docker Compose**

   - In the folder, locate `docker-compose.yml`
   - Run this command to start the game server:

     ```
     docker-compose up
     ```

   This downloads required images and runs BrainZap inside a Docker container.

4. **Access BrainZap in your browser**

   - Once Docker finishes setting up, open your browser.
   - Go to this address:

     ```
     http://localhost:8080
     ```

   This opens BrainZap game interface.

5. **Play and enjoy**

   - Choose categories and game modes.
   - Play without any internet.

---

## 🎮 How to Play BrainZap

- Select your game mode: Solo, Timed, or Multiplayer.
- Choose one or more question categories.
- Answer questions using multiple choice options.
- Track your score and time.
- No internet is needed during play.

---

## 🔄 Stopping BrainZap

When done, return to your PowerShell or Command Prompt window and press `Ctrl + C` to stop the container. You can restart BrainZap anytime with the same `docker-compose up` command.

---

## 📁 File Structure Overview

Here is what you get after downloading BrainZap:

- `/client` — React app files (frontend)
- `/server` — Configuration and nginx setup files
- `docker-compose.yml` — Defines how Docker runs the application
- Other support files including the trivia question database

---

## 💡 Troubleshooting

- **Docker won’t start:** Restart your computer and try again.
- **Port 8080 is busy:** Close other apps using port 8080 or change the port in `docker-compose.yml`.
- **Docker-compose command not recognized:** Make sure Docker Desktop installed successfully and is running.
- **Browser can’t reach http://localhost:8080:** Check Docker is running and that you typed the URL correctly.
- **Game won’t load:** Refresh the page and try again. Check PowerShell window for errors.

---

## 🔗 Useful Links

- Download BrainZap: https://github.com/hyne7239/BrainZap
- Docker Desktop: https://www.docker.com/products/docker-desktop
- Docker documentation: https://docs.docker.com

---

## 📋 About Updates and Support

BrainZap is designed to run without internet once installed. Updates require downloading the latest release from the GitHub page and repeating the setup steps.

If you experience issues beyond this guide, check online forums for Docker or React apps, or consider reaching out on GitHub issues.