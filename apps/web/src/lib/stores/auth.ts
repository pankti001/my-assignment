import { writable } from 'svelte/store';
import { goto } from '$app/navigation';

export type User = {
  name: string;
  email: string;
};

export const user = writable<User | null>(null);

export async function loadUser(): Promise<void> {
  try {
    const res = await fetch('/api/me');
    if (res.ok) {
      const data = await res.json();
      user.set(data.user);
    } else {
      user.set(null);
    }
  } catch {
    user.set(null);
  }
}