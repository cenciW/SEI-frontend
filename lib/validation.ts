import { VALIDATION_RANGES } from "./constants";

// Heurística 5: Prevenção de erros
export const validateInputs = (
  moisture: string,
  rain: string,
  temp: string,
  humidity: string,
  potSize: string,
  isPot: boolean
): string | null => {
  const moistureNum = parseFloat(moisture);
  const rainNum = parseFloat(rain);
  const tempNum = parseFloat(temp);
  const humidityNum = parseFloat(humidity);

  if (
    isNaN(moistureNum) ||
    moistureNum < VALIDATION_RANGES.MOISTURE.MIN ||
    moistureNum > VALIDATION_RANGES.MOISTURE.MAX
  ) {
    return `Umidade do solo deve estar entre ${VALIDATION_RANGES.MOISTURE.MIN}% e ${VALIDATION_RANGES.MOISTURE.MAX}%`;
  }
  if (isNaN(rainNum) || rainNum < VALIDATION_RANGES.RAIN.MIN) {
    return "Chuva não pode ser negativa";
  }
  if (
    isNaN(tempNum) ||
    tempNum < VALIDATION_RANGES.TEMPERATURE.MIN ||
    tempNum > VALIDATION_RANGES.TEMPERATURE.MAX
  ) {
    return `Temperatura deve estar entre ${VALIDATION_RANGES.TEMPERATURE.MIN}°C e ${VALIDATION_RANGES.TEMPERATURE.MAX}°C`;
  }
  if (
    isNaN(humidityNum) ||
    humidityNum < VALIDATION_RANGES.HUMIDITY.MIN ||
    humidityNum > VALIDATION_RANGES.HUMIDITY.MAX
  ) {
    return `Umidade do ar deve estar entre ${VALIDATION_RANGES.HUMIDITY.MIN}% e ${VALIDATION_RANGES.HUMIDITY.MAX}%`;
  }
  if (isPot) {
    const potSizeNum = parseFloat(potSize);
    if (isNaN(potSizeNum) || potSizeNum <= VALIDATION_RANGES.POT_SIZE.MIN) {
      return "Tamanho do vaso deve ser maior que zero";
    }
  }
  return null;
};
