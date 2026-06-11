import { useMutation, useQuery } from "@tanstack/react-query";
import {
    addCollectionMovie,
    createCollection,
    getCollectionDetail,
    getCollectionListItems,
    getCollections,
    removeCollectionMovie,
} from "./collection";
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
            queryClient.invalidateQueries({ queryKey: ['collectionList'] });
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
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['collections'] });
            queryClient.invalidateQueries({ queryKey: ['collectionList'] });
            queryClient.invalidateQueries({
                queryKey: ['collectionDetail', variables.collectionId],
            });
            return data;
        },
    });
}

export const useRemoveCollectionMovie = () => {
    return useMutation({
        mutationFn: ({ collectionId, tmdbId }: { collectionId: string, tmdbId: number }) =>
            removeCollectionMovie(collectionId, tmdbId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['collections'] });
            queryClient.invalidateQueries({ queryKey: ['collectionList'] });
            queryClient.invalidateQueries({
                queryKey: ['collectionDetail', variables.collectionId],
            });
            queryClient.invalidateQueries({ queryKey: ['userStats'] });
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

export const useGetCollectionListItems = (userId: string) => {
    return useQuery({
        queryKey: ['collectionList', userId],
        queryFn: () => getCollectionListItems(userId),
        enabled: !!userId,
    });
}

export const useGetCollectionDetail = (collectionId: string) => {
    return useQuery({
        queryKey: ['collectionDetail', collectionId],
        queryFn: () => getCollectionDetail(collectionId),
        enabled: !!collectionId,
    });
}