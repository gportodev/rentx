import React, { useEffect, useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import Animated, {
  Extrapolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  interpolate,
} from 'react-native-reanimated';
import { getStatusBarHeight } from 'react-native-iphone-x-helper';
import { StatusBar, StyleSheet } from 'react-native';
import { useTheme } from 'styled-components';
import { useNetInfo } from '@react-native-community/netinfo';
import { BackButton } from '../../components/BackButton';
import { ImageSlider } from '../../components/ImageSlider';
import { Accessory } from '../../components/Accessory';
import { Button } from '../../components/Button';
import { Car as ModelCar } from '../../database/model/Car';

import { getAccessoryIcon } from '../../utils/getAccessoryIcon';

import {
  Container,
  Header,
  Details,
  Description,
  Brand,
  Name,
  Rent,
  Period,
  Price,
  About,
  Acessories,
  Footer,
  CarImages,
  OfflineInfo,
} from './styles';

import { CarDTO } from '../../dtos/CarDTO';
import api from '../../services/api';

interface Params {
  car: ModelCar;
}

export function CarDetails() {
  const [carUpdated, setCarUpdated] = useState<CarDTO>({} as CarDTO);
  const navigation = useNavigation();
  const route = useRoute();
  const { car } = route.params as Params;
  const theme = useTheme();
  const netInfo = useNetInfo();

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler(event => {
    scrollY.value = event.contentOffset.y;
  });

  const headerStyleAnimation = useAnimatedStyle(() => {
    return {
      height: interpolate(
        scrollY.value,
        [0, 200],
        [200, 70],
        Extrapolate.CLAMP,
      ),
    };
  });

  const sliderCarsStyleAnimation = useAnimatedStyle(() => {
    return {
      opacity: interpolate(scrollY.value, [0, 150], [1, 0], Extrapolate.CLAMP),
    };
  });

  function handleConfirmRental() {
    navigation.navigate('Scheduling', { car });
  }

  function handleBack() {
    navigation.goBack();
  }

  const styles = StyleSheet.create({
    header: {
      position: 'absolute',
      overflow: 'hidden',
      zIndex: 1,
    },
  });

  useEffect(() => {
    async function fetchCarUpdated() {
      const response = await api.get(`/cars/${car.id}`);
      setCarUpdated(response.data);
    }

    if (netInfo.isConnected) {
      fetchCarUpdated();
    }
  }, [netInfo.isConnected]);

  return (
    <Container>
      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor="transparent"
      />
      <Animated.View
        style={[
          headerStyleAnimation,
          styles.header,
          { backgroundColor: theme.colors.background_secondary },
        ]}
      >
        <Header>
          <BackButton onPress={handleBack} />
        </Header>

        <Animated.View style={sliderCarsStyleAnimation}>
          <CarImages>
            <ImageSlider
              imagesUrl={
                carUpdated.photos
                  ? carUpdated.photos
                  : [{ id: car.thumbnail, photo: car.thumbnail }]
              }
            />
          </CarImages>
        </Animated.View>
      </Animated.View>

      <Animated.ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: getStatusBarHeight() + 160,
        }}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        <Details>
          <Description>
            <Brand>{car.brand}</Brand>
            <Name>{car.name}</Name>
          </Description>

          <Rent>
            <Period>{car.period}</Period>
            <Price>R$ {netInfo.isConnected === true ? car.price : '...'}</Price>
          </Rent>
        </Details>

        {carUpdated.accessories && (
          <Acessories>
            {carUpdated.accessories.map(accessory => (
              <Accessory
                key={accessory.type}
                name={accessory.name}
                icon={getAccessoryIcon(accessory.type)}
              />
            ))}
          </Acessories>
        )}

        <About>{car.about}</About>
      </Animated.ScrollView>
      <Footer>
        <Button
          title="Continuar"
          onPress={handleConfirmRental}
          enabled={netInfo.isConnected === true}
        />

        {netInfo.isConnected === false && (
          <OfflineInfo>
            Conecte-se novamente para ver mais detalhes e agendar o seu carro
          </OfflineInfo>
        )}
      </Footer>
    </Container>
  );
}
