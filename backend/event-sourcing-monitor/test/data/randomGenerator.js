    // Rx.Observable.interval(5000).subscribe(() => {
    //   const users = ["Felipe", "Esteban", "Daniel", "Sebas", "Camilo", "Leon"];
    //   const agreggateTypes = ["Device", "Cronjob", "Business", "Clearing"];
    //   const versions = ["1_Beta", "2_Beta", "1_alfa"];
    //   const eventTypes = ["DeviceConnected", "DeviceRamuUsageAlarmActivated", "DeviceCpuAlarmActivated"]

    //   const evt = {
    //     et: eventTypes[Math.floor(Math.random() * eventTypes.length)],
    //     etv: versions[Math.floor(Math.random() * versions.length)],
    //     at: agreggateTypes[Math.floor(Math.random() * agreggateTypes.length)],
    //     user: users[Math.floor(Math.random() * users.length)],
    //     timestamp: Date.now(),
    //     _id: "1"
    //   };

    //   eventSourcingMonitor.handleEventToCumulate$(evt)
    //   .subscribe(
    //     (r) => {  },
    //     (error) => console.log(error),
    //     () => {}
    //   );
    // });