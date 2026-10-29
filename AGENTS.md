# Project Guidance

## User Preferences

- Temática LEGO con las franquicias Ninjago, Star Wars, Chima y Scooby-Doo, más una sección variada
- Interfaz en español

## Accepted Requirements

[Filled after each deployed build — what the user asked for and the build delivered]

## Verified Commands

- **typecheck**: `pnpm typecheck`
- **fix**: `pnpm fix`
- **build**: `pnpm build`

## Learnings

- Backend auth is email/password token sessions (registerCustomer/signIn/signOut) in src/backend/lib/customers.mo, not Internet Identity; signIn must write sessionExpiry alongside sessions or resolveSession drops the token.
- getMyProfile/getMyPurchases must be update funcs because resolveSession refreshes the 30-minute inactivity expiry and a query discards writes.
- Keep criterion wording in shared constants in src/frontend/src/lib/validation.ts (INVALID_EMAIL_MESSAGE, SHORT_PASSWORD_MESSAGE) so UI text matches the accepted contract exactly.
- TanStack typed router rejects literal '/tema/ninjago'; use to='/tema/$themeId' with params={{themeId}}.
- Session expiresAt and lockout until are nanosecond bigints; convert with Number(value/1_000_000n) before storing or formatting.
- Under Enhanced Migration extend the single pending migration's NewActor with every new stable field; mops check --fix strips redundant Map.empty type args (M0223).
- MapEntity.toEntityManual<K, V> needs both type args; generated OQL files under src/backend/generated may be overwritten by regeneration.
- Guard decorative animations with motion-safe: so they respect prefers-reduced-motion.
