export const findNearestDriver = (drivers: any[], origin: any) => {
  if (!drivers.length) return null;

  const distance = (a: any, b: any) => {
    return Math.sqrt(
      Math.pow(a.lat - b.lat, 2) + Math.pow(a.lng - b.lng, 2)
    );
  };

  let nearest = drivers[0];
  let minDist = distance(nearest.location, origin);

  for (const d of drivers) {
    const dist = distance(d.location, origin);
    if (dist < minDist) {
      minDist = dist;
      nearest = d;
    }
  }

  return nearest;
};