import { getSupabaseClient } from "../client";


export async function createCollection(userId: string, name: string, description: string, theme_id: string) {
    const supabase = getSupabaseClient();
    
    // 💡 [디버깅 추가] 현재 클라이언트의 실제 토큰 상태 확인
    const { data: { session } } = await supabase.auth.getSession();
    console.log("1. Supabase가 인식한 현재 로그인 유저 ID:", session?.user?.id);
    console.log("2. 데이터에 넣은 userId:", userId);
    console.log("3. 두 ID가 일치하는가?:", session?.user?.id === userId);

    // 기존 insert 코드...
    const { data, error } = await supabase.from('collections').insert({
        user_id: userId,
        name: name,
        description: description,
        theme_id: theme_id,
    }).select().single();

    if (error) {
        throw error;
    }

    return data;
}

export async function addCollectionMovie(collectionId: string, movieId: string) {
    const { data, error } = await getSupabaseClient().from('collection_movies').insert({
        collection_id: collectionId,
        movie_id: movieId
    }).select().single();

    if (error) {
        throw error;
    }

    return data;
}

export async function getCollections(userId: string) {
    const { data, error } = await getSupabaseClient().from('collections').select('*').eq('user_id', userId);
    if (error) {
        throw error;
    }
    return data;
}