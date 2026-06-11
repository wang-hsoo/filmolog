import { useMutation, useQuery } from "@tanstack/react-query";
import { addCollectionMovie, createCollection, getCollections } from "./collection";
import { queryClient } from "../../queryClient";

export interface CreateCollectionParams {
    userId: string;
    name: string;
    description: string;
    theme_id: string;
}

export const useCreateCollection = () => {
    return useMutation({
        mutationFn: ({ userId, name, description, theme_id }: CreateCollectionParams) => createCollection(userId, name, description, theme_id),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['collections'] });
            queryClient.invalidateQueries({ queryKey: ['userStats'] });
            return data;
        },
        onError: (error) => {
            console.error(error);
        },
    });
}

export const useAddCollectionMovie = () => {
    return useMutation({
        mutationFn: ({ collectionId, tmdbId }: { collectionId: string, tmdbId: number }) => addCollectionMovie(collectionId, tmdbId),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['collections'] });
            return data;
        },
    });
}

export const useGetCollections = (userId: string) => {
    return useQuery({
        queryKey: ['collections', userId],
        queryFn: () => getCollections(userId),
        enabled: !!userId,
    });
}