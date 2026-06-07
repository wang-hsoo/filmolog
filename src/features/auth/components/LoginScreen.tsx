import { Image } from 'react-native';
import { LOGIN_IMAGE } from '../constants';
import styled from 'styled-components/native';
import { useLogin } from '../hooks/useLogin';

function LoginScreen() {
    const { loginWithGoogle, isLoading } = useLogin();

    return (
        <>
            <Image source={LOGIN_IMAGE.login} style={{ width: '100%', height: '100%', flex: 1 }} />

            <ButtonWrap>
                <Button onPress={loginWithGoogle} disabled={isLoading}>
                    <Image source={LOGIN_IMAGE.google} style={{ width: 20, height: 20 }} />
                    <ButtonText>{isLoading ? '로그인 중...' : '구글로 로그인'}</ButtonText>
                </Button>
            </ButtonWrap>
        </>
    );
}

export default LoginScreen;

const ButtonWrap = styled.View`
    position: absolute;
    bottom: 100px;
    left: 0;
    right: 0;
    align-items: center;
`;

const Button = styled.TouchableOpacity`
    width: 80%;
    height: 55px;
    border-radius: 16px;
    background-color: ${({ theme }) => theme.colors.buttonColor};
    z-index: 100;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 10px;
`;

const ButtonText = styled.Text`
    font-size: 18px;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.defaultText};
`;