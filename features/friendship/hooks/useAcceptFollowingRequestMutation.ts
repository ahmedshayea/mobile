import useAuthClient from "@/hooks/useAuthClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FollowingRequest } from "../types";
import { acceptFollowingRequest } from "../requests";
import { FOLLOWING_REQUESTS_TO_ME_KEY } from "./useFollowingRequestsToMe";
import * as Burnt from "burnt";
import { t } from "i18next";
import { FRIENDS_QUERY_KEY } from "./useFriendsQuery";
import { CursorPaginatedResponse } from "@/types/responses";
import { InfiniteData } from "@tanstack/react-query";
import { useSnackbar } from "@/contexts/SnackbarContext";
import { filterPage } from "../utils";

export default function useAcceptFollowingRequestMutation() {
  const client = useAuthClient();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: FollowingRequest["id"]) =>
      acceptFollowingRequest(client, requestId),

    onSuccess: (_data, requestId) => {
      qc.setQueriesData(
        { queryKey: FOLLOWING_REQUESTS_TO_ME_KEY },
        (
          oldData:
            | InfiniteData<CursorPaginatedResponse<FollowingRequest>>
            | undefined
        ) => {
          if (!oldData) {
            return oldData;
          }

          return {
            ...oldData,
            pages: oldData.pages.map((page) =>
              filterPage<FollowingRequest>(page, (request) => {
                return request.id !== requestId;
              })
            ),
          };
        }
      );

      Burnt.toast({
        title: t("success_accept_following_request"),
        haptic: "success",
      });
    },
    onError: () => {
      Burnt.toast({
        title: t("failed_accept_following_request"),
      });
    },
    onSettled: () => {
      // invalidate both friends query ( followers, followings )
      qc.invalidateQueries({ queryKey: FRIENDS_QUERY_KEY });
    },
  });
}
