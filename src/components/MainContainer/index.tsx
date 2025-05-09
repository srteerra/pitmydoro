import { Grid, GridItem } from "@chakra-ui/react";

export const MainContainer = ({ children }: any) => {
  return (
    <Grid templateColumns="2fr 42fr 2fr">
      <GridItem colStart={2}>
        {children}
      </GridItem>
    </Grid>
  );
}