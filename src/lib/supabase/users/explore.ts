import { getSupabaseClient } from '../client';

export type UserFavoriteGenres = {
    preferred_genres: number[];
}

export async function getUserFavoriteGenres(userId: string) {
    const { data, error } = await getSupabaseClient()
        .from('users')
        .select('preferred_genres')
        .eq('id', userId)
        .maybeSingle();

    if (error) {
        throw error;
    }

    return data;
}