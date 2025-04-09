import { useQuery } from "@tanstack/react-query";
import { bananaFarmClient } from "../../services/movement-client";

const useFarmVerifiedCollections = () => {
  return useQuery({
    queryKey: ["banana_farm_verified_collections"],
    queryFn: async () => {
      return await bananaFarmClient.view.get_verified_collections({
        functionArguments: [],
        typeArguments: [],
      });
    },
    staleTime: 1000 * 60 * 60 * 24,
    enabled: true,
  });
};

export default useFarmVerifiedCollections;
