# PPDC Admin Backend Endpoint Structure

This document is a backend-facing API structure derived from the current admin UI in [src/app](src/app), [src/components/auth](src/components/auth), [src/components/dashboard/layout](src/components/dashboard/layout), [src/components/dashboard/components](src/components/dashboard/components), and [src/components/dashboard/country-pages](src/components/dashboard/country-pages).

## 1. Scope covered by the current admin UI

### Auth pages
- `/login`
- `/forgot-password`
- `/otp`
- `/reset-password`

### Dashboard pages
- `/dashboard`
- `/dashboard/users`
- `/dashboard/security`
- `/dashboard/settings`

### Country content pages
#### United Kingdom
- `/dashboard/content/uk?section=blogs`
- `/dashboard/content/uk?section=updates`
- `/dashboard/content/uk?section=programs`
- `/dashboard/content/uk?section=careers`
- `/dashboard/content/uk?section=contact`

#### United States
- `/dashboard/content/us?section=blogs`
- `/dashboard/content/us?section=updates`
- `/dashboard/content/us?section=programs`
- `/dashboard/content/us?section=careers`
- `/dashboard/content/us?section=contact`

#### Nigeria
- `/dashboard/content/nigeria?section=blogs`
- `/dashboard/content/nigeria?section=updates`
- `/dashboard/content/nigeria?section=programs`
- `/dashboard/content/nigeria?section=careers`
- `/dashboard/content/nigeria?section=contact`
- `/dashboard/content/nigeria?section=hero`
- `/dashboard/content/nigeria?section=resources`

---

## 2. Recommended API base structure

Use two API namespaces:

### Admin API namespace
- `GET /api/admin/...`
- `POST /api/admin/...`
- `PATCH /api/admin/...`
- `DELETE /api/admin/...`

### Public website API namespace
- `GET /api/public/:country/...`
- `POST /api/public/:country/contact`

### Recommended shared conventions
- All admin endpoints require authentication except login / forgot-password / OTP / reset-password.
- All public website endpoints are unauthenticated.
- Public website endpoints must never expose draft, archived, internal, or admin-only data.
- Public website detail endpoints should use `slug` instead of internal admin IDs wherever possible.
- Public website endpoints should be read-only except public contact submission.
- Public contact submission must be protected with rate limiting, spam filtering, and CAPTCHA or bot protection.
- All list endpoints should support:
  - `page`
  - `limit`
  - `search`
  - `sortBy`
  - `sortOrder`
- All timestamps should be ISO 8601 UTC.
- All paginated responses should use one format.
- All errors should use one format.

### Standard paginated response
```json
{
  "data": [],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 0,
    "totalPages": 0
  }
}
```

### Standard error response
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "field": ["This field is required"]
    }
  }
}
```

---

## 3. Authentication endpoints

These come from the auth flow in [src/components/auth/LoginForm.tsx](src/components/auth/LoginForm.tsx), [src/components/auth/ForgotPasswordForm.tsx](src/components/auth/ForgotPasswordForm.tsx), [src/components/auth/OTPForm.tsx](src/components/auth/OTPForm.tsx), and [src/components/auth/ResetPasswordForm.tsx](src/components/auth/ResetPasswordForm.tsx).

### 3.1 Login
**POST** `/api/admin/auth/login`

#### Request
```json
{
  "email": "admin@ppdc.org",
  "password": "string"
}
```

#### Response
```json
{
  "user": {
    "id": "usr_123",
    "name": "Admin User",
    "email": "admin@ppdc.org",
    "role": "super_admin",
    "managedRegions": ["all"]
  },
  "accessToken": "jwt",
  "refreshToken": "jwt",
  "expiresIn": 3600
}
```

  ---

  ## 4. Security model across admin and public APIs

  ### 4.1 Admin API security rules
  - All `/api/admin/*` routes are protected by JWT bearer authentication except:
    - `/api/admin/auth/login`
    - `/api/admin/auth/forgot-password`
    - `/api/admin/auth/verify-otp`
    - `/api/admin/auth/resend-otp`
    - `/api/admin/auth/reset-password`
    - `/api/admin/auth/refresh`
  - Every authenticated admin request must validate:
    - access token validity
    - user `isActive`
    - user role
    - user `managedRegions`

  ### 4.2 Public API security rules
  - All `/api/public/*` routes are public and do not require authentication.
  - Public APIs must only return `published` content.
  - Public APIs must not expose:
    - internal IDs if not needed
    - audit fields not meant for the website
    - admin notes
    - unpublished records
    - security-sensitive settings

  ### 4.3 Public write access rule
  The only public write endpoint recommended in this system is:
  - `POST /api/public/:country/contact`

  That endpoint must have:
  - rate limiting
  - CAPTCHA or bot protection
  - payload validation
  - spam detection or queue moderation
  - request logging

  ---

  ## 5. Dashboard overview endpoints
**GET** `/api/admin/auth/me`

Used for the topbar/sidebar profile block and route protection.

#### Response
```json
{
  "id": "usr_123",
  "name": "Admin User",
  "email": "admin@ppdc.org",
  "role": "super_admin",
  "managedRegions": ["all"],
  "isActive": true
}
```

### 3.3 Refresh session
**POST** `/api/admin/auth/refresh`

#### Request
```json
{
  "refreshToken": "jwt"
}
```

### 3.4 Logout
**POST** `/api/admin/auth/logout`

#### Request
```json
{
  "refreshToken": "jwt"
}
```

### 3.5 Forgot password
**POST** `/api/admin/auth/forgot-password`

#### Request
```json
{
  "email": "admin@ppdc.org"
}
```

#### Response
```json
{
  "message": "OTP sent",
  "resetRequestId": "rst_123"
}
```

### 3.6 Verify OTP
**POST** `/api/admin/auth/verify-otp`

#### Request
```json
{
  "resetRequestId": "rst_123",
  "otp": "123456"
}
```

#### Response
```json
{
  "message": "OTP verified",
  "resetToken": "reset_token_value"
}
```

### 3.7 Resend OTP
**POST** `/api/admin/auth/resend-otp`

#### Request
```json
{
  "resetRequestId": "rst_123"
}
```

### 3.8 Reset password
**POST** `/api/admin/auth/reset-password`

#### Request
```json
{
  "resetToken": "reset_token_value",
  "password": "new-password",
  "confirmPassword": "new-password"
}
```

---

## 4. Dashboard overview endpoints

This comes from [src/app/(dashboard)/dashboard/page.tsx](src/app/(dashboard)/dashboard/page.tsx) and [src/components/dashboard/components/RecentActivity.tsx](src/components/dashboard/components/RecentActivity.tsx).

The UI switches between:
- `all`
- `nigeria`
- `uk`
- `us`

### 4.1 Dashboard overview
**GET** `/api/admin/dashboard/overview?country=all|nigeria|uk|us`

#### Response
```json
{
  "country": "all",
  "stats": {
    "totalBlogPosts": 1240,
    "publicationCount": 856,
    "activePrograms": 24
  },
  "recentActivity": [
    {
      "id": "act_1",
      "type": "content",
      "title": "New Article Published",
      "description": "Tech Trends 2024 has been published to the Nigeria platform.",
      "timeLabel": "2 hours ago",
      "createdAt": "2026-03-30T09:00:00Z"
    }
  ]
}
```

### 4.2 Optional split endpoints
If backend prefers smaller endpoints:
- `GET /api/admin/dashboard/stats?country=...`
- `GET /api/admin/dashboard/recent-activity?country=...&page=1&limit=10`

---

## 6. User management endpoints

This comes from [src/app/(dashboard)/dashboard/users/page.tsx](src/app/(dashboard)/dashboard/users/page.tsx) and [src/components/dashboard/components/UserTable.tsx](src/components/dashboard/components/UserTable.tsx).

### UI actions that backend must support
- list users
- search users by name/email/region
- create user
- edit user
- activate/deactivate user
- delete user

### User object expected by UI
```json
{
  "id": "usr_123",
  "name": "Oluchi Adebayo",
  "email": "oluchi.a@ppdc.org",
  "managedRegions": ["all"],
  "createdAt": "2026-03-17T00:00:00Z",
  "isActive": true
}
```

### Managed region values
Recommended stored values:
- `all`
- `uk`
- `us`
- `nigeria`

Frontend can map them to labels:
- `all` => `All Platforms`
- `uk` => `United Kingdom`
- `us` => `United States`
- `nigeria` => `Nigeria`

### 5.1 List users
**GET** `/api/admin/users?page=1&limit=10&search=&region=all|uk|us|nigeria|`

#### Response
```json
{
  "data": [
    {
      "id": "usr_123",
      "name": "Oluchi Adebayo",
      "email": "oluchi.a@ppdc.org",
      "managedRegions": ["all"],
      "createdAt": "2026-03-17T00:00:00Z",
      "isActive": true
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

### 5.2 Create user
**POST** `/api/admin/users`

#### Request
```json
{
  "name": "Full Name",
  "email": "name@ppdc.org",
  "managedRegions": ["uk", "us"]
}
```

### 5.3 Get single user
**GET** `/api/admin/users/:userId`

### 5.4 Update user
**PATCH** `/api/admin/users/:userId`

#### Request
```json
{
  "name": "Updated Name",
  "email": "updated@ppdc.org",
  "managedRegions": ["nigeria"]
}
```

### 5.5 Toggle active status
**PATCH** `/api/admin/users/:userId/status`

#### Request
```json
{
  "isActive": false
}
```

### 5.6 Delete user
**DELETE** `/api/admin/users/:userId`

---

## 7. Security and audit endpoints

This comes from [src/app/(dashboard)/dashboard/security/page.tsx](src/app/(dashboard)/dashboard/security/page.tsx) and [src/components/dashboard/components/SecurityLogs.tsx](src/components/dashboard/components/SecurityLogs.tsx).

### UI needs
- security summary cards
- searchable security event feed
- export CSV

### 6.1 Security summary
**GET** `/api/admin/security/summary`

#### Response
```json
{
  "twoFactorAuth": {
    "enabled": true,
    "label": "Enabled"
  },
  "activeSessions": {
    "count": 4,
    "label": "4 Global"
  },
  "unusualAttempts": {
    "count": 2,
    "label": "2 (Filtered)"
  }
}
```

### 6.2 List security logs
**GET** `/api/admin/security/logs?page=1&limit=20&search=`

#### Response item
```json
{
  "id": "log_1",
  "event": "Login Successful",
  "user": "oluchi.adebayo@ppdc.org",
  "location": "Lagos, Nigeria",
  "ip": "192.168.1.45",
  "status": "safe",
  "createdAt": "2026-03-30T12:00:00Z",
  "timeLabel": "Just now"
}
```

### Status enum
- `safe`
- `warning`
- `danger`

### 6.3 Export audit log
**GET** `/api/admin/security/logs/export?format=csv&search=`

#### Response
- file download
- content type: `text/csv`

---

## 8. Settings endpoints

This comes from [src/app/(dashboard)/dashboard/settings/page.tsx](src/app/(dashboard)/dashboard/settings/page.tsx) and [src/components/dashboard/components/SettingsForm.tsx](src/components/dashboard/components/SettingsForm.tsx).

### UI sections
- general platform config
- notifications & alerts
- API & external integrations

### 7.1 Get settings
**GET** `/api/admin/settings`

#### Response
```json
{
  "general": {
    "siteName": "PPDC Global Platforms",
    "primaryContactEmail": "info@ppdc.org",
    "platformStatus": "online",
    "maintenanceContactEmail": "tech-support@ppdc.org"
  },
  "notifications": {
    "criticalSystemAlerts": true,
    "newContentPublishing": true,
    "weeklyImpactReport": true
  },
  "integrations": {
    "apiKeyMasked": "pk_live_************************4a23",
    "webhookSecretMasked": "sh_whsec_************************f821"
  }
}
```

### 7.2 Update settings
**PATCH** `/api/admin/settings`

#### Request
```json
{
  "general": {
    "siteName": "PPDC Global Platforms",
    "primaryContactEmail": "info@ppdc.org",
    "platformStatus": "online",
    "maintenanceContactEmail": "tech-support@ppdc.org"
  },
  "notifications": {
    "criticalSystemAlerts": true,
    "newContentPublishing": true,
    "weeklyImpactReport": false
  }
}
```

### 7.3 Get integration key metadata
**GET** `/api/admin/settings/integrations`

### 7.4 Rotate API key
**POST** `/api/admin/settings/integrations/api-key/rotate`

### 7.5 Rotate webhook secret
**POST** `/api/admin/settings/integrations/webhook-secret/rotate`

---

## 9. Country content management: shared pattern

This comes from:
- [src/components/dashboard/country-pages/uk](src/components/dashboard/country-pages/uk)
- [src/components/dashboard/country-pages/us](src/components/dashboard/country-pages/us)
- [src/components/dashboard/country-pages/nigeria](src/components/dashboard/country-pages/nigeria)

## 8.1 Recommended route pattern
Use one consistent path format:

- `GET /api/admin/content/:country/:resource`
- `POST /api/admin/content/:country/:resource`
- `GET /api/admin/content/:country/:resource/:id`
- `PATCH /api/admin/content/:country/:resource/:id`
- `DELETE /api/admin/content/:country/:resource/:id`

### Country values
- `uk`
- `us`
- `nigeria`

### Resource values
- `blogs`
- `updates`
- `programs`
- `careers`
- `contacts`
- `hero-contents` (Nigeria only)
- `resources` (Nigeria only)

---

## 10. Country/resource matrix

| Country | Blogs | Updates | Programs | Careers | Contacts | Hero Contents | Resources |
|---|---:|---:|---:|---:|---:|---:|---:|
| UK | yes | yes | yes | yes | yes | no | no |
| US | yes | yes | yes | yes | yes | no | no |
| Nigeria | yes | yes | yes | yes | yes | yes | yes |

---

## 11. Shared content item contract for blogs, updates, programs, careers, hero contents, resources

The create/edit forms across UK, US, and Nigeria are structurally the same.

### 10.1 Base content item shape
```json
{
  "id": "cnt_123",
  "country": "uk",
  "resource": "blogs",
  "title": "UK Transparency in Public Procurement",
  "slug": "uk-transparency-in-public-procurement",
  "type": "News",
  "category": "Governance",
  "tags": ["transparency", "uk", "reforms"],
  "summary": "Short summary shown in lists and previews",
  "description": "Optional short description for table row",
  "imageUrl": "https://cdn.example.com/image.jpg",
  "author": "Admin User",
  "publishDate": "2026-03-30",
  "readingTime": "6 min read",
  "content": "<p>Rich text html</p>",
  "status": "published",
  "createdAt": "2026-03-30T12:00:00Z",
  "updatedAt": "2026-03-30T12:30:00Z"
}
```

### 10.2 Notes on fields from the UI
The current UI directly exposes these editable fields:
- `title`
- `slug`
- `type`
- `category`
- `tags`
- `summary`
- `imageUrl`
- `author`
- `publishDate`
- `readingTime`
- `content`

### 10.3 Recommended enums
#### `status`
- `draft`
- `published`
- `archived`

Even though the current UI does not expose status yet, backend should keep it because the dashboard speaks in terms of published content.

---

## 12. Shared content endpoints

### 11.1 List content items
**GET** `/api/admin/content/:country/:resource?page=1&limit=10&search=&category=&type=&status=`

#### Response
```json
{
  "data": [
    {
      "id": "cnt_123",
      "country": "uk",
      "resource": "blogs",
      "title": "UK Transparency in Public Procurement",
      "slug": "uk-transparency-in-public-procurement",
      "summary": "A practical guide on improving procurement transparency across local councils.",
      "description": "A practical guide on improving procurement transparency across local councils.",
      "imageUrl": "https://cdn.example.com/image.jpg",
      "author": "Admin User",
      "publishDate": "2026-03-30",
      "readingTime": "6 min read",
      "status": "published",
      "createdAt": "2026-03-30T12:00:00Z",
      "updatedAt": "2026-03-30T12:30:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

### 11.2 Create content item
**POST** `/api/admin/content/:country/:resource`

#### Request
```json
{
  "title": "New title",
  "slug": "new-title",
  "type": "General",
  "category": "Governance",
  "tags": ["tag-one", "tag-two"],
  "summary": "Concise summary",
  "description": "Optional short description",
  "imageUrl": "https://cdn.example.com/image.jpg",
  "author": "Admin User",
  "publishDate": "2026-03-30",
  "readingTime": "6 min read",
  "content": "<p>Full rich text html</p>",
  "status": "published"
}
```

### 11.3 Get single content item
**GET** `/api/admin/content/:country/:resource/:id`

### 11.4 Update content item
**PATCH** `/api/admin/content/:country/:resource/:id`

Same request shape as create, but partial.

### 11.5 Delete content item
**DELETE** `/api/admin/content/:country/:resource/:id`

---

## 13. Contacts endpoints by country

This comes from [src/components/dashboard/components/ContactSubmissionsManager.tsx](src/components/dashboard/components/ContactSubmissionsManager.tsx), plus the country-specific wrappers in the UK, US, and Nigeria folders.

### Contact object expected by UI
```json
{
  "id": "msg_123",
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Subject here",
  "message": "Full message body",
  "createdAt": "2026-03-13T09:00:00Z",
  "status": "new"
}
```

### Contact status enum
- `new`
- `acknowledged`

### 12.1 List contacts
**GET** `/api/admin/content/:country/contacts?page=1&limit=20&search=&status=new|acknowledged|`

#### Response
```json
{
  "data": [
    {
      "id": "msg_123",
      "name": "Chinelo Okafor",
      "email": "chinelo.okafor@example.ng",
      "subject": "Community Training Request",
      "message": "Please can your team support our local accountability group with a procurement monitoring workshop?",
      "createdAt": "2026-03-13T09:00:00Z",
      "status": "new"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

### 12.2 Get single contact submission
**GET** `/api/admin/content/:country/contacts/:id`

### 12.3 Update contact status
**PATCH** `/api/admin/content/:country/contacts/:id/status`

#### Request
```json
{
  "status": "acknowledged"
}
```

### 12.4 Delete contact submission
**DELETE** `/api/admin/content/:country/contacts/:id`

---

## 14. Recommended scalable backend folder structure

For this project, the best approach is a **hybrid structure**:

- keep **global admin concerns** in shared top-level modules
- keep **country-specific content concerns** inside a `content` module
- avoid making `uk`, `us`, and `nigeria` the top-level structure for the entire backend

This is the best balance for:
- scaling cleanly
- reducing duplicate code
- making the codebase easy for another developer to manage
- matching the current admin UI navigation

### 14.1 Recommended approach

#### Keep these as global modules
- `auth`
- `dashboard`
- `users`
- `security`
- `settings`

#### Keep these under a shared `content` module
- `uk`
- `us`
- `nigeria`

This means the backend can still expose country routes like:
- `/api/admin/content/uk/blogs`
- `/api/admin/content/us/blogs`
- `/api/admin/content/nigeria/blogs`

But internally, the app is not forced to duplicate all non-content logic by country.

### 14.2 Why this is the best approach

#### Why not make `uk`, `us`, and `nigeria` the full top-level backend split?
That would make the backend harder to maintain over time because these areas are **not country-specific**:
- auth
- users
- settings
- security
- dashboard

If those are split by country, another developer will usually face:
- duplicated controllers
- duplicated validation
- duplicated auth and permission logic
- harder onboarding
- more work when adding a new country later

#### Why a hybrid structure works better
This project already has a clear split:
- shared admin operations
- country-scoped content management

So the cleanest backend design is:
- one shared admin platform layer
- one country-based content layer

That keeps the country separation where it is useful, but keeps shared logic reusable.

### 14.3 Recommended backend directory example

```text
src/
  modules/
    auth/
      auth.controller.ts
      auth.service.ts
      auth.routes.ts

    dashboard/
      dashboard.controller.ts
      dashboard.service.ts
      dashboard.routes.ts

    users/
      users.controller.ts
      users.service.ts
      users.routes.ts

    security/
      security.controller.ts
      security.service.ts
      security.routes.ts

    settings/
      settings.controller.ts
      settings.service.ts
      settings.routes.ts

    content/
      shared/
        content.types.ts
        content.validation.ts
        content.repository.ts
        base-content.service.ts
        base-content.controller.ts

      uk/
        blogs/
          uk-blogs.routes.ts
          uk-blogs.controller.ts
          uk-blogs.service.ts
        updates/
          uk-updates.routes.ts
          uk-updates.controller.ts
          uk-updates.service.ts
        programs/
          uk-programs.routes.ts
          uk-programs.controller.ts
          uk-programs.service.ts
        careers/
          uk-careers.routes.ts
          uk-careers.controller.ts
          uk-careers.service.ts
        contacts/
          uk-contacts.routes.ts
          uk-contacts.controller.ts
          uk-contacts.service.ts

      us/
        blogs/
        updates/
        programs/
        careers/
        contacts/

      nigeria/
        blogs/
        updates/
        programs/
        careers/
        contacts/
        hero-contents/
        resources/
```

### 14.4 Practical rule for implementation

Use this rule:

- if the logic is the same across countries, keep it in `content/shared`
- if the route/resource is country-specific, keep only the thin country-specific layer in that country folder
- if Nigeria has extra resources like `hero-contents` and `resources`, implement those only under `nigeria`

### 14.5 Best engineering pattern for scale

Another developer will manage this more easily if the backend follows this pattern:

#### Shared pieces
- request validation
- DTO/schema definitions
- repository/data access logic
- pagination helpers
- search/filter helpers
- permissions middleware
- audit logging

#### Country-specific pieces
- route registration
- resource mapping
- any country-only rules
- Nigeria-only resources

This gives you:
- clean API URLs
- low duplication
- easier testing
- easier onboarding for new developers
- easier future expansion if a fourth country is added

### 14.6 Final architecture recommendation

**Recommended:**

- keep API URLs country-based for content
- keep backend folders country-based only inside the `content` module
- keep all shared admin modules outside country folders
- keep shared CRUD and validation logic reusable in `content/shared`

**Not recommended:**

- putting the entire backend under top-level folders like `uk/`, `us/`, `nigeria/`

That would work at first, but it will scale worse and create unnecessary duplication.

---

## 15. Exact endpoint groups by page

This section is the quickest version a backend dev can work from.

### 15.1 Login / password reset pages
- `POST /api/admin/auth/login`
- `GET /api/admin/auth/me`
- `POST /api/admin/auth/refresh`
- `POST /api/admin/auth/logout`
- `POST /api/admin/auth/forgot-password`
- `POST /api/admin/auth/verify-otp`
- `POST /api/admin/auth/resend-otp`
- `POST /api/admin/auth/reset-password`

### 15.2 Dashboard overview page
- `GET /api/admin/dashboard/overview?country=all|uk|us|nigeria`

### 15.3 User management page
- `GET /api/admin/users`
- `POST /api/admin/users`
- `GET /api/admin/users/:userId`
- `PATCH /api/admin/users/:userId`
- `PATCH /api/admin/users/:userId/status`
- `DELETE /api/admin/users/:userId`

### 15.4 Security page
- `GET /api/admin/security/summary`
- `GET /api/admin/security/logs`
- `GET /api/admin/security/logs/export?format=csv`

### 15.5 Settings page
- `GET /api/admin/settings`
- `PATCH /api/admin/settings`
- `GET /api/admin/settings/integrations`
- `POST /api/admin/settings/integrations/api-key/rotate`
- `POST /api/admin/settings/integrations/webhook-secret/rotate`

### 15.6 UK content pages
- `GET /api/admin/content/uk/blogs`
- `POST /api/admin/content/uk/blogs`
- `GET /api/admin/content/uk/blogs/:id`
- `PATCH /api/admin/content/uk/blogs/:id`
- `DELETE /api/admin/content/uk/blogs/:id`
- `GET /api/admin/content/uk/updates`
- `POST /api/admin/content/uk/updates`
- `GET /api/admin/content/uk/updates/:id`
- `PATCH /api/admin/content/uk/updates/:id`
- `DELETE /api/admin/content/uk/updates/:id`
- `GET /api/admin/content/uk/programs`
- `POST /api/admin/content/uk/programs`
- `GET /api/admin/content/uk/programs/:id`
- `PATCH /api/admin/content/uk/programs/:id`
- `DELETE /api/admin/content/uk/programs/:id`
- `GET /api/admin/content/uk/careers`
- `POST /api/admin/content/uk/careers`
- `GET /api/admin/content/uk/careers/:id`
- `PATCH /api/admin/content/uk/careers/:id`
- `DELETE /api/admin/content/uk/careers/:id`
- `GET /api/admin/content/uk/contacts`
- `GET /api/admin/content/uk/contacts/:id`
- `PATCH /api/admin/content/uk/contacts/:id/status`
- `DELETE /api/admin/content/uk/contacts/:id`

### 15.7 US content pages
- `GET /api/admin/content/us/blogs`
- `POST /api/admin/content/us/blogs`
- `GET /api/admin/content/us/blogs/:id`
- `PATCH /api/admin/content/us/blogs/:id`
- `DELETE /api/admin/content/us/blogs/:id`
- `GET /api/admin/content/us/updates`
- `POST /api/admin/content/us/updates`
- `GET /api/admin/content/us/updates/:id`
- `PATCH /api/admin/content/us/updates/:id`
- `DELETE /api/admin/content/us/updates/:id`
- `GET /api/admin/content/us/programs`
- `POST /api/admin/content/us/programs`
- `GET /api/admin/content/us/programs/:id`
- `PATCH /api/admin/content/us/programs/:id`
- `DELETE /api/admin/content/us/programs/:id`
- `GET /api/admin/content/us/careers`
- `POST /api/admin/content/us/careers`
- `GET /api/admin/content/us/careers/:id`
- `PATCH /api/admin/content/us/careers/:id`
- `DELETE /api/admin/content/us/careers/:id`
- `GET /api/admin/content/us/contacts`
- `GET /api/admin/content/us/contacts/:id`
- `PATCH /api/admin/content/us/contacts/:id/status`
- `DELETE /api/admin/content/us/contacts/:id`

### 15.8 Nigeria content pages
- `GET /api/admin/content/nigeria/blogs`
- `POST /api/admin/content/nigeria/blogs`
- `GET /api/admin/content/nigeria/blogs/:id`
- `PATCH /api/admin/content/nigeria/blogs/:id`
- `DELETE /api/admin/content/nigeria/blogs/:id`
- `GET /api/admin/content/nigeria/updates`
- `POST /api/admin/content/nigeria/updates`
- `GET /api/admin/content/nigeria/updates/:id`
- `PATCH /api/admin/content/nigeria/updates/:id`
- `DELETE /api/admin/content/nigeria/updates/:id`
- `GET /api/admin/content/nigeria/programs`
- `POST /api/admin/content/nigeria/programs`
- `GET /api/admin/content/nigeria/programs/:id`
- `PATCH /api/admin/content/nigeria/programs/:id`
- `DELETE /api/admin/content/nigeria/programs/:id`
- `GET /api/admin/content/nigeria/careers`
- `POST /api/admin/content/nigeria/careers`
- `GET /api/admin/content/nigeria/careers/:id`
- `PATCH /api/adimin/content/nigeria/careers/:id`
- `DELETE /api/admin/content/nigeria/careers/:id`
- `GET /api/admin/content/nigeria/contacts`
- `GET /api/admin/content/nigeria/contacts/:id`
- `PATCH /api/admin/content/nigeria/contacts/:id/status`
- `DELETE /api/admin/content/nigeria/contacts/:id`
- `GET /api/admin/content/nigeria/hero-contents`
- `POST /api/admin/content/nigeria/hero-contents`
- `GET /api/admin/content/nigeria/hero-contents/:id`
- `PATCH /api/admin/content/nigeria/hero-contents/:id`
- `DELETE /api/admin/content/nigeria/hero-contents/:id`
- `GET /api/admin/content/nigeria/resources`
- `POST /api/admin/content/nigeria/resources`
- `GET /api/admin/content/nigeria/resources/:id`
- `PATCH /api/admin/content/nigeria/resources/:id`
- `DELETE /api/admin/content/nigeria/resources/:id`

---

## 16. Backend implementation notes that matter for this UI

### 16.1 Search behavior
Search is visible in:
- users
- security logs
- content list endpoints should support it even if not yet surfaced everywhere

Recommended behavior:
- case-insensitive partial match
- search across title, slug, summary, category, tags for content
- search across name, email, subject, message for contacts

### 16.2 Tags format
UI currently behaves like a simple text input.
Backend should return tags as array and frontend can join/split with commas.

### 16.3 Rich text storage
The editor is rich text HTML. Backend should store `content` as sanitized HTML.

### 16.4 Images
Current UI uses an image URL field, not file upload.
<!-- So the minimum requirement is to accept `imageUrl`.
If file upload is added later, introduce:
- `POST /api/admin/uploads/image` -->
pls lets not use url lets use images.. although we are going to setUp Cloudinary, then on the databse, were saving the cloudinary url, then the img is gonna be going to cloudinary
### 16.5 Audit trail
Every create/update/delete/status change should write an audit event because the security page already implies audit visibility.

### 16.6 Permissions
Minimum recommended permission model:
- `super_admin`
- `platform_admin`
- `editor`

And every request should be checked against `managedRegions`.

### 16.7 Country-scoped access rules
- user with `managedRegions: ["all"]` can access everything
- user with `managedRegions: ["uk"]` can only access UK content and UK contacts
- user with `managedRegions: ["us"]` can only access US content and US contacts
- user with `managedRegions: ["nigeria"]` can only access Nigeria content and Nigeria contacts

---

## 17. Recommended minimum delivery order for backend

If backend wants to ship this in phases, build in this order:

### Phase 1
- auth endpoints
- `GET /api/admin/auth/me`
- dashboard overview
- users CRUD

### Phase 2
- UK, US, Nigeria content CRUD for `blogs`, `updates`, `programs`, `careers`
- country contacts list / detail / status / delete

### Phase 3
- Nigeria `hero-contents`
- Nigeria `resources`
- security logs
- settings

---

## 18. Public website endpoint structure

These are the endpoints the public websites should use to fetch data.

### 18.1 Public API principles
- Public websites must use `/api/public/*`, not `/api/admin/*`.
- Public APIs are unauthenticated.
- Public APIs must return only website-safe and published data.
- Public detail endpoints should prefer `slug`.
- Public APIs should be cache-friendly.
- Public APIs should support future multi-country websites using a shared `:country` segment.

### 18.2 Public country values
- `uk`
- `us`
- `nigeria`

### 18.3 Recommended public namespace
- `GET /api/public/:country/site-config`
- `GET /api/public/:country/home`
- `GET /api/public/:country/about/*`
- `GET /api/public/:country/blogs`
- `GET /api/public/:country/blogs/:slug`
- `GET /api/public/:country/programs`
- `GET /api/public/:country/programs/:slug`
- `GET /api/public/:country/initiatives`
- `GET /api/public/:country/resources`
- `GET /api/public/:country/resources/:slug`
- `GET /api/public/:country/careers`
- `GET /api/public/:country/careers/:slug`
- `GET /api/public/:country/contact-info`
- `POST /api/public/:country/contact`

### 18.4 Public site config
**GET** `/api/public/:country/site-config`

This should return website-global data such as:
- navigation
- footer links
- office contact information
- social links
- SEO defaults

#### Response
```json
{
  "country": "nigeria",
  "siteName": "PPDC",
  "tagline": "Promoting transparency and accountability",
  "contact": {
    "email": "procurement@ppdc.org",
    "phone": "+2348124668828",
    "address": "Block L, Plot 625, Admiralty Estate, Navy Town, Asokoro Extension, Abuja"
  },
  "socials": [],
  "navigation": [],
  "footer": []
}
```

### 18.5 Public homepage endpoint
**GET** `/api/public/:country/home`

This should aggregate the sections needed by the homepage.

#### Recommended response shape
```json
{
  "country": "nigeria",
  "heroSlides": [],
  "stats": [],
  "programHighlights": [],
  "partners": [],
  "featuredBlogs": []
}
```

#### Mapping from admin-managed content
- Nigeria `hero-contents` can feed `heroSlides`
- admin `blogs` can feed `featuredBlogs`
- admin `programs` can feed `programHighlights`
- admin/public stats source can feed `stats`
- partners source can feed `partners`

### 18.6 Public about endpoints
- `GET /api/public/:country/about/overview`
- `GET /api/public/:country/about/history`
- `GET /api/public/:country/about/impact`
- `GET /api/public/:country/about/leadership`
- `GET /api/public/:country/about/programs`
- `GET /api/public/:country/about/reports`
- `GET /api/public/:country/about/what-we-do`

These endpoints should return the exact data blocks needed by the website sections under `/about`.

### 18.7 Public blogs endpoints
**GET** `/api/public/:country/blogs?page=1&limit=9&search=&category=&tag=&featured=`

Only return published blog records.

**GET** `/api/public/:country/blogs/:slug`

#### Public blog item shape
```json
{
  "slug": "leveraging-open-data-for-transparent-public-procurement",
  "title": "Leveraging Open Data for Transparent Public Procurement",
  "excerpt": "How open data standards are transforming the way we track government spending and ensure accountability.",
  "content": "<p>...</p>",
  "imageUrl": "https://cdn.example.com/blog.jpg",
  "publishDate": "2026-03-30",
  "author": "PPDC Communications",
  "category": "Transparency",
  "tags": ["Open Data", "Procurement"],
  "readTime": "5 min read"
}
```

### 18.8 Public programs endpoints
**GET** `/api/public/:country/programs?page=1&limit=20&search=&category=&featured=`

**GET** `/api/public/:country/programs/:slug`

Programs should expose only website-safe published fields.

### 18.9 Public initiatives endpoints
**GET** `/api/public/:country/initiatives`

This is useful for pages like `/initiatives` and homepage initiative highlights.

### 18.10 Public resources endpoints
**GET** `/api/public/:country/resources?page=1&limit=20&category=&search=`

**GET** `/api/public/:country/resources/:slug`

Recommended public resource categories based on the current website structure:
- `foi-report`
- `our-reports`
- `online-safety`
- `case-studies`
- `curriculum`
- `infographics`
- `policy-briefs`
- `press-release`
- `what-the-court-says`

### 18.11 Public careers endpoints
**GET** `/api/public/:country/careers?page=1&limit=20&status=open|closed|`

**GET** `/api/public/:country/careers/:slug`

Only open or publicly visible careers should be returned.

### 18.12 Public stats and partners endpoints
If the frontend prefers separate homepage section fetches instead of one aggregate `/home` endpoint, expose:

- `GET /api/public/:country/stats`
- `GET /api/public/:country/partners`

### 18.13 Public contact endpoints
**GET** `/api/public/:country/contact-info`

Returns public contact details displayed on the website.

**POST** `/api/public/:country/contact`

#### Request
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "General Inquiry",
  "message": "I would like to learn more about your work."
}
```

#### Response
```json
{
  "message": "Contact submission received",
  "submissionId": "msg_123"
}
```

#### Security requirements for public contact submission
- rate limit per IP and per identifier
- CAPTCHA or Cloudflare Turnstile / reCAPTCHA
- payload validation
- spam filtering
- optional moderation queue
- logging and alerting for abuse patterns

### 18.14 Exact public endpoint groups by page

#### Homepage
- `GET /api/public/:country/site-config`
- `GET /api/public/:country/home`

#### About pages
- `GET /api/public/:country/about/overview`
- `GET /api/public/:country/about/history`
- `GET /api/public/:country/about/impact`
- `GET /api/public/:country/about/leadership`
- `GET /api/public/:country/about/programs`
- `GET /api/public/:country/about/reports`
- `GET /api/public/:country/about/what-we-do`

#### Blog pages
- `GET /api/public/:country/blogs`
- `GET /api/public/:country/blogs/:slug`

#### Program pages
- `GET /api/public/:country/programs`
- `GET /api/public/:country/programs/:slug`

#### Initiatives page
- `GET /api/public/:country/initiatives`

#### Resources pages
- `GET /api/public/:country/resources`
- `GET /api/public/:country/resources/:slug`

#### Careers page
- `GET /api/public/:country/careers`
- `GET /api/public/:country/careers/:slug`

#### Contact page
- `GET /api/public/:country/contact-info`
- `POST /api/public/:country/contact`

---

## 19. Swagger authorization and security enforcement

Swagger should clearly separate public and admin APIs.

### 19.1 Swagger security scheme
Define one bearer auth scheme for admin routes.

#### Recommended scheme
- name: `bearerAuth`
- type: `http`
- scheme: `bearer`
- bearer format: `JWT`

### 19.2 How Swagger should behave
- all `/api/admin/*` protected routes should show the lock icon
- all `/api/public/*` routes should remain open and should not require authorization in Swagger
- auth endpoints like login/forgot-password/reset-password should remain open

### 19.3 Swagger usage flow for admin testing
1. Call `POST /api/admin/auth/login`
2. Copy the `accessToken`
3. Click `Authorize` in Swagger
4. Paste `Bearer <token>` or the raw token depending on Swagger setup
5. Call protected `/api/admin/*` routes

### 19.4 Security enforcement rules in code
- apply auth guard to all admin routes by default
- explicitly mark only public endpoints as public
- apply role checks after authentication
- apply region checks after role checks
- reject inactive admins even if token is valid

### 19.5 Recommended Swagger grouping
- tag admin endpoints as `Admin - Auth`, `Admin - Users`, `Admin - Dashboard`, `Admin - Content`, `Admin - Security`, `Admin - Settings`
- tag public endpoints as `Public - Site`, `Public - Blogs`, `Public - Programs`, `Public - Resources`, `Public - Contact`

### 19.6 Production security recommendations
- do not leave Swagger fully public in production
- either disable Swagger in production or protect it behind admin auth
- log all admin access to Swagger
- consider IP allowlisting for Swagger in production environments

### 19.7 Additional hardening recommendations
- short-lived access tokens
- refresh token rotation
- audit log for admin create/update/delete actions
- rate limiting on auth endpoints
- lockout or cooldown on repeated failed logins
- server-side validation for all payloads
- output filtering so public APIs cannot leak drafts or internal metadata

---

## 20. Final recommendation

If backend wants the cleanest implementation, use this final pattern everywhere:

- auth under `/api/admin/auth/*`
- operations under `/api/admin/dashboard`, `/api/admin/users`, `/api/admin/security`, `/api/admin/settings`
- all country-managed data under `/api/admin/content/:country/:resource`
- all website-facing data under `/api/public/:country/*`

For internal backend code organization, use:

- global modules for shared admin concerns
- a shared `content` module with country folders inside it
- reusable shared content services/validation/repositories
- country-specific folders only where country-specific behavior exists
- a separate public delivery layer that returns only website-safe published content

That structure matches the current admin navigation exactly, gives the public websites safe fetch endpoints, and keeps UK, US, and Nigeria fully predictable for both frontend and backend teams.
