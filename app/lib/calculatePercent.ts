
export const calculatePercent = (total: number, feeAmount: number) => {
    const result = (feeAmount * 100) / total;
    return Number(result.toFixed(2));
}