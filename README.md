# rideAlong

Metered ride-hailing for Addis Ababa. Riders book a trip, see the fare, and track the car. Drivers go online, accept jobs, and the in-car meter software posts live fare and distance into the trip.

![rideAlong](public/img/logo-lockup.jpg)

## Stack

- Node.js, Express, Pug
- MongoDB / Mongoose
- JWT cookies
- Sass + Parcel (client JS)
- Leaflet + Carto tiles, Photon geocoding, OSRM routing with a local fallback

## Run locally

```bash
npm install
cp config.env.example config.env   # if you keep a template; otherwise fill config.env
npm run compile:sass
npm run build:js
npm start
```

App: `http://127.0.0.1:3000`

## What works

| Who | Flow |
|---|---|
| Rider | Sign up / log in, dashboard, book, confirm, live tracking |
| Rider | History, wallet top-up, profile, saved places |
| Driver | `/driver` home, go online, accept / decline, trip status |
| Driver | Earnings with a 15% platform commission display |
| Car meter | `POST /api/v1/trip/:id/meter` with fare, km, waiting time, GPS |

## Main routes

- `/` homepage
- `/login` `/register`
- `/dashboard` `/booking` `/tracking/:id`
- `/history` `/wallet` `/profile`
- `/driver` `/earnings`

API lives under `/api/v1/user` and `/api/v1/trip`.

## Config

Set these in `config.env` (never commit that file):

- `DATABASE` `DATABASE_PASSWORD`
- `JWTSECRET` `JWTEXPIRESIN`
- `PORT`
- `BASE_FARE_*` `FARE_PER_KILOMETER_*` `FARE_PER_MINUTE_*` for standard / comfort / premium
- `SEARCH_RADIUS_METERS` `MAX_NEARBY_DRIVERS`
- Email keys if you send welcome / reset mail

## Scripts

```bash
npm start              # nodemon
npm run compile:sass
npm run build:js
npm run watch:css
npm run watch:js
```

## Demo seed data

```bash
node dev-data/import-dev-data.js --import
```

`--import` replaces seed accounts only (not other users in the database). Password for every seed account is `password123`.

| Role | Email | What to check |
|---|---|---|
| Rider | `sarah.johnson@email.com` | Dashboard, book, history, wallet |
| Rider | `dawit.bekele@email.com` | Wallet-funded passenger |
| Driver | `addis.alemayehu@email.com` | Available near Bole |
| Driver | `yohannes.driver@email.com` | On a live trip with meter pings |
| Driver | `yonas.driver@email.com` | On break |
| Driver | `abebe.driver@email.com` | Offline |

Seeded trips cover requested, accepted, arrived, picked up, completed, and cancelled so dashboard, history, tracking, earnings, and the in-car meter path all have data.

## License

ISC
