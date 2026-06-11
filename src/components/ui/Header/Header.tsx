import styled, { useTheme } from 'styled-components/native';
import Icon from 'react-native-vector-icons/Feather';
import { ArchivePageHeader } from '../archive';

function Header({ title, navigation }: { title?: string, navigation?: any }) {
    const theme = useTheme();

    const handleGoBack = () => {
        navigation.goBack();
    }

    return (
        <Container>
            <Icon name="arrow-left" size={24} color={theme.colors.primary} onPress={handleGoBack} />
            <HeaderTitle>
                {title || ''}
            </HeaderTitle>
        </Container>
    )
}

export default Header;


const Container = styled.View`
    width: 100%;
    padding: 10px 20px;
    gap: 10px;
    flex-direction: row;
    align-items: center;
`;

const HeaderTitle = styled.Text`
  flex: 1;
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 20px;
  letter-spacing: 0.5px;
  color: ${({ theme }) => theme.colors.headerTitle};
`;