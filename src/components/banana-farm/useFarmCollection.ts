import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

const useFarmCollection = (collectionId: string) => {
  return useQuery(api.collections.queryCollection, {
    collectionId,
  });
};

export default useFarmCollection;
