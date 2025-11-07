# DeonPay Dashboard - Proyecto B

Dashboard protegido con rutas dinámicas por merchantId para gestionar pagos y transacciones.

## 🎯 Objetivo

Panel de control protegido que permite a los usuarios gestionar su cuenta de comerciante después de autenticarse en el landing. Todas las rutas están protegidas y requieren sesión válida.

## 🏗️ Arquitectura

```
┌──────────────────────────────────────────────────────┐
│               deonpay.mx (Landing)                    │
│                   Login/Signup                        │
└──────────────────────────────────────────────────────┘
                          │
                          │ Redirect after login
                          ▼
┌──────────────────────────────────────────────────────┐
│         dashboard.deonpay.mx/{merchantId}             │
│              (Protected Dashboard)                    │
│                                                       │
│  Routes:                                              │
│  ├─ /{merchantId}/general                            │
│  ├─ /{merchantId}/transacciones                      │
│  ├─ /{merchantId}/clientes                           │
│  ├─ /{merchantId}/webhooks                           │
│  ├─ /{merchantId}/desarrolladores                    │
│  └─ /{merchantId}/cuenta                             │
└──────────────────────────────────────────────────────┘
                          ║
                          ║ Shared Session Cookies
                          ║ domain=.deonpay.mx
                          ▼
┌──────────────────────────────────────────────────────┐
│              Supabase PostgreSQL                      │
│  ├─ auth.users (managed by Supabase)                 │
│  ├─ merchants (id, owner_user_id, name)              │
│  └─ users_profile (user_id, default_merchant_id)     │
└──────────────────────────────────────────────────────┘
```

## 📦 Stack Tecnológico

| Categoría | Tecnología | Versión |
|-----------|-----------|---------|
| Framework | Next.js | 15.x |
| UI Library | React | 19.x |
| Language | TypeScript | 5.6.x |
| Styling | Tailwind CSS | 3.4.x |
| Icons | Lucide React | 0.454.x |
| Auth | Supabase | 2.45.x |
| SSR Auth | @supabase/ssr | 0.5.x |

## 🔐 Seguridad y Protección de Rutas

### Middleware (`middleware.ts`)

El middleware protege **TODAS** las rutas con el patrón `/:merchantId/:path*`:

1. **Verificación de sesión**: Revisa si hay un usuario autenticado
2. **Redirect si no hay sesión**: Redirige a `https://deonpay.mx/signin`
3. **Verificación de acceso al merchant**: Valida que el usuario sea owner del merchant
4. **Redirect a merchant por defecto**: Si no tiene acceso, lo redirige a su merchant

```typescript
// Matcher en middleware.ts
export const config = {
  matcher: ['/:merchantId/:path*'],
}
```

### Verificación a Nivel de Layout

El layout de `[merchantId]` también verifica:
- Sesión válida
- Acceso al merchantId (owner_user_id)
- Redirige si no tiene permisos

## 📁 Estructura del Proyecto

```
apps/dashboard/
├── app/
│   ├── [merchantId]/           # Rutas dinámicas por merchant
│   │   ├── layout.tsx          # Shell layout (Sidebar + Header)
│   │   ├── page.tsx            # Redirect a /general
│   │   ├── general/
│   │   │   └── page.tsx        # Dashboard home
│   │   ├── transacciones/
│   │   │   └── page.tsx        # Lista de transacciones
│   │   ├── clientes/
│   │   │   └── page.tsx        # Gestión de clientes
│   │   ├── webhooks/
│   │   │   └── page.tsx        # Configuración de webhooks
│   │   ├── desarrolladores/
│   │   │   └── page.tsx        # API keys y documentación
│   │   └── cuenta/
│   │       └── page.tsx        # Configuración de cuenta
│   ├── styles/
│   │   └── globals.css         # Estilos globales + Tailwind
│   └── layout.tsx              # Root layout
├── components/
│   ├── Sidebar.tsx             # Navegación lateral
│   └── Header.tsx              # Barra superior
├── lib/
│   └── supabase.ts             # Cliente Supabase SSR
├── middleware.ts               # Protección de rutas
├── next.config.js
├── tailwind.config.ts
├── postcss.config.js
├── tsconfig.json
└── package.json
```

## 🚀 Instalación y Configuración

### 1. Instalar Dependencias

```bash
cd apps/dashboard
npm install
```

### 2. Configurar Variables de Entorno

```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://exhjlvaocapbtgvqxnhr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_COOKIE_DOMAIN=.deonpay.local  # Para desarrollo local
```

### 3. Configurar Hosts Locales (Desarrollo)

Para probar cookies compartidas en subdominios:

**Windows**: Edita `C:\Windows\System32\drivers\etc\hosts`
**Mac/Linux**: Edita `/etc/hosts`

Añade:
```
127.0.0.1 deonpay.local
127.0.0.1 dashboard.deonpay.local
```

### 4. Iniciar Servidor de Desarrollo

```bash
npm run dev
```

El dashboard correrá en: **http://dashboard.deonpay.local:3001**

## 🧪 Testing del Flujo Completo

### Flujo de Autenticación

1. **Registrarse en el landing**:
   - Ve a `http://deonpay.local:3000/signup`
   - Crea una cuenta y verifica el email

2. **Iniciar sesión**:
   - Ve a `http://deonpay.local:3000/signin`
   - Inicia sesión con tus credenciales

3. **Redirección automática**:
   - Serás redirigido a `http://dashboard.deonpay.local:3001/{merchantId}/general`

4. **Navegar en el dashboard**:
   - Usa el sidebar para navegar entre secciones
   - Todas las rutas están protegidas

### Testing de Protección de Rutas

**Sin sesión**:
```bash
# Intenta acceder directamente al dashboard
http://dashboard.deonpay.local:3001/any-merchant-id/general

# Resultado esperado: Redirect a https://deonpay.mx/signin
```

**Con sesión pero merchant incorrecto**:
```bash
# Intenta acceder a un merchant que no te pertenece
http://dashboard.deonpay.local:3001/wrong-merchant-id/general

# Resultado esperado: Redirect a tu merchant por defecto
```

## 📄 Páginas Implementadas

### 1. General (`/{merchantId}/general`)
- **Descripción**: Dashboard home con métricas y resumen
- **Features**:
  - Cards de estadísticas (ventas, transacciones, clientes, tasa de éxito)
  - Lista de transacciones recientes
  - Acciones rápidas
  - Guía de primeros pasos

### 2. Transacciones (`/{merchantId}/transacciones`)
- **Descripción**: Historial de todas las transacciones
- **Features**:
  - Búsqueda y filtros
  - Tabla con detalles (ID, fecha, cliente, monto, estado, método)
  - Exportar a CSV/Excel
  - Vista previa con datos de ejemplo

### 3. Clientes (`/{merchantId}/clientes`)
- **Descripción**: Gestión de base de clientes
- **Features**:
  - Búsqueda de clientes
  - Estadísticas (total, activos, nuevos)
  - Tabla con información de clientes
  - Crear nuevo cliente

### 4. Webhooks (`/{merchantId}/webhooks`)
- **Descripción**: Configuración de webhooks
- **Features**:
  - Lista de webhooks configurados
  - Crear nuevo webhook
  - Eventos disponibles (payment.succeeded, payment.failed, etc.)
  - Links a herramientas de testing (webhook.site, ngrok)

### 5. Desarrolladores (`/{merchantId}/desarrolladores`)
- **Descripción**: Credenciales API y documentación
- **Features**:
  - Publishable Key y Secret Key
  - Modo test vs producción
  - Links a documentación
  - Ejemplos de código (Node.js, Python, PHP)
  - Snippet de código de ejemplo

### 6. Cuenta (`/{merchantId}/cuenta`)
- **Descripción**: Configuración de cuenta y perfil
- **Features**:
  - Información del negocio (nombre, RFC, dirección)
  - Información de usuario (email, nombre, teléfono)
  - Preferencias de notificaciones
  - Opciones de seguridad (cambiar contraseña, 2FA)
  - Facturación y planes
  - Zona de peligro (desactivar/eliminar cuenta)

## 🎨 UI/UX

### Componentes Principales

**Sidebar (`components/Sidebar.tsx`)**:
- Navegación colapsable
- Responsive (overlay en móvil)
- Iconos de Lucide React
- Indicador de ruta activa
- Muestra merchantId en el footer

**Header (`components/Header.tsx`)**:
- Breadcrumbs dinámicos
- Email del usuario
- Botón de cerrar sesión
- Responsive

**Layout Colors**:
```css
sidebar-bg: #0f172a (slate-900)
sidebar-hover: #1e293b (slate-800)
sidebar-active: #334155 (slate-700)
sidebar-text: #cbd5e1 (slate-300)
sidebar-text-active: #ffffff
```

### Utilidades CSS Custom

```css
.container-dashboard   # Max-width container
.card                 # Card component
.card-header          # Card header
.btn-primary          # Primary button
.btn-secondary        # Secondary button
.input-field          # Form input
.label-field          # Form label
```

## 🔄 Flujo de Datos

### Obtener Información del Merchant

```typescript
// En cualquier página server component
import { createClient } from '@/lib/supabase'

export default async function Page({ params }: { params: Promise<{ merchantId: string }> }) {
  const { merchantId } = await params
  const supabase = await createClient()

  const { data: merchant } = await supabase
    .from('merchants')
    .select('*')
    .eq('id', merchantId)
    .single()

  // Renderizar con los datos
}
```

### Verificar Acceso al Merchant

```typescript
import { hasAccessToMerchant } from '@/lib/supabase'

const hasAccess = await hasAccessToMerchant(userId, merchantId)
if (!hasAccess) {
  // Denegar acceso
}
```

## 🔐 Control de Acceso por Merchant

### Implementación Actual

Actualmente, solo el **owner** del merchant tiene acceso:

```typescript
// En middleware.ts
const isOwner = merchant.owner_user_id === user.id
```

### Implementación Futura: merchant_members

Para permitir múltiples usuarios por merchant, crear tabla:

```sql
create table merchant_members (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid references merchants(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text check (role in ('owner', 'admin', 'member')),
  created_at timestamptz default now(),
  unique(merchant_id, user_id)
);

-- RLS
alter table merchant_members enable row level security;

create policy "Users can view their memberships"
  on merchant_members for select
  using (auth.uid() = user_id);
```

Luego actualizar `lib/supabase.ts`:

```typescript
// Descomentar en hasAccessToMerchant()
const { data: member } = await supabase
  .from('merchant_members')
  .select('id')
  .eq('merchant_id', merchantId)
  .eq('user_id', userId)
  .single()

return !!member
```

## 📊 Próximas Características

- [ ] **Transacciones reales**: Conectar a API de pagos
- [ ] **Gráficas**: Implementar charts con Recharts o Chart.js
- [ ] **Exportación**: CSV/Excel de transacciones y clientes
- [ ] **Búsqueda avanzada**: Filtros por fecha, monto, estado
- [ ] **Webhooks funcionales**: CRUD completo y testing
- [ ] **Team members**: Implementar merchant_members
- [ ] **Roles y permisos**: Admin, member con diferentes accesos
- [ ] **Notificaciones en tiempo real**: Con Supabase Realtime
- [ ] **Modo oscuro**: Toggle en settings
- [ ] **Multi-idioma**: i18n con next-intl

## 🚢 Deployment

### Preparación para Deployment

1. **Variables de entorno en Vercel**:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://exhjlvaocapbtgvqxnhr.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
   SUPABASE_COOKIE_DOMAIN=.deonpay.mx  # Producción
   ```

2. **Configurar dominio en Vercel**:
   - Añadir `dashboard.deonpay.mx`
   - Configurar DNS:
     ```
     CNAME: dashboard → cname.vercel-dns.com
     ```

3. **Verificar redirect URLs en Supabase**:
   - Añadir `https://dashboard.deonpay.mx/*` en Authentication > URL Configuration

### Deploy con Vercel CLI

```bash
cd apps/dashboard
vercel --prod
```

O conectar el repositorio de GitHub para CI/CD automático.

## 🐛 Troubleshooting

### Error: "No redirect to signin"

**Causa**: Middleware no está funcionando

**Solución**:
1. Verificar que `middleware.ts` existe en la raíz
2. Verificar el matcher: `['/:merchantId/:path*']`
3. Revisar logs en el navegador

### Error: "Cookies not shared"

**Causa**: Domain de cookies incorrecto

**Solución**:
1. Verificar `SUPABASE_COOKIE_DOMAIN=.deonpay.mx`
2. En desarrollo local, usar `.deonpay.local`
3. Verificar cookies en DevTools > Application > Cookies

### Error: "Can't access merchant"

**Causa**: Usuario no es owner del merchant

**Solución**:
1. Verificar en Supabase que el merchant pertenece al usuario
2. Revisar RLS policies
3. Verificar que `owner_user_id` coincide con `user.id`

### Error: "Redirect loop"

**Causa**: Middleware redirigiendo infinitamente

**Solución**:
1. Verificar que el matcher NO incluya rutas públicas
2. Revisar lógica de redirect en middleware
3. Asegurarse de que `default_merchant_id` existe

## 📚 Recursos

- **Next.js Documentation**: https://nextjs.org/docs
- **Supabase SSR Documentation**: https://supabase.com/docs/guides/auth/server-side/nextjs
- **Tailwind CSS Documentation**: https://tailwindcss.com/docs
- **Lucide Icons**: https://lucide.dev

## 🤝 Relación con Proyecto A (Landing)

Este dashboard **depende** del landing para:

1. **Autenticación**: Los usuarios se registran/inician sesión en el landing
2. **Merchant creation**: El landing crea el merchant al primer login
3. **Shared cookies**: Ambos usan `domain=.deonpay.mx`
4. **Redirect**: El landing redirige aquí después del login

**Flujo completo**:
```
Landing (signup) → Email verification → Landing (signin) →
API creates merchant → Redirect to dashboard.deonpay.mx/{merchantId}/general →
Middleware verifica sesión → Dashboard renderiza
```

## 📞 Soporte

- **Landing Project**: Ver `apps/landing/README.md`
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs

---

**DeonPay Dashboard** - Proyecto B © 2025
