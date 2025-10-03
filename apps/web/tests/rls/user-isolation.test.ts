import { describe, it } from 'vitest';

describe('RLS: User Data Isolation', () => {
  // TODO: implement when RLS tables and helpers are available

  // TODO: Uncomment and implement when tables with RLS policies exist

  /*
  let user1Data: any;
  let user2Data: any;

  beforeEach(async () => {
    // Create test data for both users using admin client
    user1Data = await createTestData(adminClient, user1Id, 'profiles', {
      name: 'User 1',
      email: 'user1@test.com',
    });

    user2Data = await createTestData(adminClient, user2Id, 'profiles', {
      name: 'User 2',
      email: 'user2@test.com',
    });
  });

  afterEach(async () => {
    // Cleanup test data
    await cleanupTestData(adminClient, user1Id, 'profiles');
    await cleanupTestData(adminClient, user2Id, 'profiles');
  });

  it('user can only read their own data', async () => {
    const user1Client = createTestUser(user1Id);

    const { data, error } = await user1Client
      .from('profiles')
      .select()
      .eq('id', user1Data.id)
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data.user_id).toBe(user1Id);
  });

  it('user cannot read other user data', async () => {
    const user1Client = createTestUser(user1Id);

    const { data, error } = await user1Client
      .from('profiles')
      .select()
      .eq('id', user2Data.id)
      .single();

    // Should either return null or error (depending on RLS implementation)
    expect(data).toBeNull();
  });

  it('user cannot update other user data', async () => {
    const user1Client = createTestUser(user1Id);

    const { error } = await user1Client
      .from('profiles')
      .update({ name: 'Hacked!' })
      .eq('id', user2Data.id);

    expect(error).toBeDefined();
    expect(error?.message).toContain('permission');
  });

  it('user cannot delete other user data', async () => {
    const user1Client = createTestUser(user1Id);

    const { error } = await user1Client
      .from('profiles')
      .delete()
      .eq('id', user2Data.id);

    expect(error).toBeDefined();
    expect(error?.message).toContain('permission');
  });

  it('anonymous users cannot access any data', async () => {
    // Create anonymous client (no auth)
    const anonClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await anonClient
      .from('profiles')
      .select();

    expect(data).toEqual([]);
  });
  */

  it.todo('user can only read their own data');
  it.todo('user cannot read other user data');
  it.todo('user cannot update other user data');
  it.todo('user cannot delete other user data');
  it.todo('anonymous users cannot access any data');
});
