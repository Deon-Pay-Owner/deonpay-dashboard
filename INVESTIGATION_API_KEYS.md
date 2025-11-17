# Investigación: Problema de API Keys no visibles en Dashboard

## FECHA DE INVESTIGACIÓN
2025-11-17

## PROBLEMA REPORTADO
1. La sección de API Keys del dashboard no muestra ninguna key
2. El resumen indica que hay 2 keys activas
3. Las keys existían antes pero desaparecieron de la interfaz
4. El usuario no puede ver ni regenerar las keys

## CAUSA RAÍZ IDENTIFICADA

El problema se debe a una **discrepancia entre el esquema de base de datos y el código del frontend**.

### Cambio de Esquema

Hubo una migración que cambió completamente el esquema de la tabla `api_keys`:

**ESQUEMA ANTIGUO** (20250116_api_keys.sql):
- Columna: `type` (valores: 'public' | 'secret')
- Columna: `key` (contenía la key completa en texto plano)
- Columna: `key_prefix` (prefijo de la key)

**ESQUEMA NUEVO** (20250116_fix_api_keys_schema.sql):
- Columna: `key_type` (valores: 'public' | 'secret')
- Columna: `public_key` (solo para keys públicas, texto plano)
- Columna: `secret_key_hash` (hash SHA-256 de la key secreta)
- Columna: `secret_key_prefix` (primeros 12 caracteres para mostrar)

### Impacto

El componente frontend en `app/[merchantId]/desarrolladores/page.tsx` estaba:
1. Consultando con `.select('*')` 
2. Esperando campos del esquema ANTIGUO (`type`, `key`, `key_prefix`)
3. Recibiendo campos del esquema NUEVO (`key_type`, `public_key`, `secret_key_hash`, `secret_key_prefix`)
4. Como resultado, el componente recibía datos pero no podía mapearlos correctamente

## ARCHIVOS AFECTADOS

### 1. `/apps/dashboard/app/[merchantId]/desarrolladores/page.tsx`
**Estado**: ✅ CORREGIDO
**Problema**: No mapeaba los campos del nuevo esquema
**Solución**: Agregado transformación de datos para mapear `key_type` → `type`, `public_key` → `key`, etc.

### 2. `/apps/dashboard/app/api/merchant/[merchantId]/api-key/route.ts`
**Estado**: ✅ ACTUALIZADO
**Problema**: Intentaba recuperar campo `key` que ya no existe
**Solución**: Actualizado para usar `public_key` y agregar nota sobre keys secretas

### 3. `/apps/dashboard/app/[merchantId]/desarrolladores/DesarrolladoresClient.tsx`
**Estado**: ✅ NO REQUIERE CAMBIOS
**Motivo**: Espera el formato correcto que ahora se mapea en la página server-side

### 4. Otros endpoints
Los siguientes ya estaban actualizados al nuevo esquema:
- `/apps/dashboard/app/api/keys/route.ts` ✅
- `/apps/dashboard/lib/webhook-auth.ts` ✅
- `/apps/dashboard/app/api/merchant/[merchantId]/regenerate-keys/route.ts` ✅

## SOLUCIÓN IMPLEMENTADA

### 1. Mapeo de datos (page.tsx)

```typescript
const apiKeys = rawApiKeys?.map(key => {
  if (key.key_type === 'public') {
    return {
      id: key.id,
      key: key.public_key || '',
      type: 'public' as const,
      name: key.name,
      is_active: key.is_active,
      last_used_at: key.last_used_at,
      created_at: key.created_at,
      key_prefix: 'pk_live_'
    }
  } else {
    // For secret keys, we can only show the prefix
    return {
      id: key.id,
      key: key.secret_key_prefix ? key.secret_key_prefix + '•'.repeat(28) : 'sk_live_••••••••••••••••••••••••••••',
      type: 'secret' as const,
      name: key.name,
      is_active: key.is_active,
      last_used_at: key.last_used_at,
      created_at: key.created_at,
      key_prefix: key.secret_key_prefix || 'sk_live_'
    }
  }
}) || []
```

### 2. Logging para debug

Se agregaron console.log temporales para facilitar el debugging:
- Log de datos crudos desde DB
- Log de datos transformados
- Log de errores de Supabase

## ROW LEVEL SECURITY (RLS)

Las políticas RLS están correctamente configuradas:

```sql
CREATE POLICY "Merchants can view their own API keys"
  ON api_keys
  FOR SELECT
  USING (
    merchant_id IN (
      SELECT id FROM merchants WHERE owner_user_id = auth.uid()
    )
  );
```

## LIMITACIONES DEL NUEVO ESQUEMA

**IMPORTANTE**: Con el nuevo esquema, las **secret keys** ya NO se pueden recuperar después de ser creadas porque:
1. Solo se guarda el hash SHA-256, no el valor original
2. El hash es irreversible por seguridad
3. Solo se puede mostrar el prefijo (primeros 12 caracteres)

**Consecuencias**:
- Los usuarios solo pueden ver la key secreta completa al momento de generarla
- Para obtener una nueva key secreta completa, deben usar "Regenerar Keys"
- Esto es una mejora de seguridad (similar a Stripe, GitHub, etc.)

## PRÓXIMOS PASOS RECOMENDADOS

1. **Testing**: Verificar que las keys se muestren correctamente en el dashboard
2. **Cleanup**: Remover los console.log de debugging una vez confirmado
3. **Documentación**: Actualizar docs para usuarios sobre el cambio de comportamiento
4. **Migración**: Considerar crear una migración para regenerar keys de usuarios existentes
5. **UX**: Agregar modal/alerta cuando se regeneran keys mostrando la nueva secret key una sola vez

## ARCHIVOS MODIFICADOS

1. `apps/dashboard/app/[merchantId]/desarrolladores/page.tsx` - Agregado mapeo de esquema
2. `apps/dashboard/app/api/merchant/[merchantId]/api-key/route.ts` - Actualizado a nuevo esquema

## ARCHIVOS DE BACKUP

- `apps/dashboard/app/[merchantId]/desarrolladores/page.tsx.backup` - Versión original antes de cambios
