import { describe, it, expect, beforeEach } from 'vitest';
import { GET as getProfiles, POST as createProfile } from '@/app/api/profiles/route';
import {
  GET as getProfileById,
  PUT as updateProfileById,
  DELETE as deleteProfileById,
} from '@/app/api/profiles/[id]/route';
import { container } from '@/infrastructure/ServiceContainer';

describe('Profiles API Route Handlers', () => {
  beforeEach(async () => {
    await container.userProfileRepo.delete('sofia-barista');
  });

  it('GET /api/profiles returns list with pre-seeded Carlos', async () => {
    const res = await getProfiles();
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(Array.isArray(json.data)).toBe(true);

    const carlos = json.data.find((p: { id: string }) => p.id === 'carlos');
    expect(carlos).toBeDefined();
    expect(carlos.name).toBe('Carlos');
    expect(carlos.role).toBe('admin');
  });

  it('PUT /api/profiles/[id] updates Carlos settings & active coffee', async () => {
    const req = new Request('http://localhost/api/profiles/carlos', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        activeCoffeeId: 'coffee-sanjorge-dutra',
        language: 'en',
        basketDoseGrams: 19.0,
      }),
    });

    const res = await updateProfileById(req, { params: Promise.resolve({ id: 'carlos' }) });
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.activeCoffeeId).toBe('coffee-sanjorge-dutra');
    expect(json.data.language).toBe('en');
    expect(json.data.basketDoseGrams).toBe(19.0);

    // Verify it persists via GET
    const getRes = await getProfileById(new Request('http://localhost/api/profiles/carlos'), {
      params: Promise.resolve({ id: 'carlos' }),
    });
    const getJson = await getRes.json();
    expect(getJson.data.activeCoffeeId).toBe('coffee-sanjorge-dutra');
    expect(getJson.data.basketDoseGrams).toBe(19.0);
  });

  it('POST /api/profiles creates a new profile', async () => {
    const req = new Request('http://localhost/api/profiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Sofia Barista',
        role: 'user',
        language: 'es',
      }),
    });

    const res = await createProfile(req);
    expect(res.status).toBe(201);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.id).toBe('sofia-barista');
    expect(json.data.name).toBe('Sofia Barista');
  });

  it('DELETE /api/profiles/[id] deletes profile when acting as admin', async () => {
    // 1. Create temporary profile
    const createReq = new Request('http://localhost/api/profiles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Sofia Barista', role: 'user' }),
    });
    await createProfile(createReq);

    // 2. Delete as admin Carlos
    const delReq = new Request('http://localhost/api/profiles/sofia-barista', {
      method: 'DELETE',
      headers: {
        'x-user-role': 'admin',
        'x-user-id': 'carlos',
      },
    });
    const delRes = await deleteProfileById(delReq, {
      params: Promise.resolve({ id: 'sofia-barista' }),
    });
    expect(delRes.status).toBe(200);

    const delJson = await delRes.json();
    expect(delJson.success).toBe(true);

    // Verify it is gone
    const found = await container.userProfileRepo.findById('sofia-barista');
    expect(found).toBeNull();
  });
});
