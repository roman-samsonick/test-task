/** Деньги и коэффициенты выводятся с двумя знаками — и в купоне, и в списке событий. */
export const money = (value: number): string => value.toFixed(2);
