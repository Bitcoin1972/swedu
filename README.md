# Smart World Education — swedu.me

International Education, Innovation & Transformation Platform

## Stack
- Node.js + Express
- Vanilla HTML/CSS/JS
- Deployed on Render

## Local Development
```bash
npm install
npm run dev
```

## Environment Variables (Render)
- `EMAIL_USER` — Gmail address for contact form
- `EMAIL_PASS` — Gmail app password
- `EMAIL_TO` — Recipient email address

## Structure
```
swedu/
├── server.js          # Express server
├── package.json
├── render.yaml        # Render deployment config
└── public/
    ├── index.html     # Main page
    ├── favicon.svg
    ├── css/
    │   └── style.css
    └── js/
        └── main.js
```
