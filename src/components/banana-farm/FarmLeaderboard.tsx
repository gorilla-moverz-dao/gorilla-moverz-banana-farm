import { Spinner, Table, TableContainer, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import BoxBlurred from "../BoxBlurred";
import useMovement from "../../hooks/useMovement";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

function FarmLeaderboard() {
  const data = useQuery(api.leaderboard.queryLeaderboard);
  const isLoading = data === undefined;
  const { truncateAddress } = useMovement();
  if (isLoading) return <Spinner />;

  return (
    <>
      <BoxBlurred padding={2}>
        <TableContainer>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Address</Th>
                <Th isNumeric>Bananas</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data?.map((item, index) => (
                <Tr key={index}>
                  <Td>{item.discord_user_name ?? truncateAddress(item.wallet_address)}</Td>
                  <Td isNumeric>{item.banana_count}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </BoxBlurred>
    </>
  );
}

export default FarmLeaderboard;
