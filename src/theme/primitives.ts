import styled from 'styled-components/native';

export const AppScreen = styled.View`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.appBackground};
`;

export const AppLoadingScreen = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.appBackground};
`;
