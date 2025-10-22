import { useMemo } from "react";
import type { LeaderboardUser, TransformedUser } from "@/lib/types/leaderboard";

/**
 * this hook takes raw leaderboard data and transforms it into
 * two sorted lists: one by profit and one by return.
 */
export const useSortedLeaderboards = (leaderboardData: LeaderboardUser[]) => {

    // step 1: transform the raw api data into the shape the ui needs
    const transformedUsers = useMemo((): TransformedUser[] => {
        return leaderboardData.map(user => ({
            rank: user.rank,
            first_name: user.first_name,
            last_name: user.last_name,
            username: user.username,
            return: user.return_percentage, // rename
            profit: user.return_amount      // rename
        }));
    }, [leaderboardData]);

    // step 2: create a list sorted by profit
    const profitLeaderboard = useMemo(() => {
        // create a new array so we don't mutate the transformed list
        const sortedList = [...transformedUsers];
        sortedList.sort((a, b) => b.profit - a.profit);
        return sortedList;
    }, [transformedUsers]);

    // step 3: create a list sorted by return
    const returnLeaderboard = useMemo(() => {
        const sortedList = [...transformedUsers];
        sortedList.sort((a, b) => b.return - a.return);
        return sortedList;
    }, [transformedUsers]);

    return { profitLeaderboard, returnLeaderboard };
};
