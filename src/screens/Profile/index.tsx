import { Feather } from '@expo/vector-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView } from 'react-native';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { useTheme } from 'styled-components';
import * as ImagePicker from 'expo-image-picker';
import * as Yup from 'yup';
import { useNetInfo } from '@react-native-community/netinfo';
import { BackButton } from '../../components/BackButton';
import { Input } from '../../components/Input';
import { PasswordInput } from '../../components/PasswordInput';
import { useAuth } from '../../hooks/auth';

import {
  Container,
  Header,
  HeaderTop,
  HeaderTitle,
  LogoutButton,
  PhotoContainer,
  Photo,
  PhotoButton,
  Content,
  Options,
  Option,
  OptionTitle,
  Section,
} from './styles';
import Button from '../../components/Button';

export function Profile() {
  const { user, signOut, updateUser } = useAuth();
  const netInfo = useNetInfo();

  const [option, setOption] = useState<'dataEdit' | 'passwordEdit'>('dataEdit');
  const [avatar, setAvatar] = useState(user.avatar);
  const [name, setName] = useState(user.name);
  const [driver_license, setDriverLicense] = useState(user.driver_license);

  const theme = useTheme();
  const navigation = useNavigation();

  function handleBack() {
    navigation.goBack();
  }

  function handleOptionChange(optionSelected: 'dataEdit' | 'passwordEdit') {
    if (netInfo.isConnected === false && optionSelected === 'passwordEdit') {
      Alert.alert('Erro!', 'Conecte-se para mudar a senha');
    } else {
      setOption(optionSelected);
    }
  }

  async function handleAvatarSelect() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 1,
    });

    if (result.cancelled) {
      return;
    }

    if (result.uri) {
      setAvatar(result.uri);
    }
  }

  async function handleProfileUpdate() {
    try {
      const schema = Yup.object().shape({
        driver_license: Yup.string().required('CNH é obrigatória'),
        name: Yup.string().required('Nome é obrigatório'),
      });

      const data = { name, driver_license };
      await schema.validate(data);

      await updateUser({
        id: user.id,
        user_id: user.user_id,
        email: user.email,
        name,
        driver_license,
        avatar,
        token: user.token,
      });

      Alert.alert('Perfil atualizado');
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        Alert.alert('Opa', error.message);
      } else {
        Alert.alert('Não foi possível atualizar o perfil');
      }
    }
  }

  async function handleSignOut() {
    Alert.alert(
      'Atenção!',
      'Para entrar novamente o dispositivo precisa  estar conectado a internet. Deseja continuar?',
      [
        {
          text: 'Cancelar',
          onPress: () => {},
        },
        {
          text: 'Sair',
          onPress: () => signOut(),
        },
      ],
    );
  }

  return (
    // <KeyboardAvoidingView behavior="position" enabled>
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <Container>
        <Header>
          <HeaderTop>
            <BackButton color={theme.colors.shape} onPress={handleBack} />

            <HeaderTitle>Editar Perfil</HeaderTitle>

            <LogoutButton onPress={handleSignOut}>
              <Feather name="power" size={24} color={theme.colors.shape} />
            </LogoutButton>
          </HeaderTop>

          <PhotoContainer>
            {!!avatar && <Photo source={{ uri: avatar }} />}

            <PhotoButton onPress={handleAvatarSelect}>
              <Feather name="camera" size={24} color={theme.colors.shape} />
            </PhotoButton>
          </PhotoContainer>
        </Header>

        <Content>
          <Options>
            <Option
              active={option === 'dataEdit'}
              onPress={() => handleOptionChange('dataEdit')}
            >
              <OptionTitle active={option === 'dataEdit'}>Dados</OptionTitle>
            </Option>
            <Option
              active={option === 'passwordEdit'}
              onPress={() => handleOptionChange('passwordEdit')}
            >
              <OptionTitle active={option === 'passwordEdit'}>
                Trocar senha
              </OptionTitle>
            </Option>
          </Options>

          {option === 'dataEdit' ? (
            <Section>
              <Input
                iconName="user"
                placeholder="Nome"
                autoCorrect={false}
                defaultValue={user.name}
                onChangeText={setName}
              />
              <Input
                iconName="mail"
                autoCorrect={false}
                defaultValue={user.email}
              />
              <Input
                iconName="credit-card"
                placeholder="CNH"
                keyboardType="numeric"
                defaultValue={user.driver_license}
                onChangeText={setDriverLicense}
              />
            </Section>
          ) : (
            <Section>
              <PasswordInput iconName="lock" placeholder="Senha atual" />
              <PasswordInput iconName="lock" placeholder="Nova senha" />
              <PasswordInput iconName="lock" placeholder="Repetir senha" />
            </Section>
          )}

          <Button title="Salvar alterações" onPress={handleProfileUpdate} />
        </Content>
      </Container>
    </TouchableWithoutFeedback>
    // </KeyboardAvoidingView>
  );
}
