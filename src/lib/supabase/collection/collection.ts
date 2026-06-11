import { getSupabaseClient } from '../client';

import type { Collection } from './types';

export async function createCollection(
  userId: string,
  name: string,
  description: string,
  theme_id: string,
) {
  const { data, error } = await getSupabaseClient()
    .from('collections')
    .insert({
      user_id: userId,
      name,
      description,
      theme_id,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function addCollectionMovie(
  collectionId: string,
  tmdbId: number,
) {
  const { data, error } = await getSupabaseClient()
    .from('collection_movies')
    .insert({
      collection_id: collectionId,
      tmdb_id: tmdbId,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getCollections(userId: string): Promise<Collection[]> {
  const { data, error } = await getSupabaseClient()
    .from('collections')
    .select('id, user_id, name, description, theme_id, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as Collection[];
}
