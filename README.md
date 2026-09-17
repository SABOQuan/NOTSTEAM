# NOTSTEAM

A full-stack digital game store — browse a game catalog, buy games, build a personal library,
wishlist, review, and unlock achievements. Django REST API backend, React/Vite frontend.

## Features

- Game catalog with genres and tags
- User accounts, personal game library, and wishlist
- Reviews and an achievements system
- Checkout with Stripe and 2Checkout (Verifone) payment integration
- Game cover/media storage via Cloudinary

## Tech stack

**Backend:** Django 5 + Django REST Framework, PostgreSQL (via [Neon](https://neon.tech), SQLite
for local dev), token authentication, `django-cors-headers`, Cloudinary for media storage.

**Frontend:** React + Vite, React Router, Axios, Stripe.js.

**Deploy:** backend on [Render](https://render.com) (see `render.yaml`), frontend on
[Netlify](https://netlify.com) (see `frontend/netlify.toml`).

## Running locally

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create `backend/.env` with at least:

```
SECRET_KEY=your-django-secret-key
DEBUG=True
```

(`DATABASE_URL`, `CLOUDINARY_*`, and `STRIPE_*` are optional for local dev — the app falls back to
SQLite and disables the integrations they'd otherwise power.)

```bash
python manage.py migrate
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## License

MIT — see [`LICENSE`](./LICENSE).
