# Smart UMKM AI REST API

The application API is a same-origin Next.js Route Handler interface. It uses the existing Supabase Auth cookie session and the server-side Supabase client. Send JSON bodies with `Content-Type: application/json` where a request has a body. Do not send `user_id`; the server derives ownership from the verified session.

## Response format

Success responses use `{ "data": ..., "error": null }`. List responses may include `meta` with `limit` and `offset`. Errors use `{ "data": null, "error": { "code": "...", "message": "..." } }`.

## Authenticated workspace endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| GET, POST | `/api/products` | List the current user's products; create a product |
| GET, PATCH, DELETE | `/api/products/{id}` | Read, update, or delete one owned product |
| GET, POST | `/api/finance` | List the current user's cash flows; create a transaction |
| GET, PATCH, DELETE | `/api/finance/{id}` | Read, update, or delete one owned transaction |
| GET, PATCH | `/api/profile` | Read or save the current user's business profile |

List routes accept `limit` (1–1000, default 1000) and `offset` (default 0). Product bodies accept `name`, `category`, `price`, `cost_price`, and `stock`. Transaction bodies accept `type` (`income` or `expense`), `amount`, `category`, and `description`. Profile bodies accept `store_name`, `category`, and `location`. PATCH accepts only fields in the corresponding schema. The server rejects unknown fields, invalid numbers, oversized JSON, and attempts to set owner IDs.

Every database query is scoped to the `user_id` returned by `auth.getUser()`. Single-record endpoints apply the ownership filter to the database operation and respond with 404 when the row is missing or owned by someone else. The Supabase service-role key is not used by these handlers.

## AI endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/api/ai/predictions` | Generate a product prediction from the caller's saved products |
| POST | `/api/ai/insights` | Generate bundling, promotion, and pricing recommendations |
| POST | `/api/ai/promotions` | Generate a promotion strategy from the caller's saved products |
| POST | `/api/ai/business-ideas` | Generate three ideas from validated capital, interest, and location inputs |

Product-based AI handlers ignore client-supplied product data. They query up to 500 products for the authenticated `user_id`, then send only the selected product fields to the active Groq provider. The ideas handler accepts only its bounded input fields. `GROQ_API_KEY` is server-only; `GROQ_MODEL` is optional and defaults to `openai/gpt-oss-120b`. Provider failures return a sanitized error and do not expose the key or raw provider response. These calls may incur provider usage costs.

The previous `/api/groq/analytic`, `/api/groq/insights`, and `/api/groq/ideas` paths remain as aliases for compatibility. New client code uses `/api/ai/*`.

## Demo isolation

`/demo/*` continues to read the local fixture through `lib/data/workspace-data.ts`. Demo mutations are rejected in the data layer; Demo pages do not call these authenticated REST endpoints or AI endpoints. AI buttons in Demo continue to show local fixture results.

## Deployment and security prerequisites

1. Apply and verify the reviewed database preparation migration so `products.user_id`, `cash_flows.user_id`, and `profiles` exist. Do not backfill existing dummy rows; keep their `user_id` null.
2. Deploy the reviewed security migration only after inspecting the existing policies/privileges and confirming its preflight checks. Verify RLS and grants in Supabase Dashboard.
3. Deploy the application and configure the public Supabase URL/anon key and server-only `GROQ_API_KEY` (optional `GROQ_MODEL`). Never expose a service-role key to the browser.
4. Test with two authenticated users: each must list/change only their own rows; null-owner legacy rows must not appear; anonymous requests must return 401; Demo must work without a session and make no Supabase request.

The route handlers add session checks and owner filters, but they do not replace database RLS. This repository change does not run migrations or prove that RLS is active. Do not treat multi-user isolation as production-secure until the migrations are applied and cross-user tests pass.
