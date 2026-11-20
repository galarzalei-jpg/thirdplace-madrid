# ThirdPlace Madrid — website

School project website for **ThirdPlace**, Madrid's private social club ("More than a club. Your second living room.").
Built from Submissions 1 and 2: brand name, prices, visual identity (Jost + Inter, night black / amber / brass / cream, violet only for gaming), navigation map and editorial style.

## Live website

**https://galarzalei-jpg.github.io/thirdplace-madrid/**

- **Hosting:** GitHub Pages (free static hosting by GitHub).
- **Why:** it's free, serves the site over HTTPS, needs no server maintenance, and updates on every `git push`. The site is plain HTML/CSS/JS with no backend, so a static host is all it needs.
- **Address:** free GitHub subdomain `galarzalei-jpg.github.io/thirdplace-madrid`. The planned domain `thirdplacemadrid.com` (Submission 2) could be pointed at it later from the Pages settings.
- **Change from Submission 2:** the site was hand-built instead of using WordPress. For a school demo this avoids paid hosting and plugin costs, while keeping every section of the navigation map, including bookings and the members area.

## Run it locally

Option A — double-click `index.html` (everything works offline except the Google Fonts).

Option B — local server:

```
powershell -ExecutionPolicy Bypass -File serve.ps1
```
then open http://localhost:8080

## Pages (navigation map)

| Page | What works |
|---|---|
| `index.html` Home | Hero, zones, private rooms feature, memberships, next 3 events, CTAs |
| `club.html` The Club | Lounge & bar, gaming zone (violet), games & sports, food & drinks menu |
| `rooms.html` Private Rooms | Room types, prices, room service menu, "Book" (members only → login / join prompt) |
| `memberships.html` | Social / Plus / Elite cards, comparison table, FAQ |
| `events.html` | Calendar with filters, "Save my spot" for members (Elite-only events enforced) |
| `merch.html` + `cart.html` | Shop, sizes, cart with quantities, delivery option, demo checkout |
| `about.html` | Story of the name, address & hours, contact form, WhatsApp, blog |
| `login.html` / `join.html` | Log in, 3-step sign-up with demo payment, change membership level |
| `account.html` Members area | Membership card & benefits, book private rooms (availability, Elite 4 free hours + 20% off), weekend spot (Plus/Elite), invite guests (free passes per tier), my bookings with cancel, merch orders, profile, log out, cancel membership |

ES / EN language switch in the header on every page.

## Demo accounts

Password for all: `thirdplace`

- `social@thirdplace.test` — Social (Lucía)
- `plus@thirdplace.test` — Plus (Carlos)
- `elite@thirdplace.test` — Elite (Javier)

Demo card for checkouts: `4242 4242 4242 4242`, any future expiry, any CVC.

## Notes

- No backend: accounts, bookings, cart and orders are saved in the browser's `localStorage`. To reset everything, clear the site data in your browser.
- No real payments; passwords are stored in plain text in the browser — fine for a demo, never for a real site.
- Photos are the brand images from Submission 1.
