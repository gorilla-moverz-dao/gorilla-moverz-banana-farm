import { useFarmLeaderboard } from "./useFarmLeaderboard";
import { Spinner, Table, TableContainer, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react";
import BoxBlurred from "../BoxBlurred";
import useMovement from "../../hooks/useMovement";
function FarmLeaderboard() {
  const { data, isLoading } = useFarmLeaderboard();
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
                  <Td>{item.discord_user_name ?? truncateAddress(item.owner_address)}</Td>
                  <Td isNumeric>{parseInt(item.amount) / Math.pow(10, 9)}</Td>
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
