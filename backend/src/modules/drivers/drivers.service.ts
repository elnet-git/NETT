export class DriversService {
  private drivers: any[] = [];

  goOnline(driverId: string, location: any) {
    let driver = this.drivers.find(d => d.id === driverId);

    if (!driver) {
      driver = {
        id: driverId,
        status: "ONLINE",
        location,
      };
      this.drivers.push(driver);
    } else {
      driver.status = "ONLINE";
      driver.location = location;
    }

    return driver;
  }

  goOffline(driverId: string) {
    const driver = this.drivers.find(d => d.id === driverId);
    if (driver) driver.status = "OFFLINE";
  }

  getAvailableDrivers() {
    return this.drivers.filter(d => d.status === "ONLINE");
  }

  updateLocation(driverId: string, location: any) {
    const driver = this.drivers.find(d => d.id === driverId);
    if (driver) driver.location = location;
  }
}