# Maniteja & Akhila Wedding Invitation

A single-page, responsive wedding invitation website built with HTML, Tailwind CSS (CDN), and vanilla JavaScript.

## Overview

This project contains a themed digital invitation with:
- Hero landing section
- Couple introduction section
- Muhurtham (date/time) section
- Venue section with embedded Google Maps
- RSVP section with interactive thank-you modal
- Scroll reveal animations and sticky navigation behavior

## Tech Stack

- HTML5
- Tailwind CSS via CDN
- Google Fonts + Material Symbols
- Vanilla JavaScript
- PowerShell static file server (`server.ps1`)

## Project Structure

- `index.html` – Main invitation page
- `assets/` – Background images and visual assets
- `server.ps1` – Local static server on `http://localhost:8080/`
- `b64.txt` – Supporting/utility content

## Run Locally (Windows PowerShell)

1. Open PowerShell in this project folder.
2. Run:

```powershell
powershell -ExecutionPolicy Bypass -File .\server.ps1
```

3. Open: http://localhost:8080/

## Notes

- The page depends on internet access for CDN resources (Tailwind, Google Fonts, Material Symbols, embedded Google Maps).
- If script execution is restricted, use the command above with `-ExecutionPolicy Bypass`.

## Customization

Edit `index.html` to update:
- Names and family details
- Muhurtham date/time
- Venue name, address, and map link/embed URL
- Invitation text and RSVP messaging
- Colors, typography, and section styling

## Deployment

### Option 1: GitHub Pages

1. Push this folder to a GitHub repository.
2. In GitHub, open **Settings → Pages**.
3. Under **Build and deployment**, choose:
	- **Source**: Deploy from a branch
	- **Branch**: `main` (or your default branch), `/ (root)`
4. Save and wait for deployment.
5. Your site will be available at:
	- `https://<your-username>.github.io/<repo-name>/`

### Option 2: Netlify

1. Go to Netlify and choose **Add new site → Deploy manually**.
2. Drag and drop this project folder (or connect your Git repo).
3. No build settings are required for this static site.
4. Netlify will provide a live URL immediately.

### Deployment Notes

- Ensure the `assets/` folder is uploaded with `index.html`.
- Keep file/folder names exactly the same (case-sensitive on some hosts).
- External resources (Tailwind CDN, Google Fonts, Google Maps) require internet access.

## License

Personal/family invitation project.