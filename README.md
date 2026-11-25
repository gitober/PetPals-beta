# PetPals Demo

A free, live demo of PetPals, a social app for pet owners.

**Try it:** https://petpals-beta.onrender.com
Click "Try as demo user". Your demo account and everything you post are deleted when you log out, or about an hour after you leave.

## About

This is an updated copy of [PetPals](https://github.com/gitober/PetPals), a full-stack school project (React, Node.js, Express, MongoDB). The original stays as it was. This copy was used to see what Claude (Pro plan) can do with an old project: fix old problems, add features and put it online as a demo that costs nothing to run.

## What was done

- Made it a public demo: one-click demo accounts that clean themselves up, a demo checklist, a thank-you page and a privacy notice
- New features: Instagram-style image frames, double-click to like, click a photo to open the profile, posts without text, a slide-in menu on small screens
- Security: 377 GitHub alerts down to 0 by cleaning up packages, updating multer and moving from Create React App to Vite
- Free hosting: Render (Frankfurt), MongoDB Atlas (Stockholm) for data and photos, and a free UptimeRobot monitor that keeps the free server awake

## How it was built with Claude

Claude worked directly in this repository from a cloud workspace, with access to this one repository only. Every change got its own branch and pull request, and I reviewed, tested and approved each merge before it went live. Claude read and wrote the code, ran commands, pushed branches, opened and merged pull requests, and looked up documentation. I installed packages on my laptop, shared Render logs and screenshots, and tested on the live site and my phone. Along the way Claude also suggested small ideas, like the heart pop-up on double-click and the pulsing demo checklist.

## Tech

React 19, Vite, React Router, Node.js, Express, MongoDB (Mongoose, GridFS), JWT

## Credits and license

Pet photos from Pexels and Pixabay. MIT License, see [LICENSE.txt](LICENSE.txt).
Privacy notice: https://petpals-beta.onrender.com/privacy
