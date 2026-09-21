import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = process.env.NUXT_PUBLIC_SUPABASE_URL
const anon = process.env.NUXT_PUBLIC_SUPABASE_KEY
const secret = process.env.NUXT_SUPABASE_SECRET_KEY
const live = Boolean(url && anon && secret)

async function signUp(admin: SupabaseClient, email: string, name: string) {
  const { data, error } = await admin.auth.admin.createUser({ email, password: 'pw-123456', email_confirm: true, user_metadata: { full_name: name } })
  if (error) throw error
  const client = createClient(url!, anon!, { auth: { persistSession: false } })
  const { error: e2 } = await client.auth.signInWithPassword({ email, password: 'pw-123456' })
  if (e2) throw e2
  return { id: data.user.id, client }
}

describe.skipIf(!live)('row level security', () => {
  const admin = createClient(url!, secret!, { auth: { persistSession: false } })
  const stamp = Date.now()
  let a: { id: string; client: SupabaseClient }, b: { id: string; client: SupabaseClient }

  beforeAll(async () => {
    a = await signUp(admin, `a-${stamp}@test.local`, 'Alice Reader')
    b = await signUp(admin, `b-${stamp}@test.local`, 'Bob Reader')
    await admin.from('books').upsert({ id: 1, title: 'Test Book', author: 'Nobody' })
  })
  afterAll(async () => {
    await admin.auth.admin.deleteUser(a.id)
    await admin.auth.admin.deleteUser(b.id)
    await admin.from('books').delete().eq('id', 1)
  })

  it('creates a profile with a slug handle on sign-up', async () => {
    const { data } = await admin.from('profiles').select('handle').eq('id', a.id).single()
    expect(data!.handle).toBe('alice-reader')
  })
  it('deduplicates handles', async () => {
    const c = await signUp(admin, `c-${stamp}@test.local`, 'Alice Reader')
    const { data } = await admin.from('profiles').select('handle').eq('id', c.id).single()
    expect(data!.handle).toBe('alice-reader-2')
    await admin.auth.admin.deleteUser(c.id)
  })
  it('lets a user write only their own user_books', async () => {
    const own = await a.client.from('user_books').insert({ user_id: a.id, book_id: 1, status: 'read' })
    expect(own.error).toBeNull()
    const other = await a.client.from('user_books').insert({ user_id: b.id, book_id: 1, status: 'read' })
    expect(other.error).not.toBeNull()
  })
  it('exposes public profiles to anyone and hides private ones', async () => {
    const anonClient = createClient(url!, anon!, { auth: { persistSession: false } })
    const before = await anonClient.from('user_books').select('book_id').eq('user_id', a.id)
    expect(before.data).toHaveLength(1)
    await a.client.from('profiles').update({ is_public: false }).eq('id', a.id)
    const after = await anonClient.from('user_books').select('book_id').eq('user_id', a.id)
    expect(after.data).toHaveLength(0)
  })
  it('never lets clients write books or read jobs', async () => {
    const w = await a.client.from('books').insert({ id: 2, title: 'x', author: 'y' })
    expect(w.error).not.toBeNull()
    const j = await a.client.from('jobs').select('*')
    expect(j.data).toEqual([])
  })
})
