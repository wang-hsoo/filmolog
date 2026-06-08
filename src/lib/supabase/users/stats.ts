import { getSupabaseClient } from '../client';

export type UserStats = {
    avgRating: number;
    collectionCount: number;
    reviewCount: number;
    wishlistCount: number;
}

/**
 *  홈, 프로필 유저 대시보드 ( 평가한 영화, 컬렉션, 위시리스트, 평균평점 )
 * @param userId 
 * @returns 
 */
export async function getUserStats(
    userId: string
): Promise<UserStats | null> {
    const { data, error } = await getSupabaseClient().rpc('get_user_dashboard_stats', {
        target_user_id: userId,
    });

    if (error) {
        throw error;
    }

    return data;
}