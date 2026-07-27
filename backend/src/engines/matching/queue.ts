export const buildQueue = (drivers: any[]) => {
  return drivers
    .sort((a, b) => {
      const aScore = a.rating || 5;
      const bScore = b.rating || 5;
      return bScore - aScore;
    })
    .slice(0, 5);
};

