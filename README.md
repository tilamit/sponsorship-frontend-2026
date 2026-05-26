# Sponsorship Web - Frontend

Angular 21 single-page app for the **Sponsorship Request Approval Workflow**. Internal staff submit sponsorship requests; managers and finance admins approve or reject them through a multi-stage chain.

> Companion to the ASP.NET Core 8 backend in [`Backend`](https://github.com/tilamit/sponsorship-backend-2026). The API documentation lives there.

---

## Table of Contents

1. [Live URLs](#1-live-urls)
2. [Tech Stack](#2-tech-stack)
3. [Prerequisites](#3-prerequisites)
4. [Quick Start](#4-quick-start)
5. [Project Structure](#5-project-structure)
6. [Workflows by Role](#6-workflows-by-role)
7. [Authentication Flow](#7-authentication-flow)
8. [Routes & Role Gating](#8-routes--role-gating)
9. [Test Accounts](#9-test-accounts)
10. [Screenshots](#10-screenshots)
11. [Build & Deploy](#11-build--deploy)
12. [Troubleshooting](#12-troubleshooting)

---

## 1. Live URLs

| Component | URL |
|---|---|
| Frontend () | `https://sponsorship-app.puter.site` |
| Backend API | `https://llcjwh3c-7225.inc1.devtunnels.ms` |
| Swagger UI | `https://llcjwh3c-7225.inc1.devtunnels.ms/swagger/index.html` |

---

## 2. Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Angular 21.2** | Standalone components, signals, typed reactive forms |
| UI Kit | **Angular Material 21.2** | Toolbar, sidenav, tables, dialogs, snackbar, datepicker |
| HTTP | `HttpClient` with `withFetch()` | Functional interceptors |
| State | **Signals** (`signal`, `computed`) | No NgRx — kept lean for assessment scope |
| Forms | Typed `FormBuilder` | `FormGroup<{ ... }>` everywhere |
| Routing | Lazy-loaded feature routes | `loadComponent` / `loadChildren` |
| Auth | JWT access token + **httpOnly refresh cookie** | Cookie set by API on `/api/auth` path |
| Build | `@angular/build` (esbuild) | Production budget: 700 kB initial |
| Testing | Vitest | (Test files not included in assessment scope) |
| Lang | TypeScript 5.9, strict mode | `noImplicitAny`, `strictNullChecks` on |

---

## 3. Prerequisites

| Tool | Version | Install |
|---|---|---|
| Node.js | **20.x LTS** (or 22.x) | https://nodejs.org/ |
| npm | 10.x (ships with Node) | — |
| Angular CLI | **21.x** | `npm i -g @angular/cli@21` |
| Backend API running | `https://localhost:7225` | See [`README.md`](https://github.com/tilamit/sponsorship-backend-2026/blob/master/README.md) |

> **HTTPS is required for local dev.** The backend issues `Secure` cookies for the refresh token; browsers reject those on plain HTTP. Trust the .NET dev cert once with:
>
> ```bash
> dotnet dev-certs https --trust
> ```

---

## 4. Quick Start

```bash
# from repo root
cd Frontend/sponsorship-web

# install dependencies (one-time, ~2 min)
npm install

# start the dev server on http://localhost:4200
npm start
```

The dev server proxies nothing — it talks directly to `https://localhost:7225` (configured in `src/environments/environment.ts`). Make sure the backend is running first.

Open `http://localhost:4200/login`, sign in as `requestor@demo.local / Demo@123` to start exploring.

---

## 5. Project Structure

```
src/app/
├── core/                       # cross-cutting singletons
│   ├── guards/
│   │   ├── auth.guard.ts       # blocks unauthenticated routes
│   │   └── role.guard.ts       # role-based access factory
│   ├── interceptors/
│   │   ├── auth.interceptor.ts # attaches access token, refreshes on 401, coalesces concurrent refreshes
│   │   └── error.interceptor.ts# centralised toast on HTTP errors
│   ├── services/
│   │   ├── auth.service.ts     # login / refresh / logout / user signal
│   │   └── token.service.ts    # signal-backed token state in localStorage
│   └── models/                 # User, Role, Auth DTOs
├── shared/
│   ├── components/
│   │   ├── status-badge/       # coloured pill for RequestStatus
│   │   └── remarks-dialog/     # approve/reject remarks prompt
│   └── pipes/
│       └── status-label.pipe.ts# enum → display label
├── features/
│   ├── auth/login/             # login page
│   ├── requests/
│   │   ├── pages/
│   │   │   ├── request-list/
│   │   │   ├── request-form/   # create + edit
│   │   │   └── request-detail/ # form view + workflow timeline
│   │   ├── services/
│   │   └── models/
│   ├── workflow/
│   │   ├── pages/
│   │   │   ├── manager-queue/
│   │   │   ├── finance-queue/
│   │   │   └── queue-base.ts   # shared state helper (non-abstract)
│   │   └── services/
│   └── admin/
│       └── pages/sponsorship-types/  # CRUD for lookup table (SystemAdmin only)
├── layout/
│   ├── auth-layout/            # shell for login screen
│   └── main-layout/            # sidenav + topbar shell
├── app.routes.ts               # top-level lazy routes + guards
└── app.config.ts               # router + http + interceptors + animations
```

---

## 6. Workflows by Role

### State Machine

```
                ┌──────────┐
                │  Draft   │  ← Requestor creates / edits
                └────┬─────┘
                     │ submit
                     ▼
        ┌─────────────────────────┐
        │ Pending Manager Approval │  ← Requestor can cancel
        └────┬────────────────┬───┘
   approve   │                │   reject
             ▼                ▼
   ┌────────────────────┐  ┌──────────┐
   │ Pending Finance    │  │ Rejected │
   │ Review             │  └──────────┘
   └────┬────────────┬──┘
approve │            │ reject
        ▼            ▼
   ┌──────────┐  ┌──────────┐
   │ Approved │  │ Rejected │
   └──────────┘  └──────────┘
```

### Requestor

1. **Submit** → "New Request" in sidenav → fills the form → saves as **Draft**.
2. **Edit** while in Draft → updates allowed.
3. **Submit for approval** from the request detail page → moves to **Pending Manager Approval**.
4. **Cancel** any time before the request is `Approved`.
5. **Track** every request in "My Requests" with a status badge and the workflow timeline.

### Manager

1. **Manager Queue** shows every request in `PendingManagerApproval`.
2. Click a row → opens the request detail.
3. **Approve** → request moves to `PendingFinanceReview`. A remarks dialog captures the optional comment.
4. **Reject** → request moves to `Rejected`. Remarks are recommended.

### Finance Admin

1. **Finance Queue** shows every request in `PendingFinanceReview`.
2. Same approve/reject UX as the manager step.
3. **Approve** → terminal `Approved` state. **Reject** → terminal `Rejected`.

### System Admin

1. Sees **All Requests** (no filter by ownership).
2. Manages the **Sponsorship Types** lookup table (create / rename / activate / deactivate).
3. Has visibility into all queues for diagnostics.

Every transition appends a row to `WorkflowHistory` on the API side. The request detail page renders that history as a timeline.

---

## 7. Authentication Flow

The app uses a **split-token model** with the refresh token in an httpOnly cookie - never in JavaScript-readable storage. This means a successful XSS cannot steal the long-lived refresh token.

### Login

```
Browser                                API
   │  POST /api/auth/login {email, pwd}    │
   ├──────────────────────────────────────▶│
   │                                        │  validate, issue tokens
   │  200 { accessToken, expiresAt, user } │  Set-Cookie: refreshToken=…;
   │  + Set-Cookie: refreshToken           │     HttpOnly; Secure; SameSite=Strict;
   │◀──────────────────────────────────────│     Path=/api/auth
   │
   │  access token + user → signal state → localStorage
```

### Authenticated Request

`auth.interceptor.ts` runs on every outgoing HTTP call:

1. **Proactive refresh** - if the access token expires within 10 s, kick off a refresh *before* sending the request.
2. **Attach** `Authorization: Bearer <accessToken>`.
3. **Send with `withCredentials: true`** so the refresh cookie is included on `/api/auth/*` calls.
4. **Reactive fallback** — if a request still comes back `401`, attempt one refresh and retry the original call.
5. **Coalesce** — concurrent 401s while a refresh is in flight queue on the same `BehaviorSubject` so we don't fire N refresh requests.

### Refresh

```
Browser                                API
   │  POST /api/auth/refresh               │
   │  (cookie sent automatically)          │
   ├──────────────────────────────────────▶│
   │                                        │  look up refresh token in DB
   │                                        │  revoke old, issue new pair
   │  200 { accessToken, expiresAt }       │  Set-Cookie: refreshToken=… (rotated)
   │◀──────────────────────────────────────│
```

If the server detects a **revoked** refresh token being reused → it revokes the whole chain for that user (theft signal) and forces re-login.

### Logout

`AuthService.logout()` is fire-and-forget by design:

```ts
logout(navigate = true): void {
  this.http.post<void>(`${this.base}/logout`, {}, { withCredentials: true })
    .subscribe({ next: () => {}, error: () => {} });
  this.tokens.clear();          // localStorage + signal
  if (navigate) this.router.navigate(['/login']);
}
```

Local cleanup happens immediately so a flaky network or already-revoked session doesn't strand the user on a protected page.

### Storage layout

| Where | What | Why |
|---|---|---|
| `localStorage['sponsorship.auth']` | access token + user profile + expiry | Survives reload; not sensitive on its own (short-lived) |
| `Cookie refreshToken` | opaque refresh token | `HttpOnly` → not readable from JS, immune to XSS exfiltration |

---

## 8. Routes & Role Gating

| Path | Loads | Guard | Visible To |
|---|---|---|---|
| `/login` | `LoginComponent` | — | Anonymous |
| `/requests` | `RequestListComponent` | `authGuard` | All authenticated |
| `/requests/new` | `RequestFormComponent` | `authGuard` | Requestor |
| `/requests/:id` | `RequestDetailComponent` | `authGuard` | All authenticated (API filters by ownership) |
| `/requests/:id/edit` | `RequestFormComponent` | `authGuard` | Requestor (owner of a Draft) |
| `/workflow/manager` | `ManagerQueueComponent` | `authGuard` | Manager, SystemAdmin |
| `/workflow/finance` | `FinanceQueueComponent` | `authGuard` | FinanceAdmin, SystemAdmin |
| `/admin/sponsorship-types` | `SponsorshipTypesComponent` | `authGuard` + `roleGuard('SystemAdmin')` | SystemAdmin |

**Sidenav is dynamic** - `MainLayoutComponent.navItems` is a `computed()` over the current user signal, so menu entries flip based on role at runtime.

---

## 9. Test Accounts

The backend seeds these on first startup:

| Email | Password | Role |
|---|---|---|
| `requestor@demo.local` | `Demo@123` | Requestor |
| `manager@demo.local` | `Demo@123` | Manager |
| `finance@demo.local` | `Demo@123` | FinanceAdmin |
| `admin@demo.local` | `Demo@123` | SystemAdmin |

> The login screen shows "Demo accounts" at the bottom, just click on them.

---

## 10. Screenshots

| File | What to capture |
|---|---|
| <img src='https://gcdnb.pbrd.co/images/JXeiYx3c4g-G.png'> | Login screen with demo accounts panel |
| <img src='https://gcdnb.pbrd.co/images/8YFf5PAiflsl.png'> | Requestor's "My Requests" list with status badges |
| <img src='https://gcdnb.pbrd.co/images/5XgolitaLijc.png'> | New request form with validation errors |
| <img src='https://gcdnb.pbrd.co/images/BmwGOzy3NKpH.png'> | Request detail with workflow timeline |
| <img src='https://gcdnb.pbrd.co/images/yo2V4F-qWoU_.png'> | Manager's pending queue |


---

## 11. Build & Deploy

### Local production build

```bash
npm run build
# output: dist/sponsorship-web/browser/
```

Initial bundle target: **≤ 700 kB warning, 1 MB error** (configured in `angular.json`).

### Project URL

1. Hosted in Puter
2. Frontend - https://sponsorship-app.puter.site

### Backend CORS

The API needs your Pages URL in its allowed origins list. In `Backend/src/Sponsorship.Api/appsettings.json`:

```json
"Cors": {
  "AllowedOrigins": [
    "http://localhost:4200",
    "https://sponsorship-app.puter.site"
  ]
}
```

---

## 12. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `NG0908: Angular requires Zone.js` | `zone.js` not imported in `main.ts` | First line of `main.ts` must be `import 'zone.js';` |
| Login succeeds but every subsequent call returns 401 | Refresh cookie blocked by browser (mixed-content) | Backend must be HTTPS. Run `dotnet dev-certs https --trust`. |
| Logout doesn't clear localStorage / no redirect | `AuthService.logout()` returns void — old call site was treating it as `Observable` | Call `this.auth.logout()` directly (no `.subscribe()`). Already fixed in `main-layout.component.ts`. |
| `ERR_CERT_AUTHORITY_INVALID` on API calls | .NET dev cert not trusted | `dotnet dev-certs https --trust` |
| CORS preflight failure | Frontend origin not in `Cors:AllowedOrigins` | Add it in backend `appsettings.json` and restart the API |
| `npm install` fails on Windows with permission errors | Antivirus or OneDrive scanning `node_modules` | Move repo outside OneDrive-synced folders, or whitelist |
| Bundle exceeds budget | Adding heavy deps (e.g., moment, lodash) | Inspect with `npm run build -- --stats-json` and `npx webpack-bundle-analyzer` |

---

## License

Built for assessment purposes. No license assigned.
