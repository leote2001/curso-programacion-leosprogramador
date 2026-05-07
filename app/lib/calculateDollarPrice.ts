export const calculateDollarPrice = (priceARS: number, tasaDeConversión: number) => {
    const rawPrice = priceARS / tasaDeConversión;
    return rawPrice.toFixed(2);
}